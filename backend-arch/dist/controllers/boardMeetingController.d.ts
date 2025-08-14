import { Request, Response, NextFunction } from 'express';
import { BoardMeetingService } from '../services/boardMeetingService';
export declare class BoardMeetingController {
    private boardMeetingService;
    constructor(boardMeetingService: BoardMeetingService);
    createBoardMeeting: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getBoardMeeting: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getBoardMeetings: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateBoardMeeting: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteBoardMeeting: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateMeetingStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getOrganizationMeetings: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createOrganizationWithBoardMeeting: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=boardMeetingController.d.ts.map