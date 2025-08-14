import { Request, Response, NextFunction } from 'express';
import { AgendaGroupService } from '../services/agendaGroupService';
export declare class AgendaGroupController {
    private agendaGroupService;
    constructor(agendaGroupService: AgendaGroupService);
    createAgendaGroup: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAgendaGroup: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAgendaGroupsByBoardMeeting: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateAgendaGroup: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteAgendaGroup: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    reorderAgendaGroups: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=agendaGroupController.d.ts.map