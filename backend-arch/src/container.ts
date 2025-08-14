// Dependency Injection Container
import {
  UserModel,
  BoardMeetingModel,
  AgendaGroupModel,
  AgendaItemModel,
  OrganizationModel,
} from './models';

import { 
  AuthService, 
  BoardMeetingService, 
  AgendaGroupService, 
  AgendaItemService 
} from './services';

import { 
  AuthController, 
  BoardMeetingController, 
  AgendaGroupController, 
  AgendaItemController 
} from './controllers';

import { AuthMiddleware } from './middlewares';

export class Container {
  // Models
  public readonly userModel: UserModel;
  public readonly organizationModel: OrganizationModel;
  public readonly boardMeetingModel: BoardMeetingModel;
  public readonly agendaGroupModel: AgendaGroupModel;
  public readonly agendaItemModel: AgendaItemModel;

  // Services
  public readonly authService: AuthService;
  public readonly boardMeetingService: BoardMeetingService;
  public readonly agendaGroupService: AgendaGroupService;
  public readonly agendaItemService: AgendaItemService;

  // Controllers
  public readonly authController: AuthController;
  public readonly boardMeetingController: BoardMeetingController;
  public readonly agendaGroupController: AgendaGroupController;
  public readonly agendaItemController: AgendaItemController;

  // Middlewares
  public readonly authMiddleware: AuthMiddleware;

  constructor() {
    // Initialize Models
    this.userModel = new UserModel();
    this.organizationModel = new OrganizationModel();
    this.boardMeetingModel = new BoardMeetingModel();
    this.agendaGroupModel = new AgendaGroupModel();
    this.agendaItemModel = new AgendaItemModel();

    // Initialize Services with dependencies
    this.authService = new AuthService(this.userModel, this.organizationModel);
    this.boardMeetingService = new BoardMeetingService(this.boardMeetingModel, this.organizationModel, this.userModel);
    this.agendaGroupService = new AgendaGroupService(
      this.agendaGroupModel,
      this.boardMeetingModel
    );
    this.agendaItemService = new AgendaItemService(
      this.agendaItemModel,
      this.agendaGroupModel
    );

    // Initialize Controllers with dependencies
    this.authController = new AuthController(this.authService);
    this.boardMeetingController = new BoardMeetingController(this.boardMeetingService);
    this.agendaGroupController = new AgendaGroupController(this.agendaGroupService);
    this.agendaItemController = new AgendaItemController(this.agendaItemService);

    // Initialize Middlewares with dependencies
    this.authMiddleware = new AuthMiddleware(this.userModel);
  }
}

// Create and export singleton container instance
export const container = new Container();
