import { Request, Response, NextFunction } from 'express';
import { User as SupabaseUser } from '@supabase/supabase-js';
import supabase, { supabaseAdmin } from '../config/supabase.js';
import organizationService from '../services/organizationService.js';
import database from '../config/database.js';
import { ApiError } from '../middleware/errorHandler.js';
import { clearAuthCookies, setAuthCookies } from '../middleware/cookieAuth.js';
import { AuthenticatedRequest, ApiResponse, UserRole } from '../types/index.js';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

interface CreateOrganizationRequest {
  name: string;
  slug: string;
  description?: string;
  domain?: string;
}

class AuthController {
  constructor() {
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
    this.googleAuth = this.googleAuth.bind(this);
    this.createOrganization = this.createOrganization.bind(this);
    this.joinOrganization = this.joinOrganization.bind(this);
    this.registerOrganization = this.registerOrganization.bind(this);
    this.handleAuthCallback = this.handleAuthCallback.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.getOrganizationMembers = this.getOrganizationMembers.bind(this);
    this.logout = this.logout.bind(this);
    this.getProfile = this.getProfile.bind(this);
  }

  /**
   * Login with email and password using Supabase Auth
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body as LoginRequest;

      if (!email || !password) {
        throw new ApiError('Email and password are required', 400);
      }

      // Authenticate with Supabase
      let authData, authError;
      try {
        const result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        authData = result.data;
        authError = result.error;
      } catch (networkError) {
        console.error('Network error connecting to Supabase:', networkError);
        throw new ApiError('Authentication service temporarily unavailable. Please try again later.', 503);
      }

      if (authError || !authData.user || !authData.session) {
        throw new ApiError('Invalid email or password', 401);
      }

      const supabaseUser = authData.user;
      const session = authData.session;

      // Find user in our database
      const user = await database.getClient().user.findUnique({
        where: { id: supabaseUser.id },
        include: { organization: true },
      });

      if (!user) {
        // User exists in Supabase but not in our database
        // This shouldn't happen in normal flow, but handle it gracefully
        throw new ApiError('User not found. Please complete registration.', 404);
      }

      // Set secure HTTP-only cookies with Supabase tokens
      setAuthCookies(res, session.access_token, session.refresh_token);

      const response: ApiResponse = {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            organizationId: user.organizationId,
          },
          organization: user.organization,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register new user using Supabase Auth
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, name } = req.body as RegisterRequest;

      if (!email || !password || !name) {
        throw new ApiError('Email, password, and name are required', 400);
      }

      // Check if user already exists in our database
      const existingUser = await database.getClient().user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ApiError('User already exists', 409);
      }

      // Register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (authError) {
        throw new ApiError(authError.message || 'Registration failed', 400);
      }

      if (!authData.user) {
        throw new ApiError('Registration failed', 400);
      }

      // Create user in our database (without organization initially)
      const user = await database.getClient().user.create({
        data: {
          id: authData.user.id, // Use Supabase user ID
          email: authData.user.email || '',
          name,
          role: UserRole.MEMBER, // Default role
        },
      });

      // If user is confirmed (no email verification required), set cookies
      if (authData.session) {
        setAuthCookies(res, authData.session.access_token, authData.session.refresh_token);
      }

      const response: ApiResponse = {
        success: true,
        message: authData.session 
          ? 'User registered and logged in successfully.'
          : 'User registered successfully. Please check your email to verify your account.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          requiresVerification: !authData.session,
        },
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Google OAuth login
   */
  googleAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Generate Google OAuth URL that redirects to backend callback
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env['BACKEND_URL'] || 'http://localhost:4000'}/api/auth/google/callback`,
        },
      });

      if (error) {
        throw new ApiError('Failed to generate Google OAuth URL', 500);
      }

      const response: ApiResponse = {
        success: true,
        message: 'Google OAuth URL generated',
        data: {
          redirectUrl: data.url,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle Google OAuth callback
   */
  googleCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get the session from Supabase after OAuth
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        // Redirect to frontend login with error
        res.redirect(`${process.env['FRONTEND_URL'] || 'http://localhost:3000'}/auth/login?error=oauth_failed`);
        return;
      }

      const { user: supabaseUser } = session;

      // Check if user exists in our database
      let user = await database.getClient().user.findUnique({
        where: { id: supabaseUser.id },
        include: { organization: true },
      });

      if (!user) {
        // Create user in our database for first-time Google login
        user = await database.getClient().user.create({
          data: {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: supabaseUser.user_metadata?.['full_name'] || supabaseUser.email?.split('@')[0] || '',
            avatar: supabaseUser.user_metadata?.['avatar_url'] || null,
            role: UserRole.MEMBER,
          },
          include: { organization: true },
        });
      }

      // Set secure HTTP-only cookies
      setAuthCookies(res, session.access_token, session.refresh_token);

      // Redirect to frontend with success
      const redirectUrl = user.organizationId 
        ? `${process.env['FRONTEND_URL'] || 'http://localhost:3000'}/dashboard`
        : `${process.env['FRONTEND_URL'] || 'http://localhost:3000'}/onboarding`;

      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env['FRONTEND_URL'] || 'http://localhost:3000'}/auth/login?error=oauth_failed`);
    }
  }

  /**
   * Create organization for authenticated user
   */
  async createOrganization(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const { name, slug, description, domain } = req.body as CreateOrganizationRequest;

      if (!name || !slug) {
        throw new ApiError('Organization name and slug are required', 400);
      }

      // Check if user already has an organization
      if (authReq.user.organizationId) {
        throw new ApiError('User already belongs to an organization', 400);
      }

      // Create organization using service
      const result = await organizationService.createOrganization({
        name,
        slug,
        description: description || '',
        domain: domain || '',
      }, authReq.user.id);

      const response: ApiResponse = {
        success: true,
        message: result.message,
        data: result.data,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Join an existing organization
   */
  async joinOrganization(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const { organizationSlug, userData } = req.body;

      if (!authReq.user) {
        throw new ApiError('Authentication required', 401);
      }

      if (!organizationSlug) {
        throw new ApiError('Organization slug is required', 400);
      }

      // Check if user already belongs to an organization
      if (authReq.user.organizationId) {
        throw new ApiError('User already belongs to an organization', 400);
      }

      // Find the organization by slug
      const organization = await database.getClient().organization.findUnique({
        where: { slug: organizationSlug },
      });

      if (!organization) {
        throw new ApiError('Organization not found', 404);
      }

      // Update user to join the organization
      const updatedUser = await database.getClient().user.update({
        where: { id: authReq.user.id },
        data: { organizationId: organization.id },
        include: { organization: true },
      });

      const response: ApiResponse = {
        success: true,
        message: 'Successfully joined organization',
        data: {
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
            role: updatedUser.role,
            organizationId: updatedUser.organizationId,
          },
          organization: updatedUser.organization,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register a new organization with admin user
   */
  async registerOrganization(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationName, domain, description, user } = req.body;

      if (!organizationName || !user || !user.email || !user.password) {
        throw new ApiError('Organization name, user email, and password are required', 400);
      }

      // Check if user already exists in our database
      const existingUser = await database.getClient().user.findUnique({
        where: { email: user.email },
      });

      if (existingUser) {
        throw new ApiError('User already exists', 409);
      }

      let supabaseUserId: string | null = null;

      try {
        // Step 1: Create user in Supabase Auth first
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
          options: {
            data: {
              full_name: user.name,
            },
          },
        });

        if (authError || !authData.user) {
          throw new ApiError(authError?.message || 'Failed to create user in Supabase Auth', 400);
        }

        supabaseUserId = authData.user.id;

        // Step 2: Create organization and user in database transaction
        const result = await database.getClient().$transaction(async (tx) => {
          // Create organization
          const organization = await tx.organization.create({
            data: {
              name: organizationName,
              slug: organizationName.toLowerCase().replace(/\s+/g, '-'),
              domain: domain || null,
              description: description || null,
            },
          });

          // Create admin user in database
          const newUser = await tx.user.create({
            data: {
              id: supabaseUserId!,
              email: user.email,
              name: user.name,
              avatar: user.avatar || null,
              role: UserRole.ADMIN,
              organizationId: organization.id,
            },
          });

          return { organization, user: newUser };
        });

        const response: ApiResponse = {
          success: true,
          message: 'Organization and admin user created successfully',
          data: result,
        };

        res.status(201).json(response);
      } catch (error) {
        // Step 3: If database transaction failed, cleanup Supabase Auth user
        if (supabaseUserId) {
          try {
            await supabaseAdmin.auth.admin.deleteUser(supabaseUserId);
            console.log(`Cleaned up Supabase Auth user ${supabaseUserId} after database transaction failure`);
          } catch (cleanupError) {
            console.error('Failed to cleanup Supabase Auth user:', cleanupError);
            // Don't throw here, we want to report the original error
          }
        }
        throw error;
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle Supabase authentication callback
   */
  async handleAuthCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { access_token, user } = req.body;

      if (!access_token || !user) {
        throw new ApiError('Invalid token or user data', 401);
      }

      // Verify token with Supabase
      const { data, error } = await supabase.auth.getUser(access_token);

      if (error || !data.user) {
        throw new ApiError('Invalid token', 401);
      }

      // Find or create user in our database
      let dbUser = await database.getClient().user.findUnique({
        where: { id: data.user.id },
        include: { organization: true },
      });

      if (!dbUser) {
        dbUser = await database.getClient().user.create({
          data: {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.['full_name'] || '',
            avatar: data.user.user_metadata?.['avatar_url'] || null,
            role: UserRole.MEMBER,
          },
          include: { organization: true },
        });
      }

      const response: ApiResponse = {
        success: true,
        message: 'Authentication successful',
        data: {
          user: dbUser,
          organization: dbUser.organization,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const { name, avatar } = req.body;

      if (!authReq.user) {
        throw new ApiError('Authentication required', 401);
      }

      const updatedUser = await database.getClient().user.update({
        where: { id: authReq.user.id },
        data: {
          ...(name && { name }),
          ...(avatar !== undefined && { avatar }),
        },
        include: { organization: true },
      });

      const response: ApiResponse = {
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: updatedUser,
          organization: updatedUser.organization,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get organization members (admin only)
   */
  async getOrganizationMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;

      if (!authReq.user) {
        throw new ApiError('Authentication required', 401);
      }

      if (!authReq.user.organizationId) {
        throw new ApiError('User not associated with an organization', 400);
      }

      const members = await database.getClient().user.findMany({
        where: { organizationId: authReq.user.organizationId },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      const response: ApiResponse = {
        success: true,
        message: 'Organization members retrieved successfully',
        data: members,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user by clearing cookies
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Clear authentication cookies
      clearAuthCookies(res);

      // Optionally sign out from Supabase (this invalidates the session server-side)
      try {
        await supabase.auth.signOut();
      } catch (supabaseError) {
        // Log but don't fail the logout if Supabase signout fails
        console.warn('Supabase signout failed:', supabaseError);
      }

      const response: ApiResponse = {
        success: true,
        message: 'Logged out successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      
      // Get fresh user data from database
      const user = await database.getClient().user.findUnique({
        where: { id: authReq.user.id },
        include: { organization: true },
      });

      if (!user) {
        throw new ApiError('User not found', 404);
      }

      const response: ApiResponse = {
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            role: user.role,
            isActive: user.isActive,
            organizationId: user.organizationId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          organization: user.organization,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
