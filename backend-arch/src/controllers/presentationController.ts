import { Request, Response, NextFunction } from 'express';
import { PresentationService } from '../services/presentationService';
import { AuthenticatedRequest } from '../types';
import { sendSuccess } from '../utils/response';
import { CreatePresentationData, UpdatePresentationData } from '../types';

interface CreatePresentationInput extends CreatePresentationData {}
interface UpdatePresentationInput extends UpdatePresentationData {}

export class PresentationController {
  constructor(private presentationService: PresentationService) {}

  createPresentation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const data = req.body as CreatePresentationInput;

      const presentation = await this.presentationService.createPresentation(data, user.id);
      sendSuccess(res, presentation, 'Presentation created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  getPresentation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error('Presentation ID is required');
      }

      const presentation = await this.presentationService.getPresentationById(id);
      sendSuccess(res, presentation, 'Presentation retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getPresentationsByBoardMeeting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { boardMeetingId } = req.params;
      if (!boardMeetingId) {
        throw new Error('Board meeting ID is required');
      }

      const presentations = await this.presentationService.getPresentationsByBoardMeeting(boardMeetingId);
      sendSuccess(res, presentations, 'Presentations retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  updatePresentation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error('Presentation ID is required');
      }
      const data = req.body as UpdatePresentationInput;

      const presentation = await this.presentationService.updatePresentation(id, data);
      sendSuccess(res, presentation, 'Presentation updated successfully');
    } catch (error) {
      next(error);
    }
  };

  deletePresentation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error('Presentation ID is required');
      }

      await this.presentationService.deletePresentation(id);
      sendSuccess(res, null, 'Presentation deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
