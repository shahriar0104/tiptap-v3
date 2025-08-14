import { Request, Response, NextFunction, CookieOptions } from 'express';
import { User as SupabaseUser } from '@supabase/supabase-js';
import supabase from '../config/supabase.js';
import { ApiError } from './errorHandler.js';
import database from '../config/database.js';
import { AuthenticatedRequest, AuthenticatedUser, UserRole, AuthCookies } from '../types/index.js';

/**
 * Cookie configuration for secure authentication
 */
export const cookieConfig: CookieOptions = {
  httpOnly: true,
  secure: process.env['NODE_ENV'] === 'production', // HTTPS only in production
  sameSite: process.env['NODE_ENV'] === 'production' ? 'none' : 'lax', // Cross-site for production
  domain: process.env['NODE_ENV'] === 'production' ? process.env['COOKIE_DOMAIN'] : undefined,
  path: '/',
};

export const accessTokenConfig: CookieOptions = {
  ...cookieConfig,
  maxAge: 60 * 60 * 1000, // 1 hour
};

export const refreshTokenConfig: CookieOptions = {
  ...cookieConfig,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

/**
 * Set authentication cookies
 */
export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string): void => {
  res.cookie('sb-access-token', accessToken, accessTokenConfig);
  res.cookie('sb-refresh-token', refreshToken, refreshTokenConfig);
};

/**
 * Clear authentication cookies
 */
export const clearAuthCookies = (res: Response): void => {
  res.clearCookie('sb-access-token', cookieConfig);
  res.clearCookie('sb-refresh-token', cookieConfig);
};

/**
 * Extract tokens from cookies
 */
export const getTokensFromCookies = (req: Request): AuthCookies => {
  return {
    accessToken: req.cookies['sb-access-token'] as string,
    refreshToken: req.cookies['sb-refresh-token'] as string,
  };
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  user: SupabaseUser;
}> => {
  try {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw new ApiError('Invalid refresh token', 401);
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: data.user!,
    };
  } catch (error) {
    throw new ApiError('Failed to refresh token', 401);
  }
};

/**
 * Verify access token with Supabase and get complete user data from database
 */
export const verifyAccessToken = async (accessToken: string): Promise<{
  supabaseUser: SupabaseUser;
  dbUser: AuthenticatedUser;
}> => {
  try {
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      throw new ApiError('Invalid access token', 401);
    }

    // Get complete user data from database including organization
    const dbUser = await database.getClient().user.findUnique({
      where: { id: data.user.id },
      include: { organization: true },
    });

    if (!dbUser) {
      // Auto-create user if missing in database (handles edge cases)
      const newUser = await database.getClient().user.create({
        data: {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.['full_name'] || data.user.user_metadata?.['name'] || '',
          avatar: data.user.user_metadata?.['avatar_url'] || null,
          role: UserRole.MEMBER,
        },
        include: { organization: true },
      });
      const authenticatedUser: AuthenticatedUser = {
        ...newUser,
        organization: newUser.organization || undefined,
      };
      
      return { supabaseUser: data.user, dbUser: authenticatedUser };
    }

    if (!dbUser.isActive) {
      throw new ApiError('User account is inactive', 401);
    }

    const authenticatedUser: AuthenticatedUser = {
      ...dbUser,
      organizationId: dbUser.organizationId || '',
    };

    return { supabaseUser: data.user, dbUser: authenticatedUser };
  } catch (error) {
    throw new ApiError('Token verification failed', 401);
  }
};

/**
 * Authentication middleware for protected routes
 * Automatically refreshes tokens if the access token is expired
 */
export const authenticateWithCookies = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { accessToken, refreshToken } = getTokensFromCookies(req);

    // No tokens present
    if (!accessToken && !refreshToken) {
      throw new ApiError('Authentication required', 401);
    }

    // Try to verify the access token first
    if (accessToken) {
      try {
        const { supabaseUser, dbUser } = await verifyAccessToken(accessToken);
        
        // Set consistent req.user structure with complete user data
        (req as AuthenticatedRequest).user = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          avatar: dbUser.avatar,
          role: dbUser.role,
          isActive: dbUser.isActive,
          organizationId: dbUser.organizationId,
          organization: dbUser.organization,
          createdAt: dbUser.createdAt,
          updatedAt: dbUser.updatedAt,
        };
        
        return next();
      } catch (error) {
        // Access token is invalid/expired, try refresh
        console.log('Access token expired, attempting refresh...');
      }
    }

    // Access token failed or missing, try refresh token
    if (refreshToken) {
      try {
        const refreshResult = await refreshAccessToken(refreshToken);
        
        // Set new cookies with refreshed tokens
        setAuthCookies(res, refreshResult.accessToken, refreshResult.refreshToken);
        
        // Get complete user data for a refresh result too
        const { supabaseUser, dbUser } = await verifyAccessToken(refreshResult.accessToken);
        
        // Set consistent req.user structure
        (req as AuthenticatedRequest).user = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          avatar: dbUser.avatar,
          role: dbUser.role,
          isActive: dbUser.isActive,
          organizationId: dbUser.organizationId,
          organization: dbUser.organization,
          createdAt: dbUser.createdAt,
          updatedAt: dbUser.updatedAt,
        };
        
        console.log('Token refreshed successfully');
        return next();
      } catch (error) {
        // Refresh token is also invalid
        clearAuthCookies(res);
        throw new ApiError('Session expired, please login again', 401);
      }
    }

    // No valid tokens
    clearAuthCookies(res);
    throw new ApiError('Authentication required', 401);
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware - doesn't throw if no auth
 * Useful for routes that work for both authenticated and unauthenticated users
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { accessToken, refreshToken } = getTokensFromCookies(req);

    if (!accessToken && !refreshToken) {
      return next(); // No auth, continue
    }

    // Try to authenticate, but don't throw on failure
    if (accessToken) {
      try {
        const { supabaseUser, dbUser } = await verifyAccessToken(accessToken);
        (req as AuthenticatedRequest).user = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          avatar: dbUser.avatar,
          role: dbUser.role,
          isActive: dbUser.isActive,
          organizationId: dbUser.organizationId,
          organization: dbUser.organization,
          createdAt: dbUser.createdAt,
          updatedAt: dbUser.updatedAt,
        };
        return next();
      } catch (error) {
        // Try refresh
      }
    }

    if (refreshToken) {
      try {
        const refreshResult = await refreshAccessToken(refreshToken);
        setAuthCookies(res, refreshResult.accessToken, refreshResult.refreshToken);
        
        const { supabaseUser, dbUser } = await verifyAccessToken(refreshResult.accessToken);
        (req as AuthenticatedRequest).user = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          avatar: dbUser.avatar,
          role: dbUser.role,
          isActive: dbUser.isActive,
          organizationId: dbUser.organizationId,
          organization: dbUser.organization,
          createdAt: dbUser.createdAt,
          updatedAt: dbUser.updatedAt,
        };
        return next();
      } catch (error) {
        // Clear invalid cookies but don't throw
        clearAuthCookies(res);
      }
    }

    next(); // Continue without auth
  } catch (error) {
    next(); // Continue without auth on any error
  }
};
