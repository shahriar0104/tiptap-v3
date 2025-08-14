import { BoardMeeting, BoardMeetingStatus } from '@prisma/client';
import { CreateBoardMeetingData, UpdateBoardMeetingData } from '../types';
export declare class BoardMeetingModel {
    findById(id: string): Promise<BoardMeeting | null>;
    findMany(organizationId?: string, status?: BoardMeetingStatus, skip?: number, take?: number): Promise<BoardMeeting[]>;
    count(organizationId?: string, status?: BoardMeetingStatus): Promise<number>;
    create(data: CreateBoardMeetingData, createdById: string): Promise<BoardMeeting>;
    update(id: string, data: UpdateBoardMeetingData): Promise<BoardMeeting>;
    delete(id: string): Promise<BoardMeeting>;
    findByOrganizationId(organizationId: string): Promise<BoardMeeting[]>;
}
//# sourceMappingURL=boardMeetingModel.d.ts.map