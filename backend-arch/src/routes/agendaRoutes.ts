import { Router } from 'express';
import { container } from '../container';
import { validateRequest } from '../middlewares';
import {
  createAgendaGroupSchema,
  updateAgendaGroupSchema,
  getAgendaGroupSchema,
  createAgendaItemSchema,
  updateAgendaItemSchema,
  getAgendaItemSchema,
} from '../validators/agenda';

const router = Router();
const { agendaGroupController, agendaItemController, authMiddleware } =
  container;

// All routes below are protected by global auth middleware
router.use(authMiddleware.requireOrganization);

// Agenda Group routes
/**
 * @swagger
 * /api/agenda/groups:
 *   post:
 *     summary: Create agenda group
 *     tags: [Agenda]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               boardMeetingId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post(
  '/groups',
  validateRequest(createAgendaGroupSchema),
  agendaGroupController.createAgendaGroup
);

/**
 * @swagger
 * /api/agenda/groups/{id}:
 *   get:
 *     summary: Get agenda group by ID
 *     tags: [Agenda]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Not found
 */
router.get(
  '/groups/:id',
  validateRequest(getAgendaGroupSchema),
  agendaGroupController.getAgendaGroup
);

/**
 * @swagger
 * /api/agenda/groups/{id}:
 *   put:
 *     summary: Update agenda group
 *     tags: [Agenda]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 */
router.put(
  '/groups/:id',
  validateRequest(updateAgendaGroupSchema),
  agendaGroupController.updateAgendaGroup
);

/**
 * @swagger
 * /api/agenda/groups/{id}:
 *   delete:
 *     summary: Delete agenda group
 *     tags: [Agenda]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
router.delete(
  '/groups/:id',
  validateRequest(getAgendaGroupSchema),
  agendaGroupController.deleteAgendaGroup
);

/**
 * @swagger
 * /api/agenda/board-meetings/{boardMeetingId}/groups:
 *   get:
 *     summary: List agenda groups for a board meeting
 *     tags: [Agenda]
 *     parameters:
 *       - in: path
 *         name: boardMeetingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/board-meetings/:boardMeetingId/groups',
  agendaGroupController.getAgendaGroupsByBoardMeeting
);

/**
 * @swagger
 * /api/agenda/board-meetings/{boardMeetingId}/groups/reorder:
 *   post:
 *     summary: Reorder agenda groups in a board meeting
 *     tags: [Agenda]
 *     parameters:
 *       - in: path
 *         name: boardMeetingId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Reordered
 */
router.post(
  '/board-meetings/:boardMeetingId/groups/reorder',
  agendaGroupController.reorderAgendaGroups
);

// Agenda Item routes
/**
 * @swagger
 * /api/agenda/items:
 *   post:
 *     summary: Create agenda item
 *     tags: [Agenda]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Created
 */
router.post(
  '/items',
  validateRequest(createAgendaItemSchema),
  agendaItemController.createAgendaItem
);

/**
 * @swagger
 * /api/agenda/items/{id}:
 *   get:
 *     summary: Get agenda item by ID
 *     tags: [Agenda]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
router.get(
  '/items/:id',
  validateRequest(getAgendaItemSchema),
  agendaItemController.getAgendaItem
);

/**
 * @swagger
 * /api/agenda/items/{id}:
 *   put:
 *     summary: Update agenda item
 *     tags: [Agenda]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 */
router.put(
  '/items/:id',
  validateRequest(updateAgendaItemSchema),
  agendaItemController.updateAgendaItem
);

/**
 * @swagger
 * /api/agenda/items/{id}:
 *   delete:
 *     summary: Delete agenda item
 *     tags: [Agenda]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
router.delete(
  '/items/:id',
  validateRequest(getAgendaItemSchema),
  agendaItemController.deleteAgendaItem
);

/**
 * @swagger
 * /api/agenda/items/{id}/status:
 *   patch:
 *     summary: Update agenda item status
 *     tags: [Agenda]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 */
router.patch(
  '/items/:id/status',
  validateRequest(getAgendaItemSchema),
  agendaItemController.updateAgendaItemStatus
);

/**
 * @swagger
 * /api/agenda/groups/{agendaGroupId}/items:
 *   get:
 *     summary: List agenda items for a group
 *     tags: [Agenda]
 *     parameters:
 *       - in: path
 *         name: agendaGroupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/groups/:agendaGroupId/items',
  agendaItemController.getAgendaItemsByGroup
);

/**
 * @swagger
 * /api/agenda/board-meetings/{boardMeetingId}/items:
 *   get:
 *     summary: List agenda items for a board meeting
 *     tags: [Agenda]
 *     parameters:
 *       - in: path
 *         name: boardMeetingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.get(
  '/board-meetings/:boardMeetingId/items',
  agendaItemController.getAgendaItemsByBoardMeeting
);

/**
 * @swagger
 * /api/agenda/groups/{agendaGroupId}/items/reorder:
 *   post:
 *     summary: Reorder agenda items in a group
 *     tags: [Agenda]
 *     parameters:
 *       - in: path
 *         name: agendaGroupId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Reordered
 */
router.post(
  '/groups/:agendaGroupId/items/reorder',
  agendaItemController.reorderAgendaItems
);

export default router;
