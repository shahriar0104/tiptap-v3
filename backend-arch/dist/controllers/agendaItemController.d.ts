import { Request, Response, NextFunction } from 'express';
import { AgendaItemService } from '../services/agendaItemService';
export declare class AgendaItemController {
    private agendaItemService;
    constructor(agendaItemService: AgendaItemService);
    createAgendaItem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAgendaItem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAgendaItemsByGroup: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAgendaItemsByBoardMeeting: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateAgendaItem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteAgendaItem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateAgendaItemStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    reorderAgendaItems: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=agendaItemController.d.ts.map