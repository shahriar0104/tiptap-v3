import { User, OrgRole, Organization } from '@prisma/client';
import { supabase } from '../config/supabase';
import { UserModel } from '../models';
import { withTransactionModels } from '../utils/transaction';
import { SupabaseUser } from '../types';
import { CreateUserData as ModelCreateUserData } from '../models/userModel';
import type { Session } from '@supabase/supabase-js';
import {
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} from '../utils/errors';

export class AuthService {
  constructor(private userModel: UserModel) {}

  async verifyToken(token: string): Promise<User> {
    try {
      const { data: supabaseUser, error } = await supabase.auth.getUser(token);

      if (error || !supabaseUser.user) {
        throw new UnauthorizedError('Invalid or expired token');
      }

      // Find user in our database; do not create users during verification
      const user = await this.userModel.findById(supabaseUser.user.id);
      if (!user) {
        throw new UnauthorizedError('User not registered');
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError('Token verification failed');
    }
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: User; session: Session }> {
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
        const nameFromEmail = data.user.email?.split('@')[0] ?? '';
        const userData: ModelCreateUserData = {
          id: data.user.id,
          email: data.user.email ?? '',
          name: nameFromEmail,
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
    data: Partial<ModelCreateUserData>
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

    const userData: ModelCreateUserData = {
      id: supabaseUser.id,
      email: supabaseUser.email ?? '',
      name:
        supabaseUser.user_metadata?.full_name ??
        supabaseUser.email?.split('@')[0] ??
        '',
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
        redirectTo: `${process.env.BACKEND_URL ?? 'http://localhost:4000'}/api/auth/google/callback`,
      },
    });

    if (error || !data.url) {
      throw new ConflictError('Failed to generate Google OAuth URL');
    }

    return data.url;
  }

  async handleGoogleCallback(
    code: string
  ): Promise<{ user: User; session: Session }> {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session || !data.user) {
      throw new ConflictError(
        `Google OAuth callback failed: ${error?.message}`
      );
    }

    // Check if user exists in database
    let user = await this.userModel.findById(data.user.id);

    if (!user) {
      // Create new user from Google OAuth data
      const userData: ModelCreateUserData = {
        id: data.user.id,
        email: data.user.email!,
        name:
          data.user.user_metadata?.['full_name'] ||
          data.user.email?.split('@')[0] ||
          '',
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
  }): Promise<{ organization: Organization; user: User; session: Session | null }> {
    let supabaseUserId: string | null = null;
    let organization: Organization | null = null;
    let transactionCompleted = false;

    try {
      // 1. Create Supabase auth user first
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: data.adminEmail,
          password: data.adminPassword,
          email_confirm: true,
        });

      if (authError || !authData.user) {
        throw new ConflictError(
          `Failed to create auth user: ${authError?.message}`
        );
      }

      supabaseUserId = authData.user.id;
      const authUserId = authData.user.id;

      // 2-3. Create organization, admin user, and org membership atomically
      const result = await withTransactionModels(async ({ models }) => {
        const createdOrg = await models.organizationModel.create({
          name: data.organizationName,
          slug: data.organizationName
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, ''),
        });

        const createdUser = await models.userModel.create({
          id: authUserId,
          email: data.adminEmail,
          name: `${data.adminFirstName} ${data.adminLastName}`,
          role: 'ADMIN',
        });

        await models.orgMemberModel.create({
          organizationId: createdOrg.id,
          userId: createdUser.id,
          role: OrgRole.OWNER,
        });

        return { organization: createdOrg, user: createdUser };
      });

      organization = result.organization;
      const user = result.user;

      transactionCompleted = true;

      // 4. Update Supabase user metadata with organization ID
      await supabase.auth.admin.updateUserById(authUserId, {
        user_metadata: {
          organizationId: organization.id,
          role: 'ADMIN',
        },
      });

      return {
        organization,
        user,
        session: null,
      };
    } catch (error) {
      // If DB transaction failed after creating Supabase user, attempt cleanup of Supabase user
      if (!transactionCompleted && supabaseUserId) {
        try {
          await supabase.auth.admin.deleteUser(supabaseUserId);
        } catch (cleanupError) {
          console.error('Failed to cleanup Supabase user:', cleanupError);
        }
      }
      throw error;
    }
  }
}
