import { Slide } from '@prisma/client';
import { SlideModel } from '../models/slideModel';
import { CreateSlideData, UpdateSlideData } from '../types';
import { NotFoundError, ValidationError } from '../utils/errors';

export interface SlideService {
  createSlide(data: CreateSlideData): Promise<Slide>;
  getSlideById(id: string): Promise<Slide>;
  getSlidesByPresentation(presentationId: string): Promise<Slide[]>;
  getSlidesByAgendaItem(agendaItemId: string): Promise<Slide[]>;
  updateSlide(id: string, data: UpdateSlideData): Promise<Slide>;
  deleteSlide(id: string): Promise<void>;
  reorderSlides(presentationId: string, slideIds: string[]): Promise<void>;
}

export class SlideServiceImpl implements SlideService {
  constructor(private slideModel: SlideModel) {}

  async createSlide(data: CreateSlideData): Promise<Slide> {
    // Validate required fields
    if (!data.presentationId || !data.kind || data.orderIndex === undefined) {
      throw new ValidationError('presentationId, kind, and orderIndex are required');
    }

    // Validate slide kind
    const validKinds = ['TITLE', 'SUMMARY', 'AGENDA_ITEM_SUMMARY', 'DETAIL'];
    if (!validKinds.includes(data.kind)) {
      throw new ValidationError('Invalid slide kind');
    }

    return this.slideModel.create(data);
  }

  async getSlideById(id: string): Promise<Slide> {
    if (!id) {
      throw new ValidationError('Slide ID is required');
    }

    const slide = await this.slideModel.findById(id);
    if (!slide) {
      throw new NotFoundError('Slide not found');
    }

    return slide;
  }

  async getSlidesByPresentation(presentationId: string): Promise<Slide[]> {
    if (!presentationId) {
      throw new ValidationError('Presentation ID is required');
    }

    return this.slideModel.findByPresentation(presentationId);
  }

  async getSlidesByAgendaItem(agendaItemId: string): Promise<Slide[]> {
    if (!agendaItemId) {
      throw new ValidationError('Agenda item ID is required');
    }

    return this.slideModel.findByAgendaItem(agendaItemId);
  }

  async updateSlide(id: string, data: UpdateSlideData): Promise<Slide> {
    if (!id) {
      throw new ValidationError('Slide ID is required');
    }

    // Check if slide exists
    await this.getSlideById(id);

    // Validate update data
    if (Object.keys(data).length === 0) {
      throw new ValidationError('At least one field must be provided for update');
    }

    // Validate slide kind if provided
    if (data.kind) {
      const validKinds = ['TITLE', 'SUMMARY', 'AGENDA_ITEM_SUMMARY', 'DETAIL'];
      if (!validKinds.includes(data.kind)) {
        throw new ValidationError('Invalid slide kind');
      }
    }

    return this.slideModel.update(id, data);
  }

  async deleteSlide(id: string): Promise<void> {
    if (!id) {
      throw new ValidationError('Slide ID is required');
    }

    // Check if slide exists
    await this.getSlideById(id);

    await this.slideModel.delete(id);
  }

  async reorderSlides(presentationId: string, slideIds: string[]): Promise<void> {
    if (!presentationId || !slideIds || slideIds.length === 0) {
      throw new ValidationError('presentationId and slideIds are required');
    }

    // Validate that all slides belong to the presentation
    const existingSlides = await this.slideModel.findByPresentation(presentationId);
    const existingSlideIds = existingSlides.map(slide => slide.id);
    
    for (const slideId of slideIds) {
      if (!existingSlideIds.includes(slideId)) {
        throw new ValidationError(`Slide ${slideId} does not belong to presentation ${presentationId}`);
      }
    }

    await this.slideModel.reorderSlides(presentationId, slideIds);
  }
}
