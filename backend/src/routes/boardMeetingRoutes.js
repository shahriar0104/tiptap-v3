import express from 'express';
import boardMeetingController from '../controllers/boardMeetingController.js';
import {
  validateCreateBoardMeeting,
  validateUpdateBoardMeeting,
  validateId,
} from '../utils/validation.js';

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
 *           enum: [DRAFT, PUBLISHED, ARCHIVED, APPROVED, REJECTED]
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
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the agenda item
 *         description:
 *           type: string
 *           description: Description of the agenda item
 *         order:
 *           type: integer
 *           minimum: 1
 *           description: Order of the agenda item
 *         duration:
 *           type: integer
 *           minimum: 1
 *           maximum: 480
 *           description: Duration in minutes
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
router.post('/', validateCreateBoardMeeting, boardMeetingController.createBoardMeeting);

/**
 * @swagger
 * /api/board-meetings:
 *   get:
 *     summary: Get all board meetings with optional filtering
 *     tags: [Board Meetings]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED, APPROVED, REJECTED]
 *         description: Filter by status
 *       - in: query
 *         name: authorId
 *         schema:
 *           type: string
 *         description: Filter by author ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of items to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip
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
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *                     total:
 *                       type: integer
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
router.get('/:id', boardMeetingController.getBoardMeeting);

/**
 * @swagger
 * /api/board-meetings/{id}:
 *   put:
 *     summary: Update a board meeting
 *     tags: [Board Meetings]
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
 *                 enum: [DRAFT, PUBLISHED, ARCHIVED, APPROVED, REJECTED]
 *               meetingDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Board meeting updated successfully
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
 *       404:
 *         description: Board meeting not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', validateUpdateBoardMeeting, boardMeetingController.updateBoardMeeting);

/**
 * @swagger
 * /api/board-meetings/{id}:
 *   delete:
 *     summary: Delete a board meeting
 *     tags: [Board Meetings]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Board meeting not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', boardMeetingController.deleteBoardMeeting);

/**
 * @swagger
 * /api/board-meetings/{id}/agenda-items:
 *   post:
 *     summary: Add agenda items to an existing board meeting
 *     tags: [Board Meetings]
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
 *       200:
 *         description: Agenda items added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/BoardMeeting'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Board meeting not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/agenda-items', boardMeetingController.addAgendaItems);

/**
 * @swagger
 * /api/board-meetings/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 */
router.get('/health', boardMeetingController.healthCheck);

export default router; 
