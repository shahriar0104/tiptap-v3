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
  router.post('/', validateRequest({ body: createEditorContentSchema }), editorContentController.createEditorContent);

  // GET /editor-content/:id - Get editor content by ID
  router.get('/:id', validateRequest({ params: getEditorContentParamsSchema }), editorContentController.getEditorContent);

  // PUT /editor-content/:id - Update editor content
  router.put(
    '/:id',
    validateRequest({ 
      params: getEditorContentParamsSchema,
      body: updateEditorContentSchema 
    }),
    editorContentController.updateEditorContent
  );

  // DELETE /editor-content/:id - Delete editor content
  router.delete(
    '/:id',
    validateRequest({ params: getEditorContentParamsSchema }),
    editorContentController.deleteEditorContent
  );

  // GET /editor-content/board-meeting/:boardMeetingId - Get editor content by board meeting ID
  router.get(
    '/board-meeting/:boardMeetingId',
    validateRequest({ params: getBoardMeetingParamsSchema }),
    editorContentController.getEditorContentByBoardMeeting
  );

  // GET /editor-content/board-meeting/:boardMeetingId/latest - Get latest editor content for a board meeting
  router.get(
    '/board-meeting/:boardMeetingId/latest',
    validateRequest({ params: getBoardMeetingParamsSchema }),
    editorContentController.getLatestEditorContent
  );

  // POST /editor-content/board-meeting/:boardMeetingId/version - Create new version for a board meeting
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
