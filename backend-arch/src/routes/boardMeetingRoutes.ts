import { Router } from 'express';
import { container } from '../container';
import { validateRequest } from '../middlewares';
import {
  createBoardMeetingSchema,
  updateBoardMeetingSchema,
  getBoardMeetingSchema,
  getBoardMeetingsSchema,
} from '../validators/boardMeeting';

const router = Router();
const { boardMeetingController, authMiddleware } = container;

// Organization-related endpoints moved to organizationRoutes.ts

// Routes below require organization membership
router.use(authMiddleware.requireOrganization);

/**
 * @swagger
 * /api/board-meetings:
 *   post:
 *     summary: Create a new board meeting
 *     description: Create a new board meeting for the authenticated user's organization
 *     tags: [Board Meetings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - scheduledAt
 *               - organizationId
 *             properties:
 *               title:
 *                 type: string
 *                 example: Q4 Board Meeting
 *               description:
 *                 type: string
 *                 example: Quarterly review and planning session
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *                 example: 2023-12-15T14:00:00Z
 *               duration:
 *                 type: integer
 *                 example: 120
 *                 description: Duration in minutes
 *               location:
 *                 type: string
 *                 example: Conference Room A
 *               organizationId:
 *                 type: string
 *                 format: uuid
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       201:
 *         description: Board meeting created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/BoardMeeting'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 */
router.post(
  '/',
  validateRequest(createBoardMeetingSchema),
  boardMeetingController.createBoardMeeting
);

/**
 * @swagger
 * /api/board-meetings:
 *   get:
 *     summary: Get board meetings
 *     description: Retrieve paginated list of board meetings
 *     tags: [Board Meetings]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: organizationId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by organization ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED]
 *         description: Filter by meeting status
 *     responses:
 *       200:
 *         description: Board meetings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         description: Authentication required
 */
router.get(
  '/',
  validateRequest(getBoardMeetingsSchema),
  boardMeetingController.getBoardMeetings
);

// Organization-related endpoints moved to organizationRoutes.ts

/**
 * @swagger
 * /api/board-meetings/{id}:
 *   get:
 *     summary: Get board meeting by ID
 *     description: Retrieve a specific board meeting by its ID
 *     tags: [Board Meetings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Board meeting ID
 *     responses:
 *       200:
 *         description: Board meeting retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/BoardMeeting'
 *       404:
 *         description: Board meeting not found
 *       403:
 *         description: Access denied
 *       401:
 *         description: Authentication required
 */
router.get(
  '/:id',
  validateRequest(getBoardMeetingSchema),
  boardMeetingController.getBoardMeeting
);

/**
 * @swagger
 * /api/board-meetings/{id}:
 *   put:
 *     summary: Update board meeting
 *     description: Update a board meeting's details
 *     tags: [Board Meetings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *                 example: Updated Q4 Board Meeting
 *               description:
 *                 type: string
 *                 example: Updated quarterly review and planning session
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *                 example: 2023-12-15T15:00:00Z
 *               duration:
 *                 type: integer
 *                 example: 150
 *               location:
 *                 type: string
 *                 example: Conference Room B
 *               status:
 *                 type: string
 *                 enum: [SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED]
 *                 example: SCHEDULED
 *     responses:
 *       200:
 *         description: Board meeting updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/BoardMeeting'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Board meeting not found
 *       403:
 *         description: Access denied
 *       401:
 *         description: Authentication required
 */
router.put(
  '/:id',
  validateRequest(updateBoardMeetingSchema),
  boardMeetingController.updateBoardMeeting
);

/**
 * @swagger
 * /api/board-meetings/{id}:
 *   delete:
 *     summary: Delete board meeting
 *     description: Delete a board meeting (only scheduled meetings can be deleted)
 *     tags: [Board Meetings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Board meeting ID
 *     responses:
 *       200:
 *         description: Board meeting deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Only scheduled meetings can be deleted
 *       404:
 *         description: Board meeting not found
 *       403:
 *         description: Access denied
 *       401:
 *         description: Authentication required
 */
router.delete(
  '/:id',
  validateRequest(getBoardMeetingSchema),
  boardMeetingController.deleteBoardMeeting
);

/**
 * @swagger
 * /api/board-meetings/{id}/status:
 *   patch:
 *     summary: Update meeting status
 *     description: Update the status of a board meeting
 *     tags: [Board Meetings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Board meeting ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED]
 *                 example: IN_PROGRESS
 *     responses:
 *       200:
 *         description: Meeting status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/BoardMeeting'
 *       400:
 *         description: Invalid status transition
 *       404:
 *         description: Board meeting not found
 *       403:
 *         description: Access denied
 *       401:
 *         description: Authentication required
 */
router.patch(
  '/:id/status',
  validateRequest(getBoardMeetingSchema),
  boardMeetingController.updateMeetingStatus
);

export default router;
