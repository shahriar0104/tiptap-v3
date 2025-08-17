import { UserRole, BoardMeeting } from '@prisma/client';
import { withTransactionModels, withModels } from '../utils/transaction';
import { supabaseAdmin } from '../config/supabase';
import { ConflictError } from '../utils/errors';

export interface CreateOrganizationInput {
  organizationName: string;
  domain: string;
  description: string;
  adminEmail: string;
  adminPassword: string;
  adminName: string;
}

export interface CreateOrganizationResult {
  organization: any; // TODO: replace any with Organization type once exported centrally
  user: any; // TODO: replace any with User type once exported centrally
  session: any;
}

export interface OrganizationService {
  createOrganizationWithAdmin(
    data: CreateOrganizationInput
  ): Promise<CreateOrganizationResult>;
  getOrganizationMeetings(organizationId: string): Promise<BoardMeeting[]>;
}

export class OrganizationServiceImpl implements OrganizationService {
  async createOrganizationWithAdmin(
    data: CreateOrganizationInput
  ): Promise<CreateOrganizationResult> {
    let supabaseUser: any = null;
    let transactionCompleted = false;

    try {
      const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email: data.adminEmail,
          password: data.adminPassword,
          email_confirm: true,
          user_metadata: {
            full_name: `${data.adminName}`,
          },
        });

      if (authError || !authData.user) {
        throw new ConflictError(
          `Failed to create auth user: ${authError?.message}`
        );
      }

      supabaseUser = authData.user;

      const { organization, user } = await withTransactionModels(
        async ({ models }) => {
          const organization = await models.organizationModel.create({
            name: data.organizationName,
            domain: data.domain,
            description: data.description,
            slug: data.organizationName
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, ''),
          } as any);

          const user = await models.userModel.create({
            id: supabaseUser.id,
            email: data.adminEmail,
            name: `${data.adminName}`,
            role: UserRole.ADMIN,
            isActive: true,
            organizationId: organization.id,
          });

          return { organization, user };
        }
      );

      transactionCompleted = true;

      await supabaseAdmin.auth.admin.updateUserById(supabaseUser.id, {
        user_metadata: {
          ...supabaseUser.user_metadata,
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
      if (!transactionCompleted && supabaseUser) {
        try {
          await supabaseAdmin.auth.admin.deleteUser(supabaseUser.id);
        } catch (cleanupError) {
          // eslint-disable-next-line no-console
          console.error(
            'Failed to cleanup Supabase user after transaction failure:',
            cleanupError
          );
        }
      }
      throw error;
    }
  }

  async getOrganizationMeetings(
    organizationId: string
  ): Promise<BoardMeeting[]> {
    // Read-only: use non-transactional models to avoid holding a tx connection
    return withModels(async ({ models }) => {
      return models.boardMeetingModel.findByOrganizationId(organizationId);
    });
  }
}
