"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoardMeetingService = void 0;
const errors_1 = require("../utils/errors");
const supabase_1 = require("../config/supabase");
class BoardMeetingService {
    boardMeetingModel;
    organizationModel;
    userModel;
    constructor(boardMeetingModel, organizationModel, userModel) {
        this.boardMeetingModel = boardMeetingModel;
        this.organizationModel = organizationModel;
        this.userModel = userModel;
    }
    async createBoardMeeting(data, createdById) {
        if (new Date(data.scheduledAt) <= new Date()) {
            throw new errors_1.ValidationError('Scheduled date must be in the future');
        }
        return this.boardMeetingModel.create(data, createdById);
    }
    async getBoardMeetingById(id, userOrganizationId) {
        const meeting = await this.boardMeetingModel.findById(id);
        if (!meeting) {
            throw new errors_1.NotFoundError('Board meeting not found');
        }
        if (userOrganizationId && meeting.organizationId !== userOrganizationId) {
            throw new errors_1.ForbiddenError('Access denied to this board meeting');
        }
        return meeting;
    }
    async getBoardMeetings(organizationId, status, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [meetings, total] = await Promise.all([
            this.boardMeetingModel.findMany(organizationId, status, skip, limit),
            this.boardMeetingModel.count(organizationId, status),
        ]);
        return {
            data: meetings,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async updateBoardMeeting(id, data, userOrganizationId) {
        const existingMeeting = await this.boardMeetingModel.findById(id);
        if (!existingMeeting) {
            throw new errors_1.NotFoundError('Board meeting not found');
        }
        if (userOrganizationId && existingMeeting.organizationId !== userOrganizationId) {
            throw new errors_1.ForbiddenError('Access denied to this board meeting');
        }
        if (data.scheduledAt && new Date(data.scheduledAt) <= new Date()) {
            throw new errors_1.ValidationError('Scheduled date must be in the future');
        }
        if (data.status) {
            this.validateStatusTransition(existingMeeting.status, data.status);
        }
        return this.boardMeetingModel.update(id, data);
    }
    async deleteBoardMeeting(id, userOrganizationId) {
        const existingMeeting = await this.boardMeetingModel.findById(id);
        if (!existingMeeting) {
            throw new errors_1.NotFoundError('Board meeting not found');
        }
        if (userOrganizationId && existingMeeting.organizationId !== userOrganizationId) {
            throw new errors_1.ForbiddenError('Access denied to this board meeting');
        }
        if (existingMeeting.status !== 'SCHEDULED') {
            throw new errors_1.ValidationError('Only scheduled meetings can be deleted');
        }
        await this.boardMeetingModel.delete(id);
    }
    async getBoardMeetingsByOrganization(organizationId) {
        return this.boardMeetingModel.findByOrganizationId(organizationId);
    }
    async updateMeetingStatus(id, status, userOrganizationId) {
        const existingMeeting = await this.boardMeetingModel.findById(id);
        if (!existingMeeting) {
            throw new errors_1.NotFoundError('Board meeting not found');
        }
        if (userOrganizationId && existingMeeting.organizationId !== userOrganizationId) {
            throw new errors_1.ForbiddenError('Access denied to this board meeting');
        }
        this.validateStatusTransition(existingMeeting.status, status);
        return this.boardMeetingModel.update(id, { status });
    }
    validateStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            SCHEDULED: ['IN_PROGRESS', 'CANCELLED'],
            IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
            COMPLETED: [],
            CANCELLED: ['SCHEDULED'],
        };
        const allowedTransitions = validTransitions[currentStatus];
        if (!allowedTransitions.includes(newStatus)) {
            throw new errors_1.ValidationError(`Invalid status transition from ${currentStatus} to ${newStatus}`);
        }
    }
    async createOrganizationWithBoardMeeting(data) {
        let supabaseUser = null;
        try {
            const { data: authData, error: authError } = await supabase_1.supabase.auth.admin.createUser({
                email: data.adminEmail,
                password: data.adminPassword,
                email_confirm: true,
                user_metadata: {
                    full_name: `${data.adminFirstName} ${data.adminLastName}`,
                },
            });
            if (authError || !authData.user) {
                throw new errors_1.ConflictError(`Failed to create auth user: ${authError?.message}`);
            }
            supabaseUser = authData.user;
            const organization = await this.organizationModel.create({
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
                    ...supabaseUser.user_metadata,
                    organizationId: organization.id,
                    role: 'ADMIN',
                },
            });
            const boardMeeting = await this.boardMeetingModel.create({
                title: data.boardMeetingTitle,
                description: data.boardMeetingDescription,
                scheduledAt: new Date(data.boardMeetingScheduledAt),
                duration: data.boardMeetingDuration,
                location: data.boardMeetingLocation,
                organizationId: organization.id,
            }, user.id);
            return {
                organization,
                user,
                boardMeeting,
                session: authData.session || null,
            };
        }
        catch (error) {
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
exports.BoardMeetingService = BoardMeetingService;
//# sourceMappingURL=boardMeetingService.js.map