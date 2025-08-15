import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';
import { cookieConfig, COOKIE_NAMES } from '../config/cookies';

export class AuthController {
  constructor(private authService: AuthService) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        sendError(res, 'Email and password are required', 400);
        return;
      }

      const result = await this.authService.login(email, password);

      // Set authentication cookies
      res.cookie(COOKIE_NAMES.ACCESS_TOKEN, result.session.access_token, {
        ...cookieConfig,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      if (result.session.refresh_token) {
        res.cookie(COOKIE_NAMES.REFRESH_TOKEN, result.session.refresh_token, {
          ...cookieConfig,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
      }

      sendSuccess(res, result.user, 'Login successful');
    } catch (error) {
      next(error);
    }
  };

  getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      sendSuccess(res, user, 'User profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const updateData = req.body as { firstName?: string; lastName?: string; email?: string };

      const updatedUser = await this.authService.updateUserProfile(userId, updateData);
      sendSuccess(res, updatedUser, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  };

  logout = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Clear auth cookies
      res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, {
        ...cookieConfig,
        maxAge: 0,
      });
      res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, {
        ...cookieConfig,
        maxAge: 0,
      });

      sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  };

  // This endpoint would be called by Supabase auth webhook or frontend after successful auth
  setAuthCookies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { access_token, refresh_token } = req.body as { 
        access_token: string; 
        refresh_token: string; 
      };

      if (!access_token) {
        sendError(res, 'Access token is required', 400);
        return;
      }

      // Verify the token and get/create user
      const user = await this.authService.verifyToken(access_token);

      // Set HTTP-only cookies
      res.cookie(COOKIE_NAMES.ACCESS_TOKEN, access_token, cookieConfig);
      
      if (refresh_token) {
        res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refresh_token, cookieConfig);
      }

      sendSuccess(res, user, 'Authentication successful');
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies[COOKIE_NAMES.REFRESH_TOKEN] as string | undefined;
      
      if (!refreshToken) {
        sendError(res, 'Refresh token not found', 401);
        return;
      }

      // Here you would implement token refresh logic with Supabase
      // For now, we'll just return an error as this needs Supabase integration
      sendError(res, 'Token refresh not implemented yet', 501);
    } catch (error) {
      next(error);
    }
  };

  getOrganizationUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      
      if (!user.organizationId) {
        sendError(res, 'User is not part of an organization', 400);
        return;
      }

      const users = await this.authService.getUsersByOrganization(user.organizationId);
      sendSuccess(res, users, 'Organization users retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  googleAuth = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authUrl = await this.authService.getGoogleAuthUrl();
      res.redirect(authUrl);
    } catch (error) {
      next(error);
    }
  };

  googleCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { code, state } = req.query as { code?: string; state?: string };
      
      if (!code) {
        sendError(res, 'Authorization code not provided', 400);
        return;
      }

      const result = await this.authService.handleGoogleCallback(code, state);
      
      // Set authentication cookies
      res.cookie(COOKIE_NAMES.ACCESS_TOKEN, result.session.access_token, {
        ...cookieConfig,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });
      
      if (result.session.refresh_token) {
        res.cookie(COOKIE_NAMES.REFRESH_TOKEN, result.session.refresh_token, {
          ...cookieConfig,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
      }

      // Redirect to frontend
      const frontendUrl = process.env['FRONTEND_URL'] || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/dashboard`);
    } catch (error) {
      next(error);
    }
  };

  logoutUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const accessToken = req.cookies[COOKIE_NAMES.ACCESS_TOKEN];
      
      if (accessToken) {
        await this.authService.logout(accessToken);
      }

      // Clear authentication cookies
      res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, {
        ...cookieConfig,
        maxAge: 0,
      });
      res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, {
        ...cookieConfig,
        maxAge: 0,
      });
      
      sendSuccess(res, null, 'Successfully logged out');
    } catch (error) {
      next(error);
    }
  };
}
