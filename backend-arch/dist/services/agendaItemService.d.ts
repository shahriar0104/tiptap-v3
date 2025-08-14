import { AgendaItem, AgendaItemStatus } from '@prisma/client';
import { AgendaItemModel } from '../models/agendaItemModel';
import { AgendaGroupModel } from '../models/agendaGroupModel';
import { CreateAgendaItemData, UpdateAgendaItemData } from '../types';
export declare class AgendaItemService {
    private agendaItemModel;
    private agendaGroupModel;
    constructor(agendaItemModel: AgendaItemModel, agendaGroupModel: AgendaGroupModel);
    createAgendaItem(data: CreateAgendaItemData, createdById: string, userOrganizationId?: string): Promise<AgendaItem>;
    getAgendaItemById(id: string, userOrganizationId?: string): Promise<AgendaItem>;
    getAgendaItemsByGroup(agendaGroupId: string, userOrganizationId?: string): Promise<AgendaItem[]>;
    getAgendaItemsByBoardMeeting(boardMeetingId: string, userOrganizationId?: string): Promise<AgendaItem[]>;
    updateAgendaItem(id: string, data: UpdateAgendaItemData, userOrganizationId?: string): Promise<AgendaItem>;
    deleteAgendaItem(id: string, userOrganizationId?: string): Promise<void>;
    updateAgendaItemStatus(id: string, status: AgendaItemStatus, userOrganizationId?: string): Promise<AgendaItem>;
    reorderAgendaItems(agendaGroupId: string, itemOrders: Array<{
        id: string;
        order: number;
    }>, userOrganizationId?: string): Promise<void>;
    private validateStatusTransition;
}
//# sourceMappingURL=agendaItemService.d.ts.map