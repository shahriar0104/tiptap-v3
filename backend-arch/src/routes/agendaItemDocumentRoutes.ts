import { Router, type RequestHandler } from 'express';
import { AgendaItemDocumentController } from '../controllers/agendaItemDocumentController';
import { validateRequest } from '../middlewares';
import {
  createAgendaItemDocumentSchema,
  getAgendaItemDocumentParamsSchema,
  getAgendaItemDocumentsByItemParamsSchema,
} from '../validators/agendaItemDocument';
import { container } from '../container';

export function createAgendaItemDocumentRoutes(
  controller: AgendaItemDocumentController
): Router {
  const router = Router();

  // Utility wrapper for async handlers/middlewares
  const wrap = (
    fn: (...args: Parameters<RequestHandler>) => Promise<unknown>
  ): RequestHandler => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

  // Apply authentication and organization requirement to all routes
  router.use(container.authMiddleware.authenticate);
  router.use(container.authMiddleware.requireOrganization);

  // POST /agenda/documents - Create a new agenda item document
  /**
   * @swagger
   * /api/agenda/documents:
   *   post:
   *     summary: Create an agenda item document link
   *     tags: [Agenda]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - agendaItemId
   *               - uploadId
   *             properties:
   *               agendaItemId:
   *                 type: string
   *                 format: uuid
   *               uploadId:
   *                 type: string
   *                 format: uuid
   *               role:
   *                 type: string
   *                 enum: [CONTEXT, FIGURE, APPENDIX]
   *     responses:
   *       201:
   *         description: Created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  router.post(
    '/documents',
    validateRequest(createAgendaItemDocumentSchema),
    wrap(controller.create)
  );

  // GET /agenda/items/:agendaItemId/documents - List documents for an agenda item
  /**
   * @swagger
   * /api/agenda/items/{agendaItemId}/documents:
   *   get:
   *     summary: List documents for an agenda item
   *     tags: [Agenda]
   *     parameters:
   *       - in: path
   *         name: agendaItemId
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
    '/items/:agendaItemId/documents',
    validateRequest(getAgendaItemDocumentsByItemParamsSchema),
    wrap(controller.listByAgendaItem)
  );

  // GET /agenda/documents/:id - Get a document by ID
  /**
   * @swagger
   * /api/agenda/documents/{id}:
   *   get:
   *     summary: Get an agenda item document by ID
   *     tags: [Agenda]
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
    '/documents/:id',
    validateRequest(getAgendaItemDocumentParamsSchema),
    wrap(controller.getById)
  );

  // DELETE /agenda/documents/:id - Delete a document by ID
  /**
   * @swagger
   * /api/agenda/documents/{id}:
   *   delete:
   *     summary: Delete an agenda item document by ID
   *     tags: [Agenda]
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
    '/documents/:id',
    validateRequest(getAgendaItemDocumentParamsSchema),
    wrap(controller.delete)
  );

  return router;
}
