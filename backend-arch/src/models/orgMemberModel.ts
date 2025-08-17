// Deprecated OrgMember model. Kept as a no-op stub to maintain backward compatibility
// after removing membership tables from the simplified schema.

export type OrgRole = 'ADMIN' | 'MEMBER';

export interface CreateOrgMemberData {
  organizationId: string;
  userId: string;
  role: OrgRole;
}

export interface UpdateOrgMemberData {
  role?: OrgRole;
}

// Minimal shape for compatibility only; no DB calls
export interface OrgMember {
  id: string;
  organizationId: string;
  userId: string;
  role: OrgRole;
  joinedAt: Date;
}

export interface OrgMemberModel {
  findById(id: string): Promise<OrgMember | null>;
  findByUserAndOrganization(
    userId: string,
    organizationId: string
  ): Promise<OrgMember | null>;
  create(data: CreateOrgMemberData): Promise<OrgMember>;
  updateRole(id: string, role: OrgRole): Promise<OrgMember>;
  delete(id: string): Promise<OrgMember>;
  findByOrganizationId(organizationId: string): Promise<OrgMember[]>;
  findByUserId(userId: string): Promise<OrgMember[]>;
  findByRole(organizationId: string, role: OrgRole): Promise<OrgMember[]>;
  checkUserAccess(
    userId: string,
    organizationId: string,
    requiredRoles: OrgRole[]
  ): Promise<boolean>;
}

export class OrgMemberModelImpl implements OrgMemberModel {
  // All methods now throw to signal deprecation if accidentally used
  private unsupported(): never {
    throw new Error('OrgMemberModel is deprecated and not supported in this schema');
  }

  async findById(_id: string): Promise<OrgMember | null> {
    return this.unsupported();
  }
  async findByUserAndOrganization(
    _userId: string,
    _organizationId: string
  ): Promise<OrgMember | null> {
    return this.unsupported();
  }
  async create(_data: CreateOrgMemberData): Promise<OrgMember> {
    return this.unsupported();
  }
  async updateRole(_id: string, _role: OrgRole): Promise<OrgMember> {
    return this.unsupported();
  }
  async delete(_id: string): Promise<OrgMember> {
    return this.unsupported();
  }
  async findByOrganizationId(_organizationId: string): Promise<OrgMember[]> {
    return this.unsupported();
  }
  async findByUserId(_userId: string): Promise<OrgMember[]> {
    return this.unsupported();
  }
  async findByRole(
    _organizationId: string,
    _role: OrgRole
  ): Promise<OrgMember[]> {
    return this.unsupported();
  }
  async checkUserAccess(
    _userId: string,
    _organizationId: string,
    _requiredRoles: OrgRole[]
  ): Promise<boolean> {
    return this.unsupported();
  }
}
