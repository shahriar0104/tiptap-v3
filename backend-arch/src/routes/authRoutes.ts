import { Router } from 'express';
import { container } from '../container';
import { authRateLimit } from '../middlewares/rateLimitMiddleware';

const router = Router();
const { authController, authMiddleware } = container;

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user with email and password
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - missing email or password
 *       401:
 *         description: Invalid email or password
 *       429:
 *         description: Too many requests
 */
router.post('/login', authRateLimit, authController.login);

// Removed legacy endpoints: /set-cookies and /refresh (handled internally by backend)

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Clear authentication cookies and logout user
 *     tags: [Authentication]
 *     security: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve the authenticated user's profile information
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Authentication required
 */
router.get('/me', authController.getCurrentUser);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update the authenticated user's profile information
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Authentication required
 *       409:
 *         description: Email already exists
 */
router.put('/profile', authController.updateProfile);

/**
 * @swagger
 * /api/auth/organization/users:
 *   get:
 *     summary: Get organization users
 *     description: Retrieve all users in the authenticated user's organization
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Organization users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       400:
 *         description: User is not part of an organization
 *       401:
 *         description: Authentication required
 */
router.get(
  '/organization/users',
  authMiddleware.requireOrganization,
  authController.getOrganizationUsers
);

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     description: Redirects user to Google OAuth consent screen
 *     tags: [Authentication]
 *     security: []
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 *       500:
 *         description: Server error
 */
router.get('/google', authRateLimit, authController.googleAuth);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Handle Google OAuth callback
 *     description: Exchanges authorization code for Supabase session and sets auth cookies. Does not create an application user.
 *     tags: [Authentication]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: OAuth authorization code
 *
 *     responses:
 *       302:
 *         description: Redirect to frontend with auth cookies set
 *       400:
 *         description: OAuth error or missing code
 *       500:
 *         description: Server error
 */
router.get('/google/callback', authRateLimit, authController.googleCallback);

export default router;
