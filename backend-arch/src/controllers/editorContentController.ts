import { Request, Response, NextFunction } from 'express';
import { EditorContentService } from '../services/editorContentService';
import { sendSuccess } from '../utils/response';
import { CreateEditorContentData, UpdateEditorContentData } from '../types';

interface CreateEditorContentInput extends CreateEditorContentData {}
interface UpdateEditorContentInput extends UpdateEditorContentData {}

export class EditorContentController {
  constructor(private editorContentService: EditorContentService) {}

  createEditorContent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = req.body as CreateEditorContentInput;

      const content = await this.editorContentService.createEditorContent(data);
      sendSuccess(res, content, 'Editor content created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  getEditorContent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error('Editor content ID is required');
      }

      const content = await this.editorContentService.getEditorContentById(id);
      sendSuccess(res, content, 'Editor content retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getEditorContentByBoardMeeting = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { boardMeetingId } = req.params;
      if (!boardMeetingId) {
        throw new Error('Board meeting ID is required');
      }

      const contents =
        await this.editorContentService.getEditorContentByBoardMeeting(
          boardMeetingId
        );
      sendSuccess(res, contents, 'Editor contents retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getLatestEditorContent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { boardMeetingId } = req.params;
      if (!boardMeetingId) {
        throw new Error('Board meeting ID is required');
      }

      const content =
        await this.editorContentService.getLatestEditorContent(boardMeetingId);
      sendSuccess(res, content, 'Latest editor content retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  updateEditorContent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error('Editor content ID is required');
      }
      const data = req.body as UpdateEditorContentInput;

      const content = await this.editorContentService.updateEditorContent(
        id,
        data
      );
      sendSuccess(res, content, 'Editor content updated successfully');
    } catch (error) {
      next(error);
    }
  };

  createNewVersion = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { boardMeetingId } = req.params;
      if (!boardMeetingId) {
        throw new Error('Board meeting ID is required');
      }
      const { contentJson } = req.body;

      const content = await this.editorContentService.createNewVersion(
        boardMeetingId,
        contentJson
      );
      sendSuccess(
        res,
        content,
        'New editor content version created successfully',
        201
      );
    } catch (error) {
      next(error);
    }
  };

  deleteEditorContent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error('Editor content ID is required');
      }

      await this.editorContentService.deleteEditorContent(id);
      sendSuccess(res, null, 'Editor content deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
