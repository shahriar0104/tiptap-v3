import { PrismaClient, Prisma, Upload } from '@prisma/client';
import { CreateUploadData, UpdateUploadData } from '../types';

export interface UploadModel {
  create(data: CreateUploadData): Promise<Upload>;
  findById(id: string): Promise<Upload | null>;
  findMany(skip?: number, take?: number): Promise<{ uploads: Upload[]; total: number }>;
  update(id: string, data: UpdateUploadData): Promise<Upload>;
  delete(id: string): Promise<void>;
  findByUploadedBy(uploadedById: string): Promise<Upload[]>;
}

export class UploadModelImpl implements UploadModel {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateUploadData): Promise<Upload> {
    const createValidator = Prisma.validator<Prisma.UploadCreateArgs>()({
      data: {
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        mimeType: data.mimeType,
        ...(data.uploadedById && {
          uploadedBy: {
            connect: { id: data.uploadedById }
          }
        })
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      }
    });

    return this.prisma.upload.create(createValidator);
  }

  async findById(id: string): Promise<Upload | null> {
    const findByIdValidator = Prisma.validator<Prisma.UploadFindUniqueArgs>()({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      }
    });

    return this.prisma.upload.findUnique(findByIdValidator);
  }

  async findMany(skip = 0, take = 10): Promise<{ uploads: Upload[]; total: number }> {
    const findManyValidator = Prisma.validator<Prisma.UploadFindManyArgs>()({
      include: {
        uploadedBy: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    const [uploads, total] = await Promise.all([
      this.prisma.upload.findMany(findManyValidator),
      this.prisma.upload.count()
    ]);

    return { uploads, total };
  }

  async update(id: string, data: UpdateUploadData): Promise<Upload> {
    const updateValidator = Prisma.validator<Prisma.UploadUpdateArgs>()({
      where: { id },
      data: {
        ...(data.fileName !== undefined && { fileName: data.fileName }),
        ...(data.fileUrl !== undefined && { fileUrl: data.fileUrl }),
        ...(data.mimeType !== undefined && { mimeType: data.mimeType })
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      }
    });

    return this.prisma.upload.update(updateValidator);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.upload.delete({
      where: { id }
    });
  }

  async findByUploadedBy(uploadedById: string): Promise<Upload[]> {
    const findByUploadedByValidator = Prisma.validator<Prisma.UploadFindManyArgs>()({
      where: { uploadedById },
      include: {
        uploadedBy: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return this.prisma.upload.findMany(findByUploadedByValidator);
  }
}
