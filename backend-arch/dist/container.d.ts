import { UserModel, BoardMeetingModel, AgendaGroupModel, AgendaItemModel, OrganizationModel } from './models';
import { AuthService, BoardMeetingService, AgendaGroupService, AgendaItemService } from './services';
import { AuthController, BoardMeetingController, AgendaGroupController, AgendaItemController } from './controllers';
import { AuthMiddleware } from './middlewares';
export declare class Container {
    readonly userModel: UserModel;
    readonly organizationModel: OrganizationModel;
    readonly boardMeetingModel: BoardMeetingModel;
    readonly agendaGroupModel: AgendaGroupModel;
    readonly agendaItemModel: AgendaItemModel;
    readonly authService: AuthService;
    readonly boardMeetingService: BoardMeetingService;
    readonly agendaGroupService: AgendaGroupService;
    readonly agendaItemService: AgendaItemService;
    readonly authController: AuthController;
    readonly boardMeetingController: BoardMeetingController;
    readonly agendaGroupController: AgendaGroupController;
    readonly agendaItemController: AgendaItemController;
    readonly authMiddleware: AuthMiddleware;
    constructor();
}
export declare const container: Container;
//# sourceMappingURL=container.d.ts.map