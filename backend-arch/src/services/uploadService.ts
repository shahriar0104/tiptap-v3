import { Upload } from '@prisma/client';
import { withModels, withTransactionModels } from '../utils/transaction';
import {
  CreateUploadData,
  UpdateUploadData,
  PaginatedResponse,
} from '../types';
import { NotFoundError, ValidationError } from '../utils/errors';

export interface UploadService {
  createUpload(data: CreateUploadData, userId: string): Promise<Upload>;
  getUploadById(id: string): Promise<Upload>;
  getUploads(page?: number, limit?: number): Promise<PaginatedResponse<Upload>>;
  updateUpload(id: string, data: UpdateUploadData): Promise<Upload>;
  deleteUpload(id: string): Promise<void>;
  getUserUploads(userId: string): Promise<Upload[]>;
}

export class UploadServiceImpl implements UploadService {
  constructor() {}

  async createUpload(data: CreateUploadData, userId: string): Promise<Upload> {
    // Validate required fields
    if (!data.fileName || !data.fileUrl || !data.mimeType) {
      throw new ValidationError('fileName, fileUrl, and mimeType are required');
    }

    // Set the uploadedById to the current user
    const uploadData: CreateUploadData = {
      ...data,
      uploadedById: userId,
    };

    return withTransactionModels(async ({ models }) => {
      return models.uploadModel.create(uploadData);
    });
  }

  async getUploadById(id: string): Promise<Upload> {
    if (!id) {
      throw new ValidationError('Upload ID is required');
    }

    const upload = await withModels(async ({ models }) =>
      models.uploadModel.findById(id)
    );
    if (!upload) {
      throw new NotFoundError('Upload not found');
    }

    return upload;
  }

  async getUploads(page = 1, limit = 10): Promise<PaginatedResponse<Upload>> {
    if (page < 1 || limit < 1) {
      throw new ValidationError('Page and limit must be positive numbers');
    }

    const skip = (page - 1) * limit;
    const result = await withModels(async ({ models }) =>
      models.uploadModel.findMany(skip, limit)
    );

    return {
      data: result.uploads,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async updateUpload(id: string, data: UpdateUploadData): Promise<Upload> {
    if (!id) {
      throw new ValidationError('Upload ID is required');
    }

    // Check if upload exists
    await this.getUploadById(id);

    // Validate update data
    if (Object.keys(data).length === 0) {
      throw new ValidationError(
        'At least one field must be provided for update'
      );
    }

    return withTransactionModels(async ({ models }) => {
      return models.uploadModel.update(id, data);
    });
  }

  async deleteUpload(id: string): Promise<void> {
    if (!id) {
      throw new ValidationError('Upload ID is required');
    }

    // Ensure existence and delete atomically
    await withTransactionModels(async ({ models }) => {
      const existing = await models.uploadModel.findById(id);
      if (!existing) {
        throw new NotFoundError('Upload not found');
      }
      await models.uploadModel.delete(id);
    });
  }

  async getUserUploads(userId: string): Promise<Upload[]> {
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    return withModels(async ({ models }) =>
      models.uploadModel.findByUploadedBy(userId)
    );
  }
}
