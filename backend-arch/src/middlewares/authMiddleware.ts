import { NextFunction, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { UserModel } from '../models';
import { AuthenticatedRequest } from '../types';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import { COOKIE_NAMES, cookieConfig } from '../config/cookies';

export class AuthMiddleware {
  constructor(private userModel: UserModel) {}

  // Define protected routes that require authentication (default: everything is public)
  // Adjust this list to fine-tune which endpoints require an authenticated user.
  private readonly PROTECTED_ROUTES = [
    // Auth endpoints that require an authenticated user
    '/api/auth/me',
    'GET:/api/auth/me',
    '/api/auth/profile',
    'PUT:/api/auth/profile',
    '/api/auth/organization/users',
    'GET:/api/auth/organization/users',
    // Board meetings
    '/api/board-meetings',
    '/api/board-meetings/*',
    // Organizations (protect GET endpoints; POST /api/organizations is public for signup)
    'GET:/api/organizations',
    'GET:/api/organizations/*',
    // Agenda groups/items
    '/api/agenda',
    '/api/agenda/*',
    // Editor content
    '/api/editor-content',
    '/api/editor-content/*',
    // Uploads
    '/api/uploads',
    '/api/uploads/*',
  ];

  // Helper function to check if a route is public
  private normalizePath = (path: string) =>
    path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;

  private isProtectedRoute = (method: string, path: string): boolean => {
    const normalizedPath = this.normalizePath(path);
    const routeKey = `${method}:${normalizedPath}`;

    if (
      this.PROTECTED_ROUTES.includes(routeKey) ||
      this.PROTECTED_ROUTES.includes(normalizedPath)
    )
      return true;

    return this.PROTECTED_ROUTES.some(route => {
      if (route.includes('*')) {
        const pattern = route.replace(/\*/g, '.*');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(routeKey) || regex.test(path);
      }
      return false;
    });
  };

  // Helper functions to refresh access token using refresh token
  private refreshAccessToken = async (refreshToken: string) => {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw new UnauthorizedError('Failed to refresh token');
    }

    return data.session;
  };

  // Helper function to set auth cookies
  private setAuthCookies = (res: Response, session: any): void => {
    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, session.access_token, {
      ...cookieConfig,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    if (session.refresh_token) {
      res.cookie(COOKIE_NAMES.REFRESH_TOKEN, session.refresh_token, {
        ...cookieConfig,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }
  };

  // Central authentication middleware
  authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const method = req.method;
      const path = req.path;

      // Default public: only authenticate for protected routes
      if (!this.isProtectedRoute(method, path)) {
        return next();
      }

      const accessToken = req.cookies[COOKIE_NAMES.ACCESS_TOKEN];
      const refreshToken = req.cookies[COOKIE_NAMES.REFRESH_TOKEN];

      // Step 1: Check if access token exists
      if (!accessToken) {
        // No access token, try refresh token if available
        if (refreshToken) {
          await this.handleTokenRefresh(req, res, refreshToken);
          return next();
        } else {
          throw new UnauthorizedError('Authentication required');
        }
      }

      // Step 2: Verify access token
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(accessToken);

      if (error || !user) {
        // Access token is invalid/expired, try refresh token
        if (refreshToken) {
          await this.handleTokenRefresh(req, res, refreshToken);
          return next();
        } else {
          throw new UnauthorizedError('Invalid or expired token');
        }
      }

      // Step 3: Access token is valid, get user from database
      const dbUser = await this.userModel.findById(user.id);
      if (!dbUser) {
        throw new UnauthorizedError('User not found');
      }

      // Attach user to request
      (req as AuthenticatedRequest).user = dbUser;
      next();
    } catch (error) {
      next(error);
    }
  };

  // Helper method to handle token refresh
  private handleTokenRefresh = async (
    req: Request,
    res: Response,
    refreshToken: string
  ): Promise<void> => {
    try {
      // Refresh the session
      const session = await this.refreshAccessToken(refreshToken);

      // Set new cookies with refreshed tokens
      this.setAuthCookies(res, session);

      // Verify the new access token and get a user
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(session.access_token);

      if (error || !user) {
        throw new UnauthorizedError(
          'Failed to authenticate with refreshed token'
        );
      }

      // Get user from database
      const dbUser = await this.userModel.findById(user.id);
      if (!dbUser) {
        throw new UnauthorizedError('User not found');
      }

      // Attach user to request
      (req as AuthenticatedRequest).user = dbUser;
    } catch (error) {
      throw new UnauthorizedError('Authentication failed');
    }
  };

  // Legacy methods for backward compatibility
  requireRole = (requiredRole: string) => {
    return async (
      req: Request,
      _res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const user = (req as AuthenticatedRequest).user;

        if (!user) {
          throw new UnauthorizedError('Authentication required');
        }

        if (user.role !== requiredRole) {
          throw new ForbiddenError(
            `Access denied. Required role: ${requiredRole}`
          );
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  };

  requireOrganization = async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;

      if (!user) {
        throw new UnauthorizedError('Authentication required');
      }

      // Organization membership will be checked at the service level if needed
      // The user model no longer has organizationId directly
      next();
    } catch (error) {
      next(error);
    }
  };
}

// Export a function for easier use in routes
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // This will be initialized by the container
  const authMiddleware = (req as any).authMiddleware as AuthMiddleware;
  return authMiddleware.authenticate(req, res, next);
};
