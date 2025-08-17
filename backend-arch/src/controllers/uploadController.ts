import { Request, Response, NextFunction } from 'express';
import { UploadService } from '../services/uploadService';
import { AuthenticatedRequest } from '../types';
import { sendSuccess } from '../utils/response';
import { CreateUploadData, UpdateUploadData } from '../types';
import { BUCKET_NAME, uploadBuffer, createSignedUrl } from '../utils/storage';
import { ValidationError } from '../utils/errors';

interface CreateUploadInput extends CreateUploadData {}
interface UpdateUploadInput extends UpdateUploadData {}

export class UploadController {
  constructor(private uploadService: UploadService) {}

  createUpload = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const data = req.body as CreateUploadInput;

      const upload = await this.uploadService.createUpload(data, user.id);
      sendSuccess(res, upload, 'Upload created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  getUpload = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error('Upload ID is required');
      }

      const upload = await this.uploadService.getUploadById(id);
      sendSuccess(res, upload, 'Upload retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getUploads = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { page, limit } = req.query;
      const pageNum = page ? parseInt(page as string, 10) : 1;
      const limitNum = limit ? parseInt(limit as string, 10) : 10;

      const result = await this.uploadService.getUploads(pageNum, limitNum);

      sendSuccess(res, result, 'Uploads retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  updateUpload = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error('Upload ID is required');
      }
      const data = req.body as UpdateUploadInput;

      const upload = await this.uploadService.updateUpload(id, data);
      sendSuccess(res, upload, 'Upload updated successfully');
    } catch (error) {
      next(error);
    }
  };

  deleteUpload = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error('Upload ID is required');
      }

      await this.uploadService.deleteUpload(id);
      sendSuccess(res, null, 'Upload deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  getUserUploads = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;

      const uploads = await this.uploadService.getUserUploads(user.id);
      sendSuccess(res, uploads, 'User uploads retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  // POST /uploads/file - Multipart upload
  uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      if (!user) throw new ValidationError('Authentication required');

      const file = (req as any).file as
        | { buffer: Buffer; originalname: string; mimetype: string }
        | undefined;
      if (!file) {
        throw new ValidationError('No file uploaded. Use field name "file".');
      }

      // Optional scoping for storage path
      const { boardMeetingId, agendaItemId } = (req as any).body || {};
      const orgId = user.organizationId;

      const safeName = file.originalname.replace(/[^\w.\-]+/g, '_');
      const now = new Date();
      const yyyy = now.getUTCFullYear();
      const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(now.getUTCDate()).padStart(2, '0');
      const timestamp = now.getTime();

      const scopeParts = [
        orgId,
        boardMeetingId || 'general',
        agendaItemId || 'unassigned',
        `${yyyy}/${mm}/${dd}`,
      ];
      const storagePath = `${scopeParts.join('/')}/${timestamp}-${safeName}`;

      await uploadBuffer(BUCKET_NAME, storagePath, file.buffer, file.mimetype);

      // Persist metadata; store storage key in fileUrl for retrieval
      const upload = await this.uploadService.createUpload(
        {
          fileName: file.originalname,
          fileUrl: `${BUCKET_NAME}/${storagePath}`,
          mimeType: file.mimetype,
        },
        user.id
      );

      sendSuccess(res, upload, 'File uploaded successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  // GET /uploads/:id/signed-url - generate a signed URL for download
  getSignedUrl = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) throw new ValidationError('Upload ID is required');

      const upload = await this.uploadService.getUploadById(id);
      const storageRef = upload.fileUrl; // expected format: `${bucket}/${path}`
      const firstSlash = storageRef.indexOf('/');
      if (firstSlash <= 0 || firstSlash === storageRef.length - 1) {
        throw new ValidationError('Invalid storage reference for upload');
      }
      const bucket = storageRef.slice(0, firstSlash);
      const path = storageRef.slice(firstSlash + 1);

      const signedUrl = await createSignedUrl(bucket, path, 60 * 10);
      sendSuccess(res, { url: signedUrl }, 'Signed URL generated');
    } catch (error) {
      next(error);
    }
  };
}
