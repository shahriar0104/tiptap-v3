import supabase from '../config/supabase.js';
import organizationService from '../services/organizationService.js';
import database from '../config/database.js';
import {ApiError} from '../middleware/errorHandler.js';
import {clearAuthCookies, setAuthCookies} from '../middleware/cookieAuth.js';

class AuthController {
  constructor() {
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
    this.googleAuth = this.googleAuth.bind(this);
    this.googleCallback = this.googleCallback.bind(this);
    this.createOrganization = this.createOrganization.bind(this);
  }

  /**
   * Login with email and password using Supabase Auth
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

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
      let user = await database.prisma.user.findUnique({
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

      res.json({
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
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register new user using Supabase Auth
   */
  async register(req, res, next) {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        throw new ApiError('Email, password, and name are required', 400);
      }

      // Check if user already exists in our database
      const existingUser = await database.prisma.user.findUnique({
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
      const user = await database.prisma.user.create({
        data: {
          id: authData.user.id, // Use Supabase user ID
          email: authData.user.email,
          name,
          role: 'MEMBER', // Default role
        },
      });

      // If user is confirmed (no email verification required), set cookies
      if (authData.session) {
        setAuthCookies(res, authData.session.access_token, authData.session.refresh_token);
      }

      res.status(201).json({
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
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Google OAuth login
   */
  googleAuth = async (req, res, next) => {
    try {
      // Generate Google OAuth URL that redirects to backend callback
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/auth/google/callback`,
        },
      });

      if (error) {
        throw new ApiError('Failed to generate Google OAuth URL', 500);
      }

      res.json({
        success: true,
        data: {
          redirectUrl: data.url,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle Google OAuth callback
   */
  googleCallback = async (req, res, next) => {
    try {
      // Get the session from Supabase after OAuth
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        // Redirect to frontend login with error
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/login?error=oauth_failed`);
      }

      const { user: supabaseUser } = session;

      // Check if user exists in our database
      let user = await database.prisma.user.findUnique({
        where: { email: supabaseUser.email },
        include: { organization: true },
      });

      if (!user) {
        // New user - create user record in database
        user = await database.prisma.user.create({
          data: {
            id: supabaseUser.id,
            email: supabaseUser.email,
            name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0],
            avatar: supabaseUser.user_metadata?.avatar_url,
            role: 'MEMBER',
          },
          include: { organization: true },
        });

        // Set cookies and redirect to organization setup
        setAuthCookies(res, session.access_token, session.refresh_token);
        return res.redirect(
          `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/setup?email=${encodeURIComponent(supabaseUser.email)}&name=${encodeURIComponent(supabaseUser.user_metadata?.full_name || '')}`
        );
      }

      // Existing user - set cookies and redirect to dashboard
      setAuthCookies(res, session.access_token, session.refresh_token);
      
      // Redirect to frontend dashboard
      res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`
      );
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/login?error=oauth_failed`);
    }
  }

  /**
   * Create organization for authenticated user
   */
  createOrganization = async (req, res, next) => {
    try {
      const { organizationName, domain, description } = req.body;
      const userId = req.user.id; // From cookie middleware

      if (!organizationName) {
        throw new ApiError('Organization name is required', 400);
      }

      // Check if the user already has an organization
      const existingUser = await database.prisma.user.findUnique({
        where: { id: userId },
        include: { organization: true },
      });

      if (!existingUser) {
        throw new ApiError('User not found', 404);
      }

      if (existingUser.organizationId) {
        throw new ApiError('User already belongs to an organization', 409);
      }

      // Create organization with current user as admin
      const result = await organizationService.createOrganization({
        name: organizationName,
        domain,
        description,
        adminUser: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          avatar: existingUser.avatar,
        },
      });

      // Cookies remain valid - no need to regenerate tokens
      // Organization info will be fetched fresh on next authenticated request

      res.status(201).json({
        success: true,
        message: 'Organization created successfully',
        data: {
          organization: result.organization,
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Join organization for authenticated user
   */
  joinOrganization = async (req, res, next) => {
    try {
      const { organizationSlug } = req.body;
      const userId = req.user.id; // From cookie middleware

      if (!organizationSlug) {
        throw new ApiError('Organization slug is required', 400);
      }

      // Check if user already has an organization
      const existingUser = await database.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        throw new ApiError('User not found', 404);
      }

      if (existingUser.organizationId) {
        throw new ApiError('User already belongs to an organization', 409);
      }

      // Find organization
      const organization = await database.prisma.organization.findUnique({
        where: { slug: organizationSlug },
      });

      if (!organization) {
        throw new ApiError('Organization not found', 404);
      }

      // Add user to organization
      const updatedUser = await database.prisma.user.update({
        where: { id: userId },
        data: { organizationId: organization.id },
        include: { organization: true },
      });

      // Cookies remain valid - no need to regenerate tokens
      // Organization info will be fetched fresh on next authenticated request

      res.json({
        success: true,
        message: 'Successfully joined organization',
        data: {
          organization: updatedUser.organization,
          user: updatedUser,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Join an existing organization
   */
  // async joinOrganization(req, res, next) {
  //   try {
  //     const { organizationSlug, userData } = req.body;
  //
  //     if (!organizationSlug || !userData?.email) {
  //       throw new ApiError('Organization slug and user data required', 400);
  //     }
  //
  //     // Find organization by slug
  //     const organization = await database.prisma.organization.findUnique({
  //       where: { slug: organizationSlug },
  //     });
  //
  //     if (!organization) {
  //       throw new ApiError('Organization not found', 404);
  //     }
  //
  //     // Add user to organization
  //     const user = await organizationService.addUserToOrganization({
  //       organizationId: organization.id,
  //       userData,
  //       role: 'MEMBER',
  //     });
  //
  //     res.status(201).json({
  //       success: true,
  //       message: 'Successfully joined organization',
  //       data: {
  //         user,
  //         organization,
  //       },
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  /**
   * Logout user by clearing secure HTTP-only cookies
   */
  async logout(req, res, next) {
    try {
      // Clear authentication cookies
      clearAuthCookies(res);
      
      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register a new organization with an admin user using Supabase Auth
   */
  registerOrganization = async (req, res, next) => {
    let supabaseUserId = undefined;
    try {
      const { organizationName, domain, description, user } = req.body;

      // Validate required fields
      if (!organizationName || !user?.email || !user?.name || !user?.password) {
        throw new ApiError('Organization name, user email, name, and password are required', 400);
      }

      // Check if a user already exists in our database
      const existingUser = await database.prisma.user.findUnique({
        where: { email: user.email },
      });

      if (existingUser) {
        throw new ApiError('User already exists in another organization', 409);
      }

      // Register admin user with Supabase Auth
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
        throw new ApiError(authError.message || 'User registration failed', 400);
      }

      supabaseUserId = authData.user.id;

      // Create organization with admin user in our database
      const result = await organizationService.createOrganization({
        name: organizationName,
        domain,
        description,
        adminUser: {
          id: supabaseUserId, // Use Supabase user ID
          email: authData.user.email,
          name: user.name,
          avatar: user.avatar,
        },
      });

      // Set secure HTTP-only cookies for the new admin user
      // Note: authData.session will be null for unconfirmed users
      if (authData.session) {
        setAuthCookies(res, authData.session.access_token, authData.session.refresh_token);
      }

      res.status(201).json({
        success: true,
        message: 'Organization created successfully. Please check your email to verify your account.',
        data: {
          organization: result.organization,
          user: result.user,
          requiresEmailVerification: !authData.session, // true if email verification needed
        },
      });
    } catch (error) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(supabaseUserId);
      } catch (cleanupErr) {
        console.error('Failed to delete Supabase user after org creation error:', cleanupErr);
        next(cleanupErr);
      }
      next(error);
    }
  }

  /**
   * Handle user login/registration after Supabase auth
   */
  handleAuthCallback = async (req, res, next) => {
    try {
      const { access_token, user: supabaseUser } = req.body;

      if (!access_token || !supabaseUser) {
        throw new ApiError('Access token and user data required', 400);
      }

      // Verify token with Supabase
      const { data: { user }, error } = await supabase.auth.getUser(access_token);

      if (error || !user || user.id !== supabaseUser.id) {
        throw new ApiError('Invalid token or user data', 401);
      }

      // Check if user exists in our database
      let dbUser = await database.prisma.user.findUnique({
        where: { email: user.email },
        include: {
          organization: true,
        },
      });

      if (!dbUser) {
        // New user - they need to either join an organization or create one
        return res.status(200).json({
          success: true,
          message: 'New user detected',
          data: {
            isNewUser: true,
            supabaseUser: {
              id: user.id,
              email: user.email,
              name: user.user_metadata?.full_name || user.email.split('@')[0],
              avatar: user.user_metadata?.avatar_url,
            },
          },
        });
      }

      // Existing user - return user and organization data
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          isNewUser: false,
          user: dbUser,
          organization: dbUser.organization,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req, res, next) {
    try {
      const user = await database.prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          organization: {
            include: {
              _count: {
                select: {
                  users: true,
                  boardMeetings: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new ApiError('User not found', 404);
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   */
  updateProfile = async (req, res, next) => {
    try {
      const { name, avatar } = req.body;
      
      const user = await database.prisma.user.update({
        where: { id: req.user.id },
        data: {
          ...(name && { name }),
          ...(avatar && { avatar }),
        },
        include: {
          organization: true,
        },
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get organization members (admin only)
   */
  getOrganizationMembers = async (req, res, next) => {
    try {
      const members = await database.prisma.user.findMany({
        where: {
          organizationId: req.user.organizationId,
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          createdAt: true,
        },
        orderBy: [
          { role: 'asc' }, // Admins first
          { createdAt: 'asc' },
        ],
      });

      res.status(200).json({
        success: true,
        data: members,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
