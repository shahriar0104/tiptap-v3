"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const response_1 = require("../utils/response");
const cookies_1 = require("../config/cookies");
class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    getCurrentUser = async (req, res, next) => {
        try {
            const user = req.user;
            (0, response_1.sendSuccess)(res, user, 'User profile retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    updateProfile = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const updateData = req.body;
            const updatedUser = await this.authService.updateUserProfile(userId, updateData);
            (0, response_1.sendSuccess)(res, updatedUser, 'Profile updated successfully');
        }
        catch (error) {
            next(error);
        }
    };
    logout = async (_req, res, next) => {
        try {
            res.clearCookie(cookies_1.COOKIE_NAMES.ACCESS_TOKEN, {
                ...cookies_1.cookieConfig,
                maxAge: 0,
            });
            res.clearCookie(cookies_1.COOKIE_NAMES.REFRESH_TOKEN, {
                ...cookies_1.cookieConfig,
                maxAge: 0,
            });
            (0, response_1.sendSuccess)(res, null, 'Logged out successfully');
        }
        catch (error) {
            next(error);
        }
    };
    setAuthCookies = async (req, res, next) => {
        try {
            const { access_token, refresh_token } = req.body;
            if (!access_token) {
                (0, response_1.sendError)(res, 'Access token is required', 400);
                return;
            }
            const user = await this.authService.verifyToken(access_token);
            res.cookie(cookies_1.COOKIE_NAMES.ACCESS_TOKEN, access_token, cookies_1.cookieConfig);
            if (refresh_token) {
                res.cookie(cookies_1.COOKIE_NAMES.REFRESH_TOKEN, refresh_token, cookies_1.cookieConfig);
            }
            (0, response_1.sendSuccess)(res, user, 'Authentication successful');
        }
        catch (error) {
            next(error);
        }
    };
    refreshToken = async (req, res, next) => {
        try {
            const refreshToken = req.cookies[cookies_1.COOKIE_NAMES.REFRESH_TOKEN];
            if (!refreshToken) {
                (0, response_1.sendError)(res, 'Refresh token not found', 401);
                return;
            }
            (0, response_1.sendError)(res, 'Token refresh not implemented yet', 501);
        }
        catch (error) {
            next(error);
        }
    };
    getOrganizationUsers = async (req, res, next) => {
        try {
            const user = req.user;
            if (!user.organizationId) {
                (0, response_1.sendError)(res, 'User is not part of an organization', 400);
                return;
            }
            const users = await this.authService.getUsersByOrganization(user.organizationId);
            (0, response_1.sendSuccess)(res, users, 'Organization users retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    googleAuth = async (_req, res, next) => {
        try {
            const authUrl = await this.authService.getGoogleAuthUrl();
            res.redirect(authUrl);
        }
        catch (error) {
            next(error);
        }
    };
    googleCallback = async (req, res, next) => {
        try {
            const { code, state } = req.query;
            if (!code) {
                (0, response_1.sendError)(res, 'Authorization code not provided', 400);
                return;
            }
            const result = await this.authService.handleGoogleCallback(code, state);
            res.cookie(cookies_1.COOKIE_NAMES.ACCESS_TOKEN, result.session.access_token, {
                ...cookies_1.cookieConfig,
                maxAge: 15 * 60 * 1000,
            });
            if (result.session.refresh_token) {
                res.cookie(cookies_1.COOKIE_NAMES.REFRESH_TOKEN, result.session.refresh_token, {
                    ...cookies_1.cookieConfig,
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });
            }
            const frontendUrl = process.env['FRONTEND_URL'] || 'http://localhost:3000';
            res.redirect(`${frontendUrl}/dashboard`);
        }
        catch (error) {
            next(error);
        }
    };
    logoutUser = async (req, res, next) => {
        try {
            const accessToken = req.cookies[cookies_1.COOKIE_NAMES.ACCESS_TOKEN];
            if (accessToken) {
                await this.authService.logout(accessToken);
            }
            res.clearCookie(cookies_1.COOKIE_NAMES.ACCESS_TOKEN, {
                ...cookies_1.cookieConfig,
                maxAge: 0,
            });
            res.clearCookie(cookies_1.COOKIE_NAMES.REFRESH_TOKEN, {
                ...cookies_1.cookieConfig,
                maxAge: 0,
            });
            (0, response_1.sendSuccess)(res, null, 'Successfully logged out');
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map