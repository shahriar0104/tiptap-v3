import supabase from '../config/supabase.js';
import organizationService from '../services/organizationService.js';
import database from '../config/database.js';
import { ApiError } from '../middleware/errorHandler.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

class AuthController {
  /**
   * Generate JWT token for user
   */
  generateToken(user) {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        organizationId: user.organizationId,
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
  }

  /**
   * Login with email and password
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new ApiError('Email and password are required', 400);
      }

      // Find user with organization
      const user = await database.prisma.user.findUnique({
        where: { email },
        include: {
          organization: true,
        },
      });

      if (!user) {
        throw new ApiError('Invalid email or password', 401);
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        throw new ApiError('Invalid email or password', 401);
      }

      // Generate JWT token
      const token = this.generateToken(user);

      // Remove password hash from response
      const { passwordHash, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: userWithoutPassword,
          organization: user.organization,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register new user
   */
  async register(req, res, next) {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        throw new ApiError('Email, password, and name are required', 400);
      }

      // Check if user already exists
      const existingUser = await database.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ApiError('User already exists', 409);
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user without organization (they'll need to create/join one)
      const user = await database.prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          role: 'MEMBER', // Default role
        },
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please create or join an organization.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Google OAuth login
   */
  async googleAuth(req, res, next) {
    try {
      // Generate Google OAuth URL
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback`,
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
   * Logout user
   */
  async logout(req, res, next) {
    try {
      // For JWT-based auth, logout is handled client-side by removing the token
      // We could implement token blacklisting here if needed
      
      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * Register a new organization with admin user
   */
  async registerOrganization(req, res, next) {
    try {
      const { organizationName, domain, description, user } = req.body;

      // Validate required fields
      if (!organizationName || !user?.email || !user?.name || !user?.password) {
        throw new ApiError('Organization name, user email, name, and password are required', 400);
      }

      // Check if user already exists
      const existingUser = await database.prisma.user.findUnique({
        where: { email: user.email },
      });

      if (existingUser) {
        throw new ApiError('User already exists in another organization', 409);
      }

      // Create organization with admin user
      const result = await organizationService.createOrganization({
        name: organizationName,
        domain,
        description,
        adminUser: user,
      });

      // Generate JWT token for the new admin user
      const token = this.generateToken(result.user);

      res.status(201).json({
        success: true,
        message: 'Organization created successfully',
        data: {
          token,
          organization: result.organization,
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle user login/registration after Supabase auth
   */
  async handleAuthCallback(req, res, next) {
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
   * Join an existing organization
   */
  async joinOrganization(req, res, next) {
    try {
      const { organizationSlug, userData } = req.body;

      if (!organizationSlug || !userData?.email) {
        throw new ApiError('Organization slug and user data required', 400);
      }

      // Find organization by slug
      const organization = await database.prisma.organization.findUnique({
        where: { slug: organizationSlug },
      });

      if (!organization) {
        throw new ApiError('Organization not found', 404);
      }

      // Add user to organization
      const user = await organizationService.addUserToOrganization({
        organizationId: organization.id,
        userData,
        role: 'MEMBER',
      });

      res.status(201).json({
        success: true,
        message: 'Successfully joined organization',
        data: {
          user,
          organization,
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
  async updateProfile(req, res, next) {
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
  async getOrganizationMembers(req, res, next) {
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
