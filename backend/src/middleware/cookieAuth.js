import supabase from '../config/supabase.js';
import { ApiError } from './errorHandler.js';

/**
 * Cookie configuration for secure authentication
 */
export const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Cross-site for production
  domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined,
  path: '/',
};

export const accessTokenConfig = {
  ...cookieConfig,
  maxAge: 60 * 60 * 1000, // 1 hour
};

export const refreshTokenConfig = {
  ...cookieConfig,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

/**
 * Set authentication cookies
 */
export const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('sb-access-token', accessToken, accessTokenConfig);
  res.cookie('sb-refresh-token', refreshToken, refreshTokenConfig);
};

/**
 * Clear authentication cookies
 */
export const clearAuthCookies = (res) => {
  res.clearCookie('sb-access-token', cookieConfig);
  res.clearCookie('sb-refresh-token', cookieConfig);
};

/**
 * Extract tokens from cookies
 */
export const getTokensFromCookies = (req) => {
  return {
    accessToken: req.cookies['sb-access-token'],
    refreshToken: req.cookies['sb-refresh-token'],
  };
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (refreshToken) => {
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
      user: data.user,
    };
  } catch (error) {
    throw new ApiError('Failed to refresh token', 401);
  }
};

/**
 * Verify access token with Supabase
 */
export const verifyAccessToken = async (accessToken) => {
  try {
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      throw new ApiError('Invalid access token', 401);
    }

    return data.user;
  } catch (error) {
    throw new ApiError('Token verification failed', 401);
  }
};

/**
 * Authentication middleware for protected routes
 * Automatically refreshes tokens if access token is expired
 */
export const authenticateWithCookies = async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = getTokensFromCookies(req);

    // No tokens present
    if (!accessToken && !refreshToken) {
      throw new ApiError('Authentication required', 401);
    }

    let user = null;

    // Try to verify access token first
    if (accessToken) {
      try {
        user = await verifyAccessToken(accessToken);
        req.user = { userId: user.id, email: user.email };
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
        
        req.user = { 
          userId: refreshResult.user.id, 
          email: refreshResult.user.email 
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
export const optionalAuth = async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = getTokensFromCookies(req);

    if (!accessToken && !refreshToken) {
      return next(); // No auth, continue
    }

    // Try to authenticate, but don't throw on failure
    if (accessToken) {
      try {
        const user = await verifyAccessToken(accessToken);
        req.user = { userId: user.id, email: user.email };
        return next();
      } catch (error) {
        // Try refresh
      }
    }

    if (refreshToken) {
      try {
        const refreshResult = await refreshAccessToken(refreshToken);
        setAuthCookies(res, refreshResult.accessToken, refreshResult.refreshToken);
        req.user = { 
          userId: refreshResult.user.id, 
          email: refreshResult.user.email 
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
