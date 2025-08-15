import {NextFunction, Request, Response} from 'express';
import {supabase} from '../config/supabase';
import {UserModel} from '../models';
import {AuthenticatedRequest} from '../types';
import {ForbiddenError, UnauthorizedError} from '../utils/errors';
import {COOKIE_NAMES, cookieConfig} from '../config/cookies';

export class AuthMiddleware {
  constructor(private userModel: UserModel) {}

  // Define public routes that don't require authentication
  private readonly PUBLIC_ROUTES = [
    '/api/health',
    '/api-docs',
    '/api-docs/*', // Swagger UI static assets
    'POST:/api/auth/login',
    'POST:/api/auth/register',
    'POST:/api/auth/set-cookies',
    'POST:/api/auth/refresh',
    'POST:/api/auth/logout',
    'GET:/api/auth/google',
    'GET:/api/auth/google/callback',
    'POST:/api/auth/register-organization',
    'POST:/api/board-meetings/organization',
  ];

  // Helper function to check if a route is public
  private normalizePath = (path: string) =>
    path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;

  private isPublicRoute = (method: string, path: string): boolean => {
    const normalizedPath = this.normalizePath(path);
    const routeKey = `${method}:${normalizedPath}`;
    if (
      this.PUBLIC_ROUTES.includes(routeKey) ||
      this.PUBLIC_ROUTES.includes(normalizedPath)
    ) return true;

    return this.PUBLIC_ROUTES.some(route => {
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
  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const method = req.method;
      const path = req.path;

      // Skip authentication for public routes
      if (this.isPublicRoute(method, path)) {
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
      const { data: { user }, error } = await supabase.auth.getUser(accessToken);
      
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
  private handleTokenRefresh = async (req: Request, res: Response, refreshToken: string): Promise<void> => {
    try {
      // Refresh the session
      const session = await this.refreshAccessToken(refreshToken);
      
      // Set new cookies with refreshed tokens
      this.setAuthCookies(res, session);
      
      // Verify the new access token and get a user
      const { data: { user }, error } = await supabase.auth.getUser(session.access_token);
      
      if (error || !user) {
        throw new UnauthorizedError('Failed to authenticate with refreshed token');
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
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      try {
        const user = (req as AuthenticatedRequest).user;
        
        if (!user) {
          throw new UnauthorizedError('Authentication required');
        }

        if (user.role !== requiredRole) {
          throw new ForbiddenError(`Access denied. Required role: ${requiredRole}`);
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  };

  requireOrganization = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      
      if (!user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (!user.organizationId) {
        throw new ForbiddenError('User must be part of an organization');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
