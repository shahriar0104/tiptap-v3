import { BoardMeeting, BoardMeetingStatus } from '@prisma/client';
import { BoardMeetingModel } from '../models/boardMeetingModel';
import { OrganizationModel } from '../models/organizationModel';
import { UserModel } from '../models/userModel';
import { CreateBoardMeetingData, UpdateBoardMeetingData, PaginatedResponse } from '../types';
export declare class BoardMeetingService {
    private boardMeetingModel;
    private organizationModel;
    private userModel;
    constructor(boardMeetingModel: BoardMeetingModel, organizationModel: OrganizationModel, userModel: UserModel);
    createBoardMeeting(data: CreateBoardMeetingData, createdById: string): Promise<BoardMeeting>;
    getBoardMeetingById(id: string, userOrganizationId?: string): Promise<BoardMeeting>;
    getBoardMeetings(organizationId?: string, status?: BoardMeetingStatus, page?: number, limit?: number): Promise<PaginatedResponse<BoardMeeting>>;
    updateBoardMeeting(id: string, data: UpdateBoardMeetingData, userOrganizationId?: string): Promise<BoardMeeting>;
    deleteBoardMeeting(id: string, userOrganizationId?: string): Promise<void>;
    getBoardMeetingsByOrganization(organizationId: string): Promise<BoardMeeting[]>;
    updateMeetingStatus(id: string, status: BoardMeetingStatus, userOrganizationId?: string): Promise<BoardMeeting>;
    private validateStatusTransition;
    createOrganizationWithBoardMeeting(data: {
        organizationName: string;
        adminEmail: string;
        adminPassword: string;
        adminFirstName: string;
        adminLastName: string;
        boardMeetingTitle: string;
        boardMeetingDescription?: string;
        boardMeetingScheduledAt: string;
        boardMeetingDuration?: number;
        boardMeetingLocation?: string;
    }): Promise<{
        organization: any;
        user: any;
        boardMeeting: any;
        session: any;
    }>;
}
//# sourceMappingURL=boardMeetingService.d.ts.map