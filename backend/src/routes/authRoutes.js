import express from 'express';
import authController from '../controllers/authController.js';
import {requireAdmin} from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Authentication]
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: User already exists
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Get Google OAuth URL
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Google OAuth URL generated
 */
router.post('/google', authController.googleAuth);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Handle Google OAuth callback
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect to frontend with token or error
 */
router.get('/google/callback', authController.googleCallback);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/profile', authController.getProfile);

/**
 * @swagger
 * /api/auth/create-organization:
 *   post:
 *     summary: Create organization for authenticated user
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organizationName
 *             properties:
 *               organizationName:
 *                 type: string
 *               domain:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Organization created successfully
 *       409:
 *         description: User already belongs to an organization
 */
router.post('/create-organization', authController.createOrganization);

/**
 * @swagger
 * /api/auth/join-organization:
 *   post:
 *     summary: Join organization for authenticated user
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organizationSlug
 *             properties:
 *               organizationSlug:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully joined organization
 *       404:
 *         description: Organization not found
 *       409:
 *         description: User already belongs to an organization
 */
router.post('/join-organization', authController.joinOrganization);

/**
 * @swagger
 * /api/auth/register-organization:
 *   post:
 *     summary: Register a new organization with admin user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organizationName
 *               - user
 *             properties:
 *               organizationName:
 *                 type: string
 *               domain:
 *                 type: string
 *               description:
 *                 type: string
 *               user:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                   name:
 *                     type: string
 *                   avatar:
 *                     type: string
 *     responses:
 *       201:
 *         description: Organization created successfully
 *       400:
 *         description: Invalid request data
 *       409:
 *         description: User already exists
 */
router.post('/register-organization', authController.registerOrganization);

/**
 * @swagger
 * /api/auth/callback:
 *   post:
 *     summary: Handle Supabase authentication callback
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - access_token
 *               - user
 *             properties:
 *               access_token:
 *                 type: string
 *               user:
 *                 type: object
 *     responses:
 *       200:
 *         description: Authentication successful
 *       401:
 *         description: Invalid token
 */
router.post('/callback', authController.handleAuthCallback);

/**
 * @swagger
 * /api/auth/join-organization:
 *   post:
 *     summary: Join an existing organization
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organizationSlug
 *               - userData
 *             properties:
 *               organizationSlug:
 *                 type: string
 *               userData:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                   name:
 *                     type: string
 *                   avatar:
 *                     type: string
 *     responses:
 *       201:
 *         description: Successfully joined organization
 *       404:
 *         description: Organization not found
 *       409:
 *         description: User already exists
 */
router.post('/join-organization', authController.joinOrganization);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', authController.updateProfile);

/**
 * @swagger
 * /api/auth/organization/members:
 *   get:
 *     summary: Get organization members (admin only)
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Organization members retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/organization/members', requireAdmin, authController.getOrganizationMembers);

export default router;
