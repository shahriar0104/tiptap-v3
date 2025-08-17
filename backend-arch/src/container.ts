// Dependency Injection Container
import type {
  UserModel,
  AgendaGroupModel,
  AgendaItemModel,
  OrganizationModel,
  BoardMeetingModel,
} from './models';
import {
  UserModelImpl,
  AgendaGroupModelImpl,
  AgendaItemModelImpl,
  OrganizationModelImpl,
  BoardMeetingModelImpl,
} from './models';

import prisma from './config/database';

import { 
  AuthService, 
  BoardMeetingServiceImpl,
  AgendaGroupServiceImpl,
  AgendaItemServiceImpl,
  AgendaItemDocumentServiceImpl,
} from './services';
import type { BoardMeetingService, AgendaGroupService, AgendaItemService, AgendaItemDocumentService } from './services';
import { OrganizationService, OrganizationServiceImpl } from './services/organizationService';

// Services with Impl pattern
import { EditorContentService, EditorContentServiceImpl } from './services/editorContentService';
import { PresentationService, PresentationServiceImpl } from './services/presentationService';
import { SlideService, SlideServiceImpl } from './services/slideService';
import { UploadService, UploadServiceImpl } from './services/uploadService';

// Models with PrismaClient constructor
import { EditorContentModel, EditorContentModelImpl } from './models/editorContentModel';
import { PresentationModel, PresentationModelImpl } from './models/presentationModel';
import { SlideModel, SlideModelImpl } from './models/slideModel';
import { UploadModel, UploadModelImpl } from './models/uploadModel';

import { 
  AuthController, 
  BoardMeetingController, 
  AgendaGroupController, 
  AgendaItemController,
  AgendaItemDocumentController 
} from './controllers';
import type { OrganizationController } from './controllers';

// Controllers for newly added modules
import { EditorContentController } from './controllers/editorContentController';
import { PresentationController } from './controllers/presentationController';
import { SlideController } from './controllers/slideController';
import { UploadController } from './controllers/uploadController';

import { AuthMiddleware } from './middlewares';

export class Container {
  // Models
  public readonly userModel: UserModel;
  public readonly organizationModel: OrganizationModel;
  public readonly boardMeetingModel: BoardMeetingModel;
  public readonly agendaGroupModel: AgendaGroupModel;
  public readonly agendaItemModel: AgendaItemModel;
  public readonly editorContentModel: EditorContentModel;
  public readonly presentationModel: PresentationModel;
  public readonly slideModel: SlideModel;
  public readonly uploadModel: UploadModel;

  // Services
  public readonly authService: AuthService;
  public readonly boardMeetingService: BoardMeetingService;
  public readonly agendaGroupService: AgendaGroupService;
  public readonly agendaItemService: AgendaItemService;
  public readonly organizationService: OrganizationService;
  public readonly editorContentService: EditorContentService;
  public readonly presentationService: PresentationService;
  public readonly slideService: SlideService;
  public readonly uploadService: UploadService;
  public readonly agendaItemDocumentService: AgendaItemDocumentService;

  // Controllers
  public readonly authController: AuthController;
  public readonly boardMeetingController: BoardMeetingController;
  public readonly agendaGroupController: AgendaGroupController;
  public readonly agendaItemController: AgendaItemController;
  public readonly organizationController: OrganizationController;
  public readonly editorContentController: EditorContentController;
  public readonly presentationController: PresentationController;
  public readonly slideController: SlideController;
  public readonly uploadController: UploadController;
  public readonly agendaItemDocumentController: AgendaItemDocumentController;

  // Middlewares
  public readonly authMiddleware: AuthMiddleware;

  constructor() {
    // Initialize Models
    this.userModel = new UserModelImpl(prisma);
    this.organizationModel = new OrganizationModelImpl(prisma);
    this.boardMeetingModel = new BoardMeetingModelImpl(prisma);
    this.agendaGroupModel = new AgendaGroupModelImpl(prisma);
    this.agendaItemModel = new AgendaItemModelImpl(prisma);
    this.editorContentModel = new EditorContentModelImpl(prisma);
    this.presentationModel = new PresentationModelImpl(prisma);
    this.slideModel = new SlideModelImpl(prisma);
    this.uploadModel = new UploadModelImpl(prisma);

    // Initialize Services with dependencies
    this.authService = new AuthService(this.userModel);
    this.boardMeetingService = new BoardMeetingServiceImpl();
    this.agendaGroupService = new AgendaGroupServiceImpl();
    this.agendaItemService = new AgendaItemServiceImpl();
    this.organizationService = new OrganizationServiceImpl();
    this.editorContentService = new EditorContentServiceImpl();
    this.presentationService = new PresentationServiceImpl();
    this.slideService = new SlideServiceImpl();
    this.uploadService = new UploadServiceImpl();
    this.agendaItemDocumentService = new AgendaItemDocumentServiceImpl();

    // Initialize Controllers with dependencies
    this.authController = new AuthController(this.authService);
    this.boardMeetingController = new BoardMeetingController(this.boardMeetingService);
    this.agendaGroupController = new AgendaGroupController(this.agendaGroupService);
    this.agendaItemController = new AgendaItemController(this.agendaItemService);
    // Lazy import to avoid circular types, or directly import at top if you prefer strict typing
    const { OrganizationController } = require('./controllers/organizationController');
    this.organizationController = new OrganizationController(this.organizationService);
    this.editorContentController = new EditorContentController(this.editorContentService);
    this.presentationController = new PresentationController(this.presentationService);
    this.slideController = new SlideController(this.slideService);
    this.uploadController = new UploadController(this.uploadService);
    this.agendaItemDocumentController = new AgendaItemDocumentController(this.agendaItemDocumentService);

    // Initialize Middlewares with dependencies
    this.authMiddleware = new AuthMiddleware(this.userModel);
  }
}

// Create and export singleton container instance
export const container = new Container();

