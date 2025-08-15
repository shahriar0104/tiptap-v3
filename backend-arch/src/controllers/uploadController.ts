import { Request, Response, NextFunction } from 'express';
import { UploadService } from '../services/uploadService';
import { AuthenticatedRequest } from '../types';
import { sendSuccess } from '../utils/response';
import { CreateUploadData, UpdateUploadData } from '../types';

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
}
