import { Router } from 'express';
import { container } from '../container';
import { validateRequest } from '../middlewares';
import { 
  createAgendaGroupSchema, 
  updateAgendaGroupSchema, 
  getAgendaGroupSchema,
  createAgendaItemSchema,
  updateAgendaItemSchema,
  getAgendaItemSchema
} from '../validators/agenda';

const router = Router();
const { agendaGroupController, agendaItemController, authMiddleware } = container;

// All routes below are protected by global auth middleware
router.use(authMiddleware.requireOrganization);

// Agenda Group routes
router.post('/groups', 
  validateRequest(createAgendaGroupSchema),
  agendaGroupController.createAgendaGroup
);

router.get('/groups/:id', 
  validateRequest(getAgendaGroupSchema),
  agendaGroupController.getAgendaGroup
);

router.put('/groups/:id', 
  validateRequest(updateAgendaGroupSchema),
  agendaGroupController.updateAgendaGroup
);

router.delete('/groups/:id', 
  validateRequest(getAgendaGroupSchema),
  agendaGroupController.deleteAgendaGroup
);

router.get('/board-meetings/:boardMeetingId/groups', 
  agendaGroupController.getAgendaGroupsByBoardMeeting
);

router.post('/board-meetings/:boardMeetingId/groups/reorder', 
  agendaGroupController.reorderAgendaGroups
);

// Agenda Item routes
router.post('/items', 
  validateRequest(createAgendaItemSchema),
  agendaItemController.createAgendaItem
);

router.get('/items/:id', 
  validateRequest(getAgendaItemSchema),
  agendaItemController.getAgendaItem
);

router.put('/items/:id', 
  validateRequest(updateAgendaItemSchema),
  agendaItemController.updateAgendaItem
);

router.delete('/items/:id', 
  validateRequest(getAgendaItemSchema),
  agendaItemController.deleteAgendaItem
);

router.patch('/items/:id/status', 
  validateRequest(getAgendaItemSchema),
  agendaItemController.updateAgendaItemStatus
);

router.get('/groups/:agendaGroupId/items', 
  agendaItemController.getAgendaItemsByGroup
);

router.get('/board-meetings/:boardMeetingId/items', 
  agendaItemController.getAgendaItemsByBoardMeeting
);

router.post('/groups/:agendaGroupId/items/reorder', 
  agendaItemController.reorderAgendaItems
);

export default router;
