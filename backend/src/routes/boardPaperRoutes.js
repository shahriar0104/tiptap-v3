import express from 'express';
import boardPaperController from '../controllers/boardPaperController.js';
import {
  validateCreateBoardPaper,
  validateUpdateBoardPaper,
  validateId,
} from '../utils/validation.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     BoardPaper:
 *       type: object
 *       required:
 *         - title
 *         - agendaItems
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the board paper
 *         description:
 *           type: string
 *           description: Description of the board paper
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
 * /api/board-papers:
 *   post:
 *     summary: Create a new board paper with agenda items
 *     tags: [Board Papers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BoardPaper'
 *     responses:
 *       201:
 *         description: Board paper created successfully
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
 *                   $ref: '#/components/schemas/BoardPaper'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Board paper already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', validateCreateBoardPaper, boardPaperController.createBoardPaper);

/**
 * @swagger
 * /api/board-papers:
 *   get:
 *     summary: Get all board papers with optional filtering
 *     tags: [Board Papers]
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
 *         description: Board papers retrieved successfully
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
 *                     $ref: '#/components/schemas/BoardPaper'
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
router.get('/', boardPaperController.getAllBoardPapers);

/**
 * @swagger
 * /api/board-papers/{id}:
 *   get:
 *     summary: Get a board paper by ID
 *     tags: [Board Papers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Board paper ID
 *     responses:
 *       200:
 *         description: Board paper retrieved successfully
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
 *                   $ref: '#/components/schemas/BoardPaper'
 *       404:
 *         description: Board paper not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', boardPaperController.getBoardPaper);

/**
 * @swagger
 * /api/board-papers/{id}:
 *   put:
 *     summary: Update a board paper
 *     tags: [Board Papers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Board paper ID
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
 *         description: Board paper updated successfully
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
 *                   $ref: '#/components/schemas/BoardPaper'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Board paper not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', validateUpdateBoardPaper, boardPaperController.updateBoardPaper);

/**
 * @swagger
 * /api/board-papers/{id}:
 *   delete:
 *     summary: Delete a board paper
 *     tags: [Board Papers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Board paper ID
 *     responses:
 *       200:
 *         description: Board paper deleted successfully
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
 *         description: Board paper not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', boardPaperController.deleteBoardPaper);

/**
 * @swagger
 * /api/board-papers/{id}/agenda-items:
 *   post:
 *     summary: Add agenda items to an existing board paper
 *     tags: [Board Papers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Board paper ID
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
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/BoardPaper'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Board paper not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/agenda-items', boardPaperController.addAgendaItems);

/**
 * @swagger
 * /api/board-papers/health:
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
router.get('/health', boardPaperController.healthCheck);

export default router; 