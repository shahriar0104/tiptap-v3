import { Prisma, AgendaGroup } from '@prisma/client';
import { CreateAgendaGroupData, UpdateAgendaGroupData } from '../types';
type AgendaGroupWithRelations = Prisma.AgendaGroupGetPayload<{
    include: {
        boardMeeting: {
            select: {
                id: true;
                title: true;
                organizationId: true;
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
        agendaItems: {
            include: {
                createdBy: {
                    select: {
                        id: true;
                        email: true;
                        firstName: true;
                        lastName: true;
                    };
                };
            };
        };
    };
}>;
export declare class AgendaGroupModel {
    findById(id: string): Promise<AgendaGroupWithRelations | null>;
    findByBoardMeetingId(boardMeetingId: string): Promise<AgendaGroupWithRelations[]>;
    create(data: CreateAgendaGroupData, createdById: string): Promise<AgendaGroup>;
    update(id: string, data: UpdateAgendaGroupData): Promise<AgendaGroupWithRelations>;
    delete(id: string): Promise<AgendaGroup>;
    reorderGroups(boardMeetingId: string, groupOrders: Array<{
        id: string;
        order: number;
    }>): Promise<void>;
    getMaxOrder(boardMeetingId: string): Promise<number>;
}
export {};
//# sourceMappingURL=agendaGroupModel.d.ts.map