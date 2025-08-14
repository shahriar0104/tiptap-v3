import supabase from '../config/supabase.js';
import database from '../config/database.js';
import { ApiError } from './errorHandler.js';

/**
 * Middleware to authenticate requests using Supabase JWT tokens
 */
export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError('Authentication token required', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new ApiError('Invalid or expired token', 401);
    }

    // Get user data from our database
    const dbUser = await database.prisma.user.findUnique({
      where: { email: user.email },
      include: {
        organization: true
      }
    });

    if (!dbUser || !dbUser.isActive) {
      throw new ApiError('User not found or inactive', 401);
    }

    // Attach user and organization to request
    req.user = dbUser;
    req.organization = dbUser.organization;
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user has admin role
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return next(new ApiError('Admin access required', 403));
  }
  next();
};

/**
 * Middleware to check if user has editor or admin role
 */
export const requireEditor = (req, res, next) => {
  if (!req.user || !['ADMIN', 'EDITOR'].includes(req.user.role)) {
    return next(new ApiError('Editor or Admin access required', 403));
  }
  next();
};

/**
 * Middleware to ensure user can only access their organization's data
 */
export const requireSameOrganization = (organizationIdField = 'organizationId') => {
  return (req, res, next) => {
    const resourceOrgId = req.params[organizationIdField] || req.body[organizationIdField];
    
    if (resourceOrgId && resourceOrgId !== req.user.organizationId) {
      return next(new ApiError('Access denied to this organization', 403));
    }
    
    next();
  };
};
