import { Request, Response, NextFunction } from 'express';
import { SlideService } from '../services/slideService';
import { sendSuccess } from '../utils/response';
import { CreateSlideData, UpdateSlideData } from '../types';

interface CreateSlideInput extends CreateSlideData {}
interface UpdateSlideInput extends UpdateSlideData {}

export class SlideController {
  constructor(private slideService: SlideService) {}

  createSlide = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body as CreateSlideInput;

      const slide = await this.slideService.createSlide(data);
      sendSuccess(res, slide, 'Slide created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  getSlide = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error('Slide ID is required');
      }

      const slide = await this.slideService.getSlideById(id);
      sendSuccess(res, slide, 'Slide retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getSlidesByPresentation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { presentationId } = req.params;
      if (!presentationId) {
        throw new Error('Presentation ID is required');
      }

      const slides = await this.slideService.getSlidesByPresentation(presentationId);
      sendSuccess(res, slides, 'Slides retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getSlidesByAgendaItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { agendaItemId } = req.params;
      if (!agendaItemId) {
        throw new Error('Agenda item ID is required');
      }

      const slides = await this.slideService.getSlidesByAgendaItem(agendaItemId);
      sendSuccess(res, slides, 'Slides retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  updateSlide = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error('Slide ID is required');
      }
      const data = req.body as UpdateSlideInput;

      const slide = await this.slideService.updateSlide(id, data);
      sendSuccess(res, slide, 'Slide updated successfully');
    } catch (error) {
      next(error);
    }
  };

  deleteSlide = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error('Slide ID is required');
      }

      await this.slideService.deleteSlide(id);
      sendSuccess(res, null, 'Slide deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  reorderSlides = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { presentationId } = req.params;
      if (!presentationId) {
        throw new Error('Presentation ID is required');
      }
      const { slideIds } = req.body;

      await this.slideService.reorderSlides(presentationId, slideIds);
      sendSuccess(res, null, 'Slides reordered successfully');
    } catch (error) {
      next(error);
    }
  };
}
