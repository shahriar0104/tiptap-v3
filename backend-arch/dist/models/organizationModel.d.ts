import { Organization, Prisma } from '@prisma/client';
export declare class OrganizationModel {
    create(data: Prisma.OrganizationCreateInput): Promise<Organization>;
    findById(id: string): Promise<Organization | null>;
    findByName(name: string): Promise<Organization | null>;
    update(id: string, data: Prisma.OrganizationUpdateInput): Promise<Organization>;
    delete(id: string): Promise<Organization>;
    findAll(): Promise<Organization[]>;
}
//# sourceMappingURL=organizationModel.d.ts.map