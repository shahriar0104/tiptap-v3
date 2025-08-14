import { Prisma, AgendaItem, AgendaItemStatus } from '@prisma/client';
import { CreateAgendaItemData, UpdateAgendaItemData } from '../types';
type AgendaItemWithRelations = Prisma.AgendaItemGetPayload<{
    include: {
        agendaGroup: {
            select: {
                id: true;
                title: true;
                boardMeetingId: true;
                boardMeeting: {
                    select: {
                        id: true;
                        title: true;
                        organizationId: true;
                    };
                };
            };
        };
        createdBy: {
            select: {
                id: true;
                email: true;
                firstName: true;
                lastName: true;
            };
        };
    };
}>;
export declare class AgendaItemModel {
    findById(id: string): Promise<AgendaItemWithRelations | null>;
    findByAgendaGroupId(agendaGroupId: string): Promise<AgendaItemWithRelations[]>;
    create(data: CreateAgendaItemData, createdById: string): Promise<AgendaItem>;
    update(id: string, data: UpdateAgendaItemData): Promise<AgendaItem>;
    delete(id: string): Promise<AgendaItem>;
    reorderItems(agendaGroupId: string, itemOrders: Array<{
        id: string;
        order: number;
    }>): Promise<void>;
    getMaxOrder(agendaGroupId: string): Promise<number>;
    updateStatus(id: string, status: AgendaItemStatus): Promise<AgendaItem>;
    findByBoardMeetingId(boardMeetingId: string): Promise<AgendaItemWithRelations[]>;
}
export {};
//# sourceMappingURL=agendaItemModel.d.ts.map