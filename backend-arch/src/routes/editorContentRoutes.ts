import { Router } from 'express';
import { EditorContentController } from '../controllers/editorContentController';
import { authenticate } from '../middlewares';
import { validateRequest } from '../middlewares';
import {
  createEditorContentSchema,
  updateEditorContentSchema,
  getEditorContentParamsSchema,
  getBoardMeetingParamsSchema,
  createVersionSchema,
} from '../validators/editorContent';

export function createEditorContentRoutes(editorContentController: EditorContentController): Router {
  const router = Router();

  // Apply authentication to all editor content routes
  router.use(authenticate);

  // POST /editor-content - Create new editor content
  /**
   * @swagger
   * /api/editor-content:
   *   post:
   *     summary: Create new editor content
   *     tags: [Editor Content]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - boardMeetingId
   *               - contentJson
   *             properties:
   *               boardMeetingId:
   *                 type: string
   *                 format: uuid
   *               contentJson:
   *                 description: Tiptap JSON content
   *                 type: object
   *               version:
   *                 type: integer
   *                 description: Optional version number
   *     responses:
   *       201:
   *         description: Created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  router.post('/', validateRequest({ body: createEditorContentSchema }), editorContentController.createEditorContent);

  // GET /editor-content/:id - Get editor content by ID
  /**
   * @swagger
   * /api/editor-content/{id}:
   *   get:
   *     summary: Get editor content by ID
   *     tags: [Editor Content]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
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
  router.get('/:id', validateRequest({ params: getEditorContentParamsSchema }), editorContentController.getEditorContent);

  // PUT /editor-content/:id - Update editor content
  /**
   * @swagger
   * /api/editor-content/{id}:
   *   put:
   *     summary: Update editor content
   *     tags: [Editor Content]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               contentJson:
   *                 description: Tiptap JSON content
   *                 type: object
   *               version:
   *                 type: integer
   *     responses:
   *       200:
   *         description: Updated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  router.put(
    '/:id',
    validateRequest({ 
      params: getEditorContentParamsSchema,
      body: updateEditorContentSchema 
    }),
    editorContentController.updateEditorContent
  );

  // DELETE /editor-content/:id - Delete editor content
  /**
   * @swagger
   * /api/editor-content/{id}:
   *   delete:
   *     summary: Delete editor content by ID
   *     tags: [Editor Content]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Deleted
   *       404:
   *         description: Not found
   */
  router.delete(
    '/:id',
    validateRequest({ params: getEditorContentParamsSchema }),
    editorContentController.deleteEditorContent
  );

  // GET /editor-content/board-meeting/:boardMeetingId - Get editor content by board meeting ID
  /**
   * @swagger
   * /api/editor-content/board-meeting/{boardMeetingId}:
   *   get:
   *     summary: Get all editor content for a board meeting
   *     tags: [Editor Content]
   *     parameters:
   *       - in: path
   *         name: boardMeetingId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: OK
   */
  router.get(
    '/board-meeting/:boardMeetingId',
    validateRequest({ params: getBoardMeetingParamsSchema }),
    editorContentController.getEditorContentByBoardMeeting
  );

  // GET /editor-content/board-meeting/:boardMeetingId/latest - Get latest editor content for a board meeting
  /**
   * @swagger
   * /api/editor-content/board-meeting/{boardMeetingId}/latest:
   *   get:
   *     summary: Get latest editor content for a board meeting
   *     tags: [Editor Content]
   *     parameters:
   *       - in: path
   *         name: boardMeetingId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: OK
   */
  router.get(
    '/board-meeting/:boardMeetingId/latest',
    validateRequest({ params: getBoardMeetingParamsSchema }),
    editorContentController.getLatestEditorContent
  );

  // POST /editor-content/board-meeting/:boardMeetingId/version - Create new version for a board meeting
  /**
   * @swagger
   * /api/editor-content/board-meeting/{boardMeetingId}/version:
   *   post:
   *     summary: Create a new version for a board meeting
   *     tags: [Editor Content]
   *     parameters:
   *       - in: path
   *         name: boardMeetingId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - contentJson
   *             properties:
   *               contentJson:
   *                 description: Tiptap JSON content
   *                 type: object
   *     responses:
   *       201:
   *         description: Created
   */
  router.post(
    '/board-meeting/:boardMeetingId/version',
    validateRequest({ 
      params: getBoardMeetingParamsSchema,
      body: createVersionSchema 
    }),
    editorContentController.createNewVersion
  );

  return router;
}
