import { Router } from 'express';
import { container } from '../container';
import { authRateLimit } from '../middlewares/rateLimitMiddleware';

const router = Router();
const { authController, authMiddleware } = container;

/**
 * @swagger
 * /api/auth/set-cookies:
 *   post:
 *     summary: Set authentication cookies
 *     description: Set HTTP-only cookies for authentication tokens after successful Supabase auth
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - access_token
 *             properties:
 *               access_token:
 *                 type: string
 *                 description: JWT access token from Supabase
 *               refresh_token:
 *                 type: string
 *                 description: JWT refresh token from Supabase
 *     responses:
 *       200:
 *         description: Authentication successful
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
 *         description: Bad request - missing access token
 *       401:
 *         description: Invalid token
 *       429:
 *         description: Too many requests
 */
router.post('/set-cookies', authRateLimit, authController.setAuthCookies);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh authentication token
 *     description: Refresh the access token using the refresh token
 *     tags: [Authentication]
 *     security: []
 *     responses:
 *       501:
 *         description: Not implemented yet
 *       401:
 *         description: Refresh token not found
 *       429:
 *         description: Too many requests
 */
router.post('/refresh', authRateLimit, authController.refreshToken);

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
router.get('/me', authMiddleware.authenticate, authController.getCurrentUser);

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
router.put('/profile', authMiddleware.authenticate, authController.updateProfile);

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
router.get('/organization/users', 
  authMiddleware.authenticate, 
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
router.get('/google', authController.googleAuth);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Handle Google OAuth callback
 *     description: Processes Google OAuth callback and creates/logs in user
 *     tags: [Authentication]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: OAuth authorization code
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: OAuth state parameter
 *     responses:
 *       302:
 *         description: Redirect to frontend with auth cookies set
 *       400:
 *         description: OAuth error or missing code
 *       500:
 *         description: Server error
 */
router.get('/google/callback', authController.googleCallback);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Clears authentication cookies and logs out user
 *     tags: [Authentication]
 *     security: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Server error
 */
router.post('/logout', authController.logout);

export default router;
