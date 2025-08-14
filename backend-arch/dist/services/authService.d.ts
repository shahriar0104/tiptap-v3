import { User } from '@prisma/client';
import { UserModel, OrganizationModel } from '../models';
import { CreateUserData, SupabaseUser } from '../types';
export declare class AuthService {
    private userModel;
    private organizationModel;
    constructor(userModel: UserModel, organizationModel: OrganizationModel);
    verifyToken(token: string): Promise<User>;
    getCurrentUser(userId: string): Promise<User>;
    updateUserProfile(userId: string, data: Partial<CreateUserData>): Promise<User>;
    createUserFromSupabase(supabaseUser: SupabaseUser): Promise<User>;
    getUsersByOrganization(organizationId: string): Promise<User[]>;
    getGoogleAuthUrl(): Promise<string>;
    handleGoogleCallback(code: string, _state?: string): Promise<{
        user: any;
        session: any;
    }>;
    logout(accessToken: string): Promise<void>;
    registerOrganizationWithAdmin(data: {
        organizationName: string;
        adminEmail: string;
        adminPassword: string;
        adminFirstName: string;
        adminLastName: string;
    }): Promise<{
        organization: any;
        user: User;
        session: any;
    }>;
}
//# sourceMappingURL=authService.d.ts.map