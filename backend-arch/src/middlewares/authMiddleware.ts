import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { UserModel } from '../models/userModel';
import { AuthenticatedRequest } from '../types';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { COOKIE_NAMES, cookieConfig } from '../config/cookies';

export class AuthMiddleware {
  constructor(private userModel: UserModel) {}

  // Define public routes that don't require authentication
  private readonly PUBLIC_ROUTES = [
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

  // Helper function to check if a route is public
  private isPublicRoute = (method: string, path: string): boolean => {
    const routeKey = `${method}:${path}`;
    const pathOnly = path;
    
    return this.PUBLIC_ROUTES.includes(routeKey) || this.PUBLIC_ROUTES.includes(pathOnly);
  };

  // Helper function to refresh access token using refresh token
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

      let accessToken = req.cookies[COOKIE_NAMES.ACCESS_TOKEN];
      const refreshToken = req.cookies[COOKIE_NAMES.REFRESH_TOKEN];

      // If no access token, try to refresh using refresh token
      if (!accessToken && refreshToken) {
        try {
          const session = await this.refreshAccessToken(refreshToken);
          accessToken = session.access_token;
          
          // Set new cookies with refreshed tokens
          this.setAuthCookies(res, session);
        } catch (refreshError) {
          // Clear invalid cookies
          res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN);
          res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN);
          throw new UnauthorizedError('Authentication required - please login again');
        }
      }

      if (!accessToken) {
        throw new UnauthorizedError('Authentication required');
      }

      // Verify token with Supabase
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(accessToken);
      
      if (error || !supabaseUser) {
        // Try to refresh token one more time if verification fails
        if (refreshToken) {
          try {
            const session = await this.refreshAccessToken(refreshToken);
            const { data: { user: refreshedUser }, error: refreshedError } = await supabase.auth.getUser(session.access_token);
            
            if (refreshedError || !refreshedUser) {
              throw new UnauthorizedError('Invalid or expired token');
            }
            
            // Set new cookies and use refreshed user
            this.setAuthCookies(res, session);
            
            // Fetch full user from database
            const user = await this.userModel.findById(refreshedUser.id);
            
            if (!user) {
              throw new UnauthorizedError('User not found');
            }

            // Attach user to request
            (req as AuthenticatedRequest).user = user;
            return next();
          } catch (refreshError) {
            // Clear invalid cookies
            res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN);
            res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN);
            throw new UnauthorizedError('Authentication required - please login again');
          }
        }
        
        throw new UnauthorizedError('Invalid or expired token');
      }

      // Fetch full user from database
      const user = await this.userModel.findById(supabaseUser.id);
      
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      // Attach user to request
      (req as AuthenticatedRequest).user = user;
      
      next();
    } catch (error) {
      next(error);
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
