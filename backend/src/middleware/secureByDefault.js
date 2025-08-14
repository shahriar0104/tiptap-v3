import { authenticateWithCookies } from './cookieAuth.js';

/**
 * Secure by Default Middleware
 * 
 * This middleware ensures all routes are protected by authentication
 * unless explicitly marked as public.
 * 
 * Usage:
 * 1. Apply this middleware globally to all /api routes
 * 2. Define public routes that should bypass authentication
 * 3. All other routes will automatically require authentication
 */

// Define public routes that don't require authentication
// Note: paths are relative to /api since middleware is applied to /api routes
const PUBLIC_ROUTES = [
  // Health check and system routes (full paths)
  '/health',
  '/api-docs',
  
  // Authentication routes (paths relative to /api)
  'POST:/auth/login',
  'POST:/auth/register',
  'GET:/auth/google',
  'GET:/auth/google/callback',
  'POST:/auth/register-organization',
  'POST:/auth/logout',
  
  // Add any other public routes here
  // 'GET:/public-endpoint',
];

/**
 * Check if a route should be public (no authentication required)
 */
function isPublicRoute(method, path) {
  // Check exact method:path matches
  const methodPath = `${method}:${path}`;
  if (PUBLIC_ROUTES.includes(methodPath)) {
    return true;
  }
  
  // Check path-only matches (any method)
  if (PUBLIC_ROUTES.includes(path)) {
    return true;
  }
  
  // Check for wildcard patterns
  return PUBLIC_ROUTES.some(route => {
    if (route.includes('*')) {
      const pattern = route.replace(/\*/g, '.*');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(methodPath) || regex.test(path);
    }
    return false;
  });
}

/**
 * Secure by Default Middleware
 * 
 * Applies authentication to all routes except those explicitly marked as public
 */
export const secureByDefault = (req, res, next) => {
  const method = req.method;
  const path = req.path;
  
  // Check if this route should be public
  if (isPublicRoute(method, path)) {
    console.log(`🌐 Public route: ${method} ${path}`);
    return next();
  }
  
  // All other routes require authentication
  console.log(`🔒 Protected route: ${method} ${path} - requiring authentication`);
  return authenticateWithCookies(req, res, next);
};

/**
 * Helper function to mark additional routes as public
 * Useful for dynamic route registration
 */
export const addPublicRoute = (route) => {
  if (!PUBLIC_ROUTES.includes(route)) {
    PUBLIC_ROUTES.push(route);
    console.log(`➕ Added public route: ${route}`);
  }
};

/**
 * Get list of all public routes (for debugging)
 */
export const getPublicRoutes = () => {
  return [...PUBLIC_ROUTES];
};

export default secureByDefault;
