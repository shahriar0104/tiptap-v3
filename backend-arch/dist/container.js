"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = exports.Container = void 0;
const models_1 = require("./models");
const services_1 = require("./services");
const controllers_1 = require("./controllers");
const middlewares_1 = require("./middlewares");
class Container {
    userModel;
    organizationModel;
    boardMeetingModel;
    agendaGroupModel;
    agendaItemModel;
    authService;
    boardMeetingService;
    agendaGroupService;
    agendaItemService;
    authController;
    boardMeetingController;
    agendaGroupController;
    agendaItemController;
    authMiddleware;
    constructor() {
        this.userModel = new models_1.UserModel();
        this.organizationModel = new models_1.OrganizationModel();
        this.boardMeetingModel = new models_1.BoardMeetingModel();
        this.agendaGroupModel = new models_1.AgendaGroupModel();
        this.agendaItemModel = new models_1.AgendaItemModel();
        this.authService = new services_1.AuthService(this.userModel, this.organizationModel);
        this.boardMeetingService = new services_1.BoardMeetingService(this.boardMeetingModel, this.organizationModel, this.userModel);
        this.agendaGroupService = new services_1.AgendaGroupService(this.agendaGroupModel, this.boardMeetingModel);
        this.agendaItemService = new services_1.AgendaItemService(this.agendaItemModel, this.agendaGroupModel);
        this.authController = new controllers_1.AuthController(this.authService);
        this.boardMeetingController = new controllers_1.BoardMeetingController(this.boardMeetingService);
        this.agendaGroupController = new controllers_1.AgendaGroupController(this.agendaGroupService);
        this.agendaItemController = new controllers_1.AgendaItemController(this.agendaItemService);
        this.authMiddleware = new middlewares_1.AuthMiddleware(this.userModel);
    }
}
exports.Container = Container;
exports.container = new Container();
//# sourceMappingURL=container.js.map