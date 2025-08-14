import express from 'express';
import boardMeetingController from '../controllers/boardMeetingController.js';
import { validateBoardMeeting, validateUpdateBoardMeeting, validateId } from '../middleware/validation.js';
import { requireEditor } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     BoardMeeting:
 *       type: object
 *       required:
 *         - title
 *         - agendaItems
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the board meeting
 *         description:
 *           type: string
 *           description: Description of the board meeting
 *         status:
 *           type: string
 *           enum: [DRAFT, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED]
 *           default: DRAFT
 *         meetingDate:
 *           type: string
 *           format: date-time
 *           description: Meeting date and time
 *         agendaItems:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AgendaItem'
 *     AgendaItem:
 *       type: object
 *       required:
 *         - title
 *         - order
 *         - startTime
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the agenda item
 *         order:
 *           type: integer
 *           minimum: 0
 *           description: Order of the agenda item
 *         startTime:
 *           type: string
 *           description: Start time of the agenda item
 *         status:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED, DEFERRED]
 *           default: PENDING
 */

/**
 * @swagger
 * /api/board-meetings:
 *   post:
 *     summary: Create a new board meeting with agenda items
 *     tags: [Board Meetings]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BoardMeeting'
 *     responses:
 *       201:
 *         description: Board meeting created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/BoardMeeting'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Board meeting already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', requireEditor, validateBoardMeeting, boardMeetingController.createBoardMeeting);

/**
 * @swagger
 * /api/board-meetings:
 *   get:
 *     summary: Get all board meetings for user's organization
 *     tags: [Board Meetings]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Board meetings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BoardMeeting'
 *       500:
 *         description: Internal server error
 */
router.get('/', boardMeetingController.getAllBoardMeetings);

/**
 * @swagger
 * /api/board-meetings/{id}:
 *   get:
 *     summary: Get a board meeting by ID
 *     tags: [Board Meetings]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Board meeting ID
 *     responses:
 *       200:
 *         description: Board meeting retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/BoardMeeting'
 *       404:
 *         description: Board meeting not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', validateId, boardMeetingController.getBoardMeeting);

/**
 * @swagger
 * /api/board-meetings/{id}:
 *   put:
 *     summary: Update a board meeting
 *     tags: [Board Meetings]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Board meeting ID
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
 *               status:
 *                 type: string
 *                 enum: [DRAFT, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED]
 *               meetingDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Board meeting updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Board meeting not found
 *       403:
 *         description: Permission denied
 *       500:
 *         description: Internal server error
 */
router.put('/:id', validateId, validateUpdateBoardMeeting, boardMeetingController.updateBoardMeeting);

/**
 * @swagger
 * /api/board-meetings/{id}:
 *   delete:
 *     summary: Delete a board meeting
 *     tags: [Board Meetings]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Board meeting ID
 *     responses:
 *       200:
 *         description: Board meeting deleted successfully
 *       404:
 *         description: Board meeting not found
 *       403:
 *         description: Permission denied
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', validateId, boardMeetingController.deleteBoardMeeting);

/**
 * @swagger
 * /api/board-meetings/{id}/agenda-items:
 *   post:
 *     summary: Add agenda items to a board meeting
 *     tags: [Board Meetings]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Board meeting ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               agendaItems:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/AgendaItem'
 *     responses:
 *       201:
 *         description: Agenda items added successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Board meeting not found
 *       403:
 *         description: Permission denied
 *       500:
 *         description: Internal server error
 */
router.post('/:id/agenda-items', validateId, boardMeetingController.addAgendaItems);

/**
 * @swagger
 * /api/board-meetings/{boardMeetingId}/agenda-items/{agendaItemId}:
 *   put:
 *     summary: Update an agenda item
 *     tags: [Board Meetings]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: boardMeetingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Board meeting ID
 *       - in: path
 *         name: agendaItemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Agenda item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               order:
 *                 type: integer
 *               startTime:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, COMPLETED, DEFERRED]
 *     responses:
 *       200:
 *         description: Agenda item updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Board meeting or agenda item not found
 *       403:
 *         description: Permission denied
 *       500:
 *         description: Internal server error
 */
router.put('/:boardMeetingId/agenda-items/:agendaItemId', boardMeetingController.updateAgendaItem);

/**
 * @swagger
 * /api/board-meetings/{boardMeetingId}/agenda-items/{agendaItemId}:
 *   delete:
 *     summary: Delete an agenda item
 *     tags: [Board Meetings]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: boardMeetingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Board meeting ID
 *       - in: path
 *         name: agendaItemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Agenda item ID
 *     responses:
 *       200:
 *         description: Agenda item deleted successfully
 *       404:
 *         description: Board meeting or agenda item not found
 *       403:
 *         description: Permission denied
 *       500:
 *         description: Internal server error
 */
router.delete('/:boardMeetingId/agenda-items/:agendaItemId', boardMeetingController.deleteAgendaItem);

export default router;
