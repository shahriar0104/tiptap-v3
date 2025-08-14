import { User } from '@prisma/client';
import { CreateUserData } from '../types';
export declare class UserModel {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(data: CreateUserData): Promise<User>;
    update(id: string, data: Partial<CreateUserData>): Promise<User>;
    delete(id: string): Promise<User>;
    findByOrganizationId(organizationId: string): Promise<User[]>;
}
//# sourceMappingURL=userModel.d.ts.map