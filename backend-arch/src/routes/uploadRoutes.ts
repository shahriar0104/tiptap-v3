import { Router, type RequestHandler } from 'express';
import { UploadController } from '../controllers/uploadController';
import { validateRequest } from '../middlewares';
import {
  createUploadSchema,
  updateUploadSchema,
  getUploadParamsSchema,
} from '../validators/upload';
import multer from 'multer';
import { container } from '../container';

export function createUploadRoutes(uploadController: UploadController): Router {
  const router = Router();
  const upload = multer({ storage: multer.memoryStorage() });

  // Utility wrapper for async handlers/middlewares
  const wrap = (
    fn: (...args: Parameters<RequestHandler>) => Promise<unknown>
  ): RequestHandler => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

  // Apply authentication to all upload routes
  router.use(container.authMiddleware.authenticate);
  router.use(container.authMiddleware.requireOrganization);

  // POST /uploads - Create new upload
  /**
   * @swagger
   * /api/uploads:
   *   post:
   *     summary: Create a new upload
   *     tags: [Uploads]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - fileName
   *               - fileUrl
   *               - mimeType
   *             properties:
   *               fileName:
   *                 type: string
   *               fileUrl:
   *                 type: string
   *                 format: uri
   *               mimeType:
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
    '/',
    validateRequest({ body: createUploadSchema }),
    wrap(uploadController.createUpload)
  );

  // POST /uploads/file - Multipart upload
  /**
   * @swagger
   * /api/uploads/file:
   *   post:
   *     summary: Upload a file (multipart)
   *     tags: [Uploads]
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *               boardMeetingId:
   *                 type: string
   *                 format: uuid
   *                 description: Optional. Used to scope storage path.
   *               agendaItemId:
   *                 type: string
   *                 format: uuid
   *                 description: Optional. Used to scope storage path.
   *     responses:
   *       201:
   *         description: Created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  router.post('/file', upload.single('file'), wrap(uploadController.uploadFile));

  // GET /uploads - Get all uploads with pagination
  /**
   * @swagger
   * /api/uploads/user/{userId}:
   *   get:
   *     summary: List uploads (paginated)
   *     tags: [Uploads]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *     responses:
   *       200:
   *         description: Uploads retrieved
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PaginatedResponse'
   */
  router.get('/user/:userId', wrap(uploadController.getUploads));

  // GET /uploads/me - Get current user's uploads
  /**
   * @swagger
   * /api/uploads/me:
   *   get:
   *     summary: Get current user's uploads
   *     tags: [Uploads]
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  router.get('/me', wrap(uploadController.getUserUploads));

  // GET /uploads/:id - Get upload by ID
  /**
   * @swagger
   * /api/uploads/{id}:
   *   get:
   *     summary: Get upload by ID
   *     tags: [Uploads]
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
  router.get(
    '/:id',
    validateRequest({ params: getUploadParamsSchema }),
    wrap(uploadController.getUpload)
  );

  // GET /uploads/:id/signed-url - Generate a signed URL for secure download
  /**
   * @swagger
   * /api/uploads/{id}/signed-url:
   *   get:
   *     summary: Generate a signed URL for the upload
   *     tags: [Uploads]
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
   */
  router.get(
    '/:id/signed-url',
    validateRequest({ params: getUploadParamsSchema }),
    wrap(uploadController.getSignedUrl)
  );

  // PUT /uploads/:id - Update upload
  /**
   * @swagger
   * /api/uploads/{id}:
   *   put:
   *     summary: Update an upload
   *     tags: [Uploads]
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
   *               fileName:
   *                 type: string
   *               fileUrl:
   *                 type: string
   *                 format: uri
   *               mimeType:
   *                 type: string
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
      params: getUploadParamsSchema,
      body: updateUploadSchema,
    }),
    wrap(uploadController.updateUpload)
  );

  // DELETE /uploads/:id - Delete upload
  /**
   * @swagger
   * /api/uploads/{id}:
   *   delete:
   *     summary: Delete upload
   *     tags: [Uploads]
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
    validateRequest({ params: getUploadParamsSchema }),
    wrap(uploadController.deleteUpload)
  );

  return router;
}
