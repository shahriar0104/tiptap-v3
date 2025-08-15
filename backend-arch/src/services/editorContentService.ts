import { EditorContent } from '@prisma/client';
import { withModels, withTransactionModels } from '../utils/transaction';
import { CreateEditorContentData, UpdateEditorContentData } from '../types';
import { NotFoundError, ValidationError } from '../utils/errors';

export interface EditorContentService {
  createEditorContent(data: CreateEditorContentData): Promise<EditorContent>;
  getEditorContentById(id: string): Promise<EditorContent>;
  getEditorContentByBoardMeeting(
    boardMeetingId: string
  ): Promise<EditorContent[]>;
  getLatestEditorContent(boardMeetingId: string): Promise<EditorContent | null>;
  updateEditorContent(
    id: string,
    data: UpdateEditorContentData
  ): Promise<EditorContent>;
  createNewVersion(
    boardMeetingId: string,
    contentJson: any
  ): Promise<EditorContent>;
  deleteEditorContent(id: string): Promise<void>;
}

export class EditorContentServiceImpl implements EditorContentService {
  constructor() {}

  async createEditorContent(
    data: CreateEditorContentData
  ): Promise<EditorContent> {
    // Validate required fields
    if (!data.boardMeetingId || !data.contentJson) {
      throw new ValidationError('boardMeetingId and contentJson are required');
    }

    return withTransactionModels(async ({ models }) => {
      return models.editorContentModel.create(data);
    });
  }

  async getEditorContentById(id: string): Promise<EditorContent> {
    if (!id) {
      throw new ValidationError('EditorContent ID is required');
    }

    const content = await withModels(async ({ models }) =>
      models.editorContentModel.findById(id)
    );
    if (!content) {
      throw new NotFoundError('EditorContent not found');
    }

    return content;
  }

  async getEditorContentByBoardMeeting(
    boardMeetingId: string
  ): Promise<EditorContent[]> {
    if (!boardMeetingId) {
      throw new ValidationError('Board meeting ID is required');
    }

    return withModels(async ({ models }) =>
      models.editorContentModel.findByBoardMeeting(boardMeetingId)
    );
  }

  async getLatestEditorContent(
    boardMeetingId: string
  ): Promise<EditorContent | null> {
    if (!boardMeetingId) {
      throw new ValidationError('Board meeting ID is required');
    }

    return withModels(async ({ models }) =>
      models.editorContentModel.findLatestByBoardMeeting(boardMeetingId)
    );
  }

  async updateEditorContent(
    id: string,
    data: UpdateEditorContentData
  ): Promise<EditorContent> {
    if (!id) {
      throw new ValidationError('EditorContent ID is required');
    }

    // Check if content exists
    await this.getEditorContentById(id);

    // Validate update data
    if (Object.keys(data).length === 0) {
      throw new ValidationError(
        'At least one field must be provided for update'
      );
    }

    return withTransactionModels(async ({ models }) => {
      return models.editorContentModel.update(id, data);
    });
  }

  async createNewVersion(
    boardMeetingId: string,
    contentJson: any
  ): Promise<EditorContent> {
    if (!boardMeetingId || !contentJson) {
      throw new ValidationError('boardMeetingId and contentJson are required');
    }

    return withTransactionModels(async ({ models }) => {
      // Get the latest version number inside the transaction for consistency
      const latestContent =
        await models.editorContentModel.findLatestByBoardMeeting(
          boardMeetingId
        );
      const nextVersion = latestContent ? latestContent.version + 1 : 1;

      // Create new version
      return models.editorContentModel.create({
        boardMeetingId,
        contentJson,
        version: nextVersion,
      });
    });
  }

  async deleteEditorContent(id: string): Promise<void> {
    if (!id) {
      throw new ValidationError('EditorContent ID is required');
    }

    // Ensure existence and delete atomically
    await withTransactionModels(async ({ models }) => {
      const content = await models.editorContentModel.findById(id);
      if (!content) {
        throw new NotFoundError('EditorContent not found');
      }
      await models.editorContentModel.delete(id);
    });
  }
}
