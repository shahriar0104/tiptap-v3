import { Router } from 'express';
import { UploadController } from '../controllers/uploadController';
import { authenticate } from '../middlewares';
import { validateRequest } from '../middlewares';
import {
  createUploadSchema,
  updateUploadSchema,
  getUploadParamsSchema,
} from '../validators/upload';

export function createUploadRoutes(uploadController: UploadController): Router {
  const router = Router();

  // Apply authentication to all upload routes
  router.use(authenticate);

  // POST /uploads - Create new upload
  router.post('/', validateRequest({ body: createUploadSchema }), uploadController.createUpload);

  // GET /uploads - Get all uploads with pagination
  router.get('/user/:userId', uploadController.getUploads);

  // GET /uploads/me - Get current user's uploads
  router.get('/me', uploadController.getUserUploads);

  // GET /uploads/:id - Get upload by ID
  router.get('/:id', validateRequest({ params: getUploadParamsSchema }), uploadController.getUpload);

  // PUT /uploads/:id - Update upload
  router.put(
    '/:id',
    validateRequest({ 
      params: getUploadParamsSchema,
      body: updateUploadSchema 
    }),
    uploadController.updateUpload
  );

  // DELETE /uploads/:id - Delete upload
  router.delete('/:id', validateRequest({ params: getUploadParamsSchema }), uploadController.deleteUpload);

  return router;
}
