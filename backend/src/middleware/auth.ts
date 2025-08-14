import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler.js';
import { AuthenticatedRequest, UserRole } from '../types/index.js';

/**
 * Middleware to check if user has admin role
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  if (authReq.user.role !== UserRole.ADMIN) {
    res.status(403).json({ success: false, message: 'Admin access required' });
    return;
  }

  next();
};

/**
 * Middleware to check if user has editor or admin role
 */
export const requireEditor = (req: Request, res: Response, next: NextFunction): void => {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  if (authReq.user.role !== UserRole.ADMIN && authReq.user.role !== UserRole.EDITOR) {
    res.status(403).json({ success: false, message: 'Editor or Admin role required' });
    return;
  }

  next();
};

/**
 * Middleware to ensure user can only access their organization's data
 */
export const requireSameOrganization = (organizationIdField: string = 'organizationId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    const resourceOrgId = req.params[organizationIdField] || req.body[organizationIdField];
    
    if (resourceOrgId && resourceOrgId !== authReq.user.organizationId) {
      return next(new ApiError('Access denied to this organization', 403));
    }
    
    next();
  };
};
