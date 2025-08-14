import { AgendaGroup, Prisma } from '@prisma/client';
import { AgendaGroupModel } from '../models/agendaGroupModel';
import { BoardMeetingModel } from '../models/boardMeetingModel';
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
export declare class AgendaGroupService {
    private agendaGroupModel;
    private boardMeetingModel;
    constructor(agendaGroupModel: AgendaGroupModel, boardMeetingModel: BoardMeetingModel);
    createAgendaGroup(data: CreateAgendaGroupData, createdById: string, userOrganizationId?: string): Promise<AgendaGroup>;
    getAgendaGroupById(id: string, userOrganizationId?: string): Promise<AgendaGroupWithRelations | null>;
    getAgendaGroupsByBoardMeetingId(boardMeetingId: string, userOrganizationId?: string): Promise<AgendaGroupWithRelations[]>;
    updateAgendaGroup(id: string, data: UpdateAgendaGroupData, userOrganizationId?: string): Promise<AgendaGroupWithRelations | null>;
    deleteAgendaGroup(id: string, userOrganizationId?: string): Promise<void>;
    reorderAgendaGroups(boardMeetingId: string, groupOrders: Array<{
        id: string;
        order: number;
    }>, userOrganizationId?: string): Promise<void>;
}
export {};
//# sourceMappingURL=agendaGroupService.d.ts.map