import { PrismaClient, Prisma, EditorContent } from '@prisma/client';
import { CreateEditorContentData, UpdateEditorContentData } from '../types';

export interface EditorContentModel {
  create(data: CreateEditorContentData): Promise<EditorContent>;
  findById(id: string): Promise<EditorContent | null>;
  findByBoardMeeting(boardMeetingId: string): Promise<EditorContent[]>;
  findLatestByBoardMeeting(
    boardMeetingId: string
  ): Promise<EditorContent | null>;
  update(id: string, data: UpdateEditorContentData): Promise<EditorContent>;
  delete(id: string): Promise<void>;
}

export class EditorContentModelImpl implements EditorContentModel {
  constructor(private prisma: PrismaClient | Prisma.TransactionClient) {}

  async create(data: CreateEditorContentData): Promise<EditorContent> {
    const createValidator = Prisma.validator<Prisma.EditorContentCreateArgs>()({
      data: {
        boardMeeting: {
          connect: { id: data.boardMeetingId },
        },
        contentJson:
          data.contentJson === null
            ? Prisma.JsonNull
            : (data.contentJson as Prisma.InputJsonValue),
        version: data.version || 1,
      },
      include: {
        boardMeeting: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return this.prisma.editorContent.create(createValidator);
  }

  async findById(id: string): Promise<EditorContent | null> {
    const findByIdValidator =
      Prisma.validator<Prisma.EditorContentFindUniqueArgs>()({
        where: { id },
        include: {
          boardMeeting: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

    return this.prisma.editorContent.findUnique(findByIdValidator);
  }

  async findByBoardMeeting(boardMeetingId: string): Promise<EditorContent[]> {
    const findByBoardMeetingValidator =
      Prisma.validator<Prisma.EditorContentFindManyArgs>()({
        where: { boardMeetingId },
        include: {
          boardMeeting: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { version: 'desc' },
      });

    return this.prisma.editorContent.findMany(findByBoardMeetingValidator);
  }

  async findLatestByBoardMeeting(
    boardMeetingId: string
  ): Promise<EditorContent | null> {
    const findLatestValidator =
      Prisma.validator<Prisma.EditorContentFindFirstArgs>()({
        where: { boardMeetingId },
        include: {
          boardMeeting: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { version: 'desc' },
      });

    return this.prisma.editorContent.findFirst(findLatestValidator);
  }

  async update(
    id: string,
    data: UpdateEditorContentData
  ): Promise<EditorContent> {
    const updateValidator = Prisma.validator<Prisma.EditorContentUpdateArgs>()({
      where: { id },
      data: {
        ...(data.contentJson !== undefined && {
          contentJson:
            data.contentJson === null
              ? Prisma.JsonNull
              : (data.contentJson as Prisma.InputJsonValue),
        }),
        ...(data.version !== undefined && { version: data.version }),
      },
      include: {
        boardMeeting: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return this.prisma.editorContent.update(updateValidator);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.editorContent.delete({
      where: { id },
    });
  }
}
