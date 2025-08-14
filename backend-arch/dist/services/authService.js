"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const supabase_1 = require("../config/supabase");
const errors_1 = require("../utils/errors");
class AuthService {
    userModel;
    organizationModel;
    constructor(userModel, organizationModel) {
        this.userModel = userModel;
        this.organizationModel = organizationModel;
    }
    async verifyToken(token) {
        try {
            const { data: supabaseUser, error } = await supabase_1.supabase.auth.getUser(token);
            if (error || !supabaseUser.user) {
                throw new errors_1.UnauthorizedError('Invalid or expired token');
            }
            let user = await this.userModel.findById(supabaseUser.user.id);
            if (!user) {
                const userData = {
                    email: supabaseUser.user.email ?? '',
                    firstName: supabaseUser.user.user_metadata?.['firstName'],
                    lastName: supabaseUser.user.user_metadata?.['lastName'],
                };
                user = await this.userModel.create(userData);
            }
            return user;
        }
        catch (error) {
            if (error instanceof errors_1.UnauthorizedError) {
                throw error;
            }
            throw new errors_1.UnauthorizedError('Token verification failed');
        }
    }
    async getCurrentUser(userId) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        return user;
    }
    async updateUserProfile(userId, data) {
        const existingUser = await this.userModel.findById(userId);
        if (!existingUser) {
            throw new errors_1.NotFoundError('User not found');
        }
        if (data.email && data.email !== existingUser.email) {
            const emailExists = await this.userModel.findByEmail(data.email);
            if (emailExists) {
                throw new errors_1.ConflictError('Email already exists');
            }
        }
        return this.userModel.update(userId, data);
    }
    async createUserFromSupabase(supabaseUser) {
        const existingUser = await this.userModel.findById(supabaseUser.id);
        if (existingUser) {
            return existingUser;
        }
        if (supabaseUser.email) {
            const emailExists = await this.userModel.findByEmail(supabaseUser.email);
            if (emailExists) {
                throw new errors_1.ConflictError('Email already exists');
            }
        }
        const userData = {
            email: supabaseUser.email ?? '',
            firstName: supabaseUser.user_metadata?.['firstName'] || '',
            lastName: supabaseUser.user_metadata?.['lastName'] || '',
        };
        return this.userModel.create(userData);
    }
    async getUsersByOrganization(organizationId) {
        return this.userModel.findByOrganizationId(organizationId);
    }
    async getGoogleAuthUrl() {
        const { data, error } = await supabase_1.supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${process.env['BACKEND_URL'] || 'http://localhost:4000'}/api/auth/google/callback`,
            },
        });
        if (error || !data.url) {
            throw new errors_1.ConflictError('Failed to generate Google OAuth URL');
        }
        return data.url;
    }
    async handleGoogleCallback(code, _state) {
        const { data, error } = await supabase_1.supabase.auth.exchangeCodeForSession(code);
        if (error || !data.session || !data.user) {
            throw new errors_1.ConflictError(`Google OAuth callback failed: ${error?.message}`);
        }
        let user = await this.userModel.findById(data.user.id);
        if (!user) {
            const userData = {
                id: data.user.id,
                email: data.user.email,
                firstName: data.user.user_metadata?.['full_name']?.split(' ')[0] || null,
                lastName: data.user.user_metadata?.['full_name']?.split(' ').slice(1).join(' ') || null,
                role: 'MEMBER',
            };
            user = await this.userModel.create(userData);
        }
        return {
            user,
            session: data.session,
        };
    }
    async logout(accessToken) {
        const { error } = await supabase_1.supabase.auth.admin.signOut(accessToken);
        if (error) {
            throw new errors_1.UnauthorizedError('Failed to logout');
        }
    }
    async registerOrganizationWithAdmin(data) {
        let supabaseUser = null;
        let organization = null;
        try {
            const { data: authData, error: authError } = await supabase_1.supabase.auth.admin.createUser({
                email: data.adminEmail,
                password: data.adminPassword,
                email_confirm: true,
            });
            if (authError || !authData.user) {
                throw new errors_1.ConflictError(`Failed to create auth user: ${authError?.message}`);
            }
            supabaseUser = authData.user;
            organization = await this.organizationModel.create({
                name: data.organizationName,
            });
            const user = await this.userModel.create({
                id: supabaseUser.id,
                email: data.adminEmail,
                firstName: data.adminFirstName,
                lastName: data.adminLastName,
                role: 'ADMIN',
                organizationId: organization.id,
            });
            await supabase_1.supabase.auth.admin.updateUserById(supabaseUser.id, {
                user_metadata: {
                    organizationId: organization.id,
                    role: 'ADMIN',
                },
            });
            return {
                organization,
                user,
                session: authData.session || null,
            };
        }
        catch (error) {
            if (organization) {
                try {
                    await this.organizationModel.delete(organization.id);
                }
                catch (cleanupError) {
                    console.error('Failed to cleanup organization:', cleanupError);
                }
            }
            if (supabaseUser) {
                try {
                    await supabase_1.supabase.auth.admin.deleteUser(supabaseUser.id);
                }
                catch (cleanupError) {
                    console.error('Failed to cleanup Supabase user:', cleanupError);
                }
            }
            throw error;
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=authService.js.map