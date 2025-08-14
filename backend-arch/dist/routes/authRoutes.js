"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const container_1 = require("../container");
const rateLimitMiddleware_1 = require("../middlewares/rateLimitMiddleware");
const router = (0, express_1.Router)();
const { authController, authMiddleware } = container_1.container;
router.post('/set-cookies', rateLimitMiddleware_1.authRateLimit, authController.setAuthCookies);
router.post('/refresh', rateLimitMiddleware_1.authRateLimit, authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/me', authMiddleware.authenticate, authController.getCurrentUser);
router.put('/profile', authMiddleware.authenticate, authController.updateProfile);
router.get('/organization/users', authMiddleware.authenticate, authMiddleware.requireOrganization, authController.getOrganizationUsers);
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);
router.post('/logout', authController.logout);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map