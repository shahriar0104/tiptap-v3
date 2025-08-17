import { withModels, withTransactionModels } from '../utils/transaction';
import type { CreateAgendaItemDocumentData } from '../types';
import type { AgendaItemDocumentWithRelations } from '../models/agendaItemDocumentModel';
import { ForbiddenError, NotFoundError, ValidationError } from '../utils/errors';

export interface AgendaItemDocumentService {
  create(
    data: CreateAgendaItemDocumentData,
    userOrganizationId?: string
  ): Promise<AgendaItemDocumentWithRelations>;
  listByAgendaItem(
    agendaItemId: string,
    userOrganizationId?: string
  ): Promise<AgendaItemDocumentWithRelations[]>;
  getById(
    id: string,
    userOrganizationId?: string
  ): Promise<AgendaItemDocumentWithRelations>;
  delete(
    id: string,
    userOrganizationId?: string
  ): Promise<void>;
}

export class AgendaItemDocumentServiceImpl implements AgendaItemDocumentService {
  constructor() {}

  async create(
    data: CreateAgendaItemDocumentData,
    userOrganizationId?: string
  ): Promise<AgendaItemDocumentWithRelations> {
    if (!data.agendaItemId || !data.uploadId) {
      throw new ValidationError('agendaItemId and uploadId are required');
    }

    return withTransactionModels(async ({ models }) => {
      // Ensure agenda item exists and user has access
      const agendaItem = await models.agendaItemModel.findById(data.agendaItemId);
      if (!agendaItem) {
        throw new NotFoundError('Agenda item not found');
      }
      if (
        userOrganizationId &&
        agendaItem.agendaGroup.boardMeeting.organizationId !== userOrganizationId
      ) {
        throw new ForbiddenError('Access denied to this agenda item');
      }

      // Optionally ensure upload exists for better error message
      const upload = await models.uploadModel.findById(data.uploadId);
      if (!upload) {
        throw new NotFoundError('Upload not found');
      }

      return models.agendaItemDocumentModel.create(data);
    });
  }

  async listByAgendaItem(
    agendaItemId: string,
    userOrganizationId?: string
  ): Promise<AgendaItemDocumentWithRelations[]> {
    if (!agendaItemId) throw new ValidationError('agendaItemId is required');

    return withModels(async ({ models }) => {
      const agendaItem = await models.agendaItemModel.findById(agendaItemId);
      if (!agendaItem) {
        throw new NotFoundError('Agenda item not found');
      }
      if (
        userOrganizationId &&
        agendaItem.agendaGroup.boardMeeting.organizationId !== userOrganizationId
      ) {
        throw new ForbiddenError('Access denied to this agenda item');
      }

      return models.agendaItemDocumentModel.findByAgendaItemId(agendaItemId);
    });
  }

  async getById(
    id: string,
    userOrganizationId?: string
  ): Promise<AgendaItemDocumentWithRelations> {
    if (!id) throw new ValidationError('id is required');

    return withModels(async ({ models }) => {
      const doc = await models.agendaItemDocumentModel.findById(id);
      if (!doc) {
        throw new NotFoundError('Agenda item document not found');
      }
      // Fetch agenda item for organization check
      const agendaItem = await models.agendaItemModel.findById(doc.agendaItem.id);
      if (!agendaItem) {
        throw new NotFoundError('Agenda item not found');
      }
      if (
        userOrganizationId &&
        agendaItem.agendaGroup.boardMeeting.organizationId !== userOrganizationId
      ) {
        throw new ForbiddenError('Access denied to this agenda item document');
      }
      return doc;
    });
  }

  async delete(id: string, userOrganizationId?: string): Promise<void> {
    if (!id) throw new ValidationError('id is required');

    return withTransactionModels(async ({ models }) => {
      const doc = await models.agendaItemDocumentModel.findById(id);
      if (!doc) {
        throw new NotFoundError('Agenda item document not found');
      }
      const agendaItem = await models.agendaItemModel.findById(doc.agendaItem.id);
      if (!agendaItem) {
        throw new NotFoundError('Agenda item not found');
      }
      if (
        userOrganizationId &&
        agendaItem.agendaGroup.boardMeeting.organizationId !== userOrganizationId
      ) {
        throw new ForbiddenError('Access denied to this agenda item document');
      }

      await models.agendaItemDocumentModel.delete(id);
    });
  }
}
