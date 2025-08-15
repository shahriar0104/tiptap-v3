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
  router.post('/', validateRequest({ body: createUploadSchema }), uploadController.createUpload);

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
  router.get('/user/:userId', uploadController.getUploads);

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
  router.get('/me', uploadController.getUserUploads);

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
  router.get('/:id', validateRequest({ params: getUploadParamsSchema }), uploadController.getUpload);

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
      body: updateUploadSchema 
    }),
    uploadController.updateUpload
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
  router.delete('/:id', validateRequest({ params: getUploadParamsSchema }), uploadController.deleteUpload);

  return router;
}
