import { Presentation } from '@prisma/client';
import { PresentationModel } from '../models/presentationModel';
import { CreatePresentationData, UpdatePresentationData } from '../types';
import { NotFoundError, ValidationError } from '../utils/errors';

export interface PresentationService {
  createPresentation(data: CreatePresentationData, userId: string): Promise<Presentation>;
  getPresentationById(id: string): Promise<Presentation>;
  getPresentationsByBoardMeeting(boardMeetingId: string): Promise<Presentation[]>;
  updatePresentation(id: string, data: UpdatePresentationData): Promise<Presentation>;
  deletePresentation(id: string): Promise<void>;
}

export class PresentationServiceImpl implements PresentationService {
  constructor(private presentationModel: PresentationModel) {}

  async createPresentation(data: CreatePresentationData, userId: string): Promise<Presentation> {
    // Validate required fields
    if (!data.boardMeetingId) {
      throw new ValidationError('boardMeetingId is required');
    }

    // Set the createdById to the current user
    const presentationData: CreatePresentationData = {
      ...data,
      createdById: userId
    };

    return this.presentationModel.create(presentationData);
  }

  async getPresentationById(id: string): Promise<Presentation> {
    if (!id) {
      throw new ValidationError('Presentation ID is required');
    }

    const presentation = await this.presentationModel.findById(id);
    if (!presentation) {
      throw new NotFoundError('Presentation not found');
    }

    return presentation;
  }

  async getPresentationsByBoardMeeting(boardMeetingId: string): Promise<Presentation[]> {
    if (!boardMeetingId) {
      throw new ValidationError('Board meeting ID is required');
    }

    return this.presentationModel.findByBoardMeeting(boardMeetingId);
  }

  async updatePresentation(id: string, data: UpdatePresentationData): Promise<Presentation> {
    if (!id) {
      throw new ValidationError('Presentation ID is required');
    }

    // Check if presentation exists
    await this.getPresentationById(id);

    return this.presentationModel.update(id, data);
  }

  async deletePresentation(id: string): Promise<void> {
    if (!id) {
      throw new ValidationError('Presentation ID is required');
    }

    // Check if presentation exists
    await this.getPresentationById(id);

    await this.presentationModel.delete(id);
  }
}
