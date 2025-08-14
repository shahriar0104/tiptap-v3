"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const supabase_1 = require("../config/supabase");
const errors_1 = require("../utils/errors");
const cookies_1 = require("../config/cookies");
class AuthMiddleware {
    userModel;
    constructor(userModel) {
        this.userModel = userModel;
    }
    PUBLIC_ROUTES = [
        '/health',
        '/api-docs',
        'POST:/api/auth/login',
        'POST:/api/auth/register',
        'GET:/api/auth/google',
        'GET:/api/auth/google/callback',
        'POST:/api/auth/register-organization',
        'POST:/api/auth/logout',
        'POST:/api/board-meetings/organization',
    ];
    isPublicRoute = (method, path) => {
        const routeKey = `${method}:${path}`;
        const pathOnly = path;
        return this.PUBLIC_ROUTES.includes(routeKey) || this.PUBLIC_ROUTES.includes(pathOnly);
    };
    refreshAccessToken = async (refreshToken) => {
        const { data, error } = await supabase_1.supabase.auth.refreshSession({
            refresh_token: refreshToken,
        });
        if (error || !data.session) {
            throw new errors_1.UnauthorizedError('Failed to refresh token');
        }
        return data.session;
    };
    setAuthCookies = (res, session) => {
        res.cookie(cookies_1.COOKIE_NAMES.ACCESS_TOKEN, session.access_token, {
            ...cookies_1.cookieConfig,
            maxAge: 15 * 60 * 1000,
        });
        if (session.refresh_token) {
            res.cookie(cookies_1.COOKIE_NAMES.REFRESH_TOKEN, session.refresh_token, {
                ...cookies_1.cookieConfig,
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
        }
    };
    authenticate = async (req, res, next) => {
        try {
            const method = req.method;
            const path = req.path;
            if (this.isPublicRoute(method, path)) {
                return next();
            }
            let accessToken = req.cookies[cookies_1.COOKIE_NAMES.ACCESS_TOKEN];
            const refreshToken = req.cookies[cookies_1.COOKIE_NAMES.REFRESH_TOKEN];
            if (!accessToken && refreshToken) {
                try {
                    const session = await this.refreshAccessToken(refreshToken);
                    accessToken = session.access_token;
                    this.setAuthCookies(res, session);
                }
                catch (refreshError) {
                    res.clearCookie(cookies_1.COOKIE_NAMES.ACCESS_TOKEN);
                    res.clearCookie(cookies_1.COOKIE_NAMES.REFRESH_TOKEN);
                    throw new errors_1.UnauthorizedError('Authentication required - please login again');
                }
            }
            if (!accessToken) {
                throw new errors_1.UnauthorizedError('Authentication required');
            }
            const { data: { user: supabaseUser }, error } = await supabase_1.supabase.auth.getUser(accessToken);
            if (error || !supabaseUser) {
                if (refreshToken) {
                    try {
                        const session = await this.refreshAccessToken(refreshToken);
                        const { data: { user: refreshedUser }, error: refreshedError } = await supabase_1.supabase.auth.getUser(session.access_token);
                        if (refreshedError || !refreshedUser) {
                            throw new errors_1.UnauthorizedError('Invalid or expired token');
                        }
                        this.setAuthCookies(res, session);
                        const user = await this.userModel.findById(refreshedUser.id);
                        if (!user) {
                            throw new errors_1.UnauthorizedError('User not found');
                        }
                        req.user = user;
                        return next();
                    }
                    catch (refreshError) {
                        res.clearCookie(cookies_1.COOKIE_NAMES.ACCESS_TOKEN);
                        res.clearCookie(cookies_1.COOKIE_NAMES.REFRESH_TOKEN);
                        throw new errors_1.UnauthorizedError('Authentication required - please login again');
                    }
                }
                throw new errors_1.UnauthorizedError('Invalid or expired token');
            }
            const user = await this.userModel.findById(supabaseUser.id);
            if (!user) {
                throw new errors_1.UnauthorizedError('User not found');
            }
            req.user = user;
            next();
        }
        catch (error) {
            next(error);
        }
    };
    requireRole = (requiredRole) => {
        return async (req, _res, next) => {
            try {
                const user = req.user;
                if (!user) {
                    throw new errors_1.UnauthorizedError('Authentication required');
                }
                if (user.role !== requiredRole) {
                    throw new errors_1.ForbiddenError(`Access denied. Required role: ${requiredRole}`);
                }
                next();
            }
            catch (error) {
                next(error);
            }
        };
    };
    requireOrganization = async (req, _res, next) => {
        try {
            const user = req.user;
            if (!user) {
                throw new errors_1.UnauthorizedError('Authentication required');
            }
            if (!user.organizationId) {
                throw new errors_1.ForbiddenError('User must be part of an organization');
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AuthMiddleware = AuthMiddleware;
//# sourceMappingURL=authMiddleware.js.map