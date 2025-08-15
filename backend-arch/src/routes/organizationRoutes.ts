import { Router, type RequestHandler } from 'express';
import { container } from '../container';

const router = Router();
const { organizationController, authMiddleware } = container;

// Wrap async handlers to avoid returning Promises to Express and satisfy lint rules
const wrap = (
  fn: (...args: Parameters<RequestHandler>) => Promise<unknown>
): RequestHandler => (req, res, next) => {
  void fn(req, res, next);
};

/**
 * @swagger
 * /api/organizations:
 *   post:
 *     summary: Create organization with admin user
 *     description: Creates a new organization and admin user in a single transaction
 *     tags: [Organizations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organizationName
 *               - adminEmail
 *               - adminPassword
 *               - adminFirstName
 *               - adminLastName
 *             properties:
 *               organizationName:
 *                 type: string
 *                 example: Acme Corporation
 *               adminEmail:
 *                 type: string
 *                 format: email
 *                 example: admin@acme.com
 *               adminPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *               adminFirstName:
 *                 type: string
 *                 example: John
 *               adminLastName:
 *                 type: string
 *                 example: Doe
 *     responses:
 *       201:
 *         description: Organization and admin user created successfully
 */
router.post('/', wrap(organizationController.createOrganization));

// Protected organization routes
router.use(wrap(authMiddleware.requireOrganization));

/**
 * @swagger
 * /api/organizations/{organizationId}/meetings:
 *   get:
 *     summary: Get organization meetings
 *     description: Retrieve all board meetings for the specified organization
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Organization meetings retrieved successfully
 */
router.get(
  '/:organizationId/meetings',
  wrap(organizationController.getOrganizationMeetings)
);

export default router;
