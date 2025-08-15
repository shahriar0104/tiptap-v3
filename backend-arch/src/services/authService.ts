import { User } from '@prisma/client';
import { supabase } from '../config/supabase';
import { UserModel, OrganizationModel } from '../models';
import { CreateUserData, SupabaseUser } from '../types';
import { UnauthorizedError, NotFoundError, ConflictError } from '../utils/errors';

export class AuthService {
  constructor(private userModel: UserModel, private organizationModel: OrganizationModel) {}

  async verifyToken(token: string): Promise<User> {
    try {
      const { data: supabaseUser, error } = await supabase.auth.getUser(token);
      
      if (error || !supabaseUser.user) {
        throw new UnauthorizedError('Invalid or expired token');
      }

      // Find or create user in our database
      let user = await this.userModel.findById(supabaseUser.user.id);
      
      if (!user) {
        // Create user if doesn't exist
        const userData: CreateUserData = {
          email: supabaseUser.user.email ?? '',
          firstName: supabaseUser.user.user_metadata?.['firstName'],
          lastName: supabaseUser.user.user_metadata?.['lastName'],
        };
        
        user = await this.userModel.create(userData);
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError('Token verification failed');
    }
  }

  async login(email: string, password: string): Promise<{ user: User; session: any }> {
    try {
      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.session || !data.user) {
        throw new UnauthorizedError('Invalid email or password');
      }

      // Get user from our database
      let user = await this.userModel.findById(data.user.id);

      if (!user) {
        // Create user if doesn't exist (shouldn't happen for login, but safety check)
        const userData: CreateUserData = {
          id: data.user.id,
          email: data.user.email!,
          firstName: data.user.user_metadata?.['firstName'] || null,
          lastName: data.user.user_metadata?.['lastName'] || null,
          role: 'MEMBER',
        };
        
        user = await this.userModel.create(userData);
      }

      return {
        user,
        session: data.session,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError('Login failed');
    }
  }

  async getCurrentUser(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async updateUserProfile(
    userId: string, 
    data: Partial<CreateUserData>
  ): Promise<User> {
    const existingUser = await this.userModel.findById(userId);
    
    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    // Check if email is being changed and if it's already taken
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await this.userModel.findByEmail(data.email);
      if (emailExists) {
        throw new ConflictError('Email already exists');
      }
    }

    return this.userModel.update(userId, data);
  }

  async createUserFromSupabase(supabaseUser: SupabaseUser): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userModel.findById(supabaseUser.id);
    if (existingUser) {
      return existingUser;
    }

    // Check if email is already taken by another user
    if (supabaseUser.email) {
      const emailExists = await this.userModel.findByEmail(supabaseUser.email);
      if (emailExists) {
        throw new ConflictError('Email already exists');
      }
    }

    const userData: CreateUserData = {
      email: supabaseUser.email ?? '',
      firstName: supabaseUser.user_metadata?.['firstName'] || '',
      lastName: supabaseUser.user_metadata?.['lastName'] || '',
    };

    return this.userModel.create(userData);
  }

  async getUsersByOrganization(organizationId: string): Promise<User[]> {
    return this.userModel.findByOrganizationId(organizationId);
  }

  async getGoogleAuthUrl(): Promise<string> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/auth/google/callback`,
      },
    });

    if (error || !data.url) {
      throw new ConflictError('Failed to generate Google OAuth URL');
    }

    return data.url;
  }

  async handleGoogleCallback(code: string, _state?: string): Promise<{ user: any; session: any }> {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session || !data.user) {
      throw new ConflictError(`Google OAuth callback failed: ${error?.message}`);
    }

    // Check if user exists in database
    let user = await this.userModel.findById(data.user.id);

    if (!user) {
      // Create new user from Google OAuth data
      const userData = {
        id: data.user.id,
        email: data.user.email!,
        firstName: data.user.user_metadata?.['full_name']?.split(' ')[0] || null,
        lastName: data.user.user_metadata?.['full_name']?.split(' ').slice(1).join(' ') || null,
        role: 'MEMBER' as const,
      };

      user = await this.userModel.create(userData);
    }

    return {
      user,
      session: data.session,
    };
  }

  async logout(accessToken: string): Promise<void> {
    const { error } = await supabase.auth.admin.signOut(accessToken);
    
    if (error) {
      throw new UnauthorizedError('Failed to logout');
    }
  }

  async registerOrganizationWithAdmin(data: {
    organizationName: string;
    adminEmail: string;
    adminPassword: string;
    adminFirstName: string;
    adminLastName: string;
  }): Promise<{ organization: any; user: User; session: any }> {
    let supabaseUser = null;
    let organization = null;
    
    try {
      // 1. Create Supabase auth user first
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.adminEmail,
        password: data.adminPassword,
        email_confirm: true,
      });

      if (authError || !authData.user) {
        throw new ConflictError(`Failed to create auth user: ${authError?.message}`);
      }

      supabaseUser = authData.user;

      // 2. Create organization using model
      organization = await this.organizationModel.create({
        name: data.organizationName,
      });

      // 3. Create admin user using model
      const user = await this.userModel.create({
        id: supabaseUser.id,
        email: data.adminEmail,
        firstName: data.adminFirstName,
        lastName: data.adminLastName,
        role: 'ADMIN',
        organizationId: organization.id,
      });

      // 4. Update Supabase user metadata with organization ID
      await supabase.auth.admin.updateUserById(supabaseUser.id, {
        user_metadata: {
          organizationId: organization.id,
          role: 'ADMIN',
        },
      });

      return {
        organization,
        user,
        session: (authData as any).session || null,
      };
    } catch (error) {
      // If creation fails, clean up created resources
      if (organization) {
        try {
          await this.organizationModel.delete(organization.id);
        } catch (cleanupError) {
          console.error('Failed to cleanup organization:', cleanupError);
        }
      }
      
      if (supabaseUser) {
        try {
          await supabase.auth.admin.deleteUser(supabaseUser.id);
        } catch (cleanupError) {
          console.error('Failed to cleanup Supabase user:', cleanupError);
        }
      }
      throw error;
    }
  }
}
