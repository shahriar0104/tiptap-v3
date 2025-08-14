"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const client_1 = require("@prisma/client");
const database_1 = __importDefault(require("../config/database"));
class UserModel {
    async findById(id) {
        const findByIdValidator = client_1.Prisma.validator()({
            where: { id },
        });
        return database_1.default.user.findUnique(findByIdValidator);
    }
    async findByEmail(email) {
        const findByEmailValidator = client_1.Prisma.validator()({
            where: { email },
        });
        return database_1.default.user.findUnique(findByEmailValidator);
    }
    async create(data) {
        const createValidator = client_1.Prisma.validator()({
            data: {
                email: data.email,
                firstName: data.firstName || null,
                lastName: data.lastName || null,
                organizationId: data.organizationId || null,
            },
        });
        return database_1.default.user.create(createValidator);
    }
    async update(id, data) {
        const updateData = {};
        if (data.firstName !== undefined)
            updateData['firstName'] = data.firstName;
        if (data.lastName !== undefined)
            updateData['lastName'] = data.lastName;
        if (data.organizationId !== undefined)
            updateData['organizationId'] = data.organizationId;
        const updateValidator = client_1.Prisma.validator()({
            where: { id },
            data: updateData,
        });
        return database_1.default.user.update(updateValidator);
    }
    async delete(id) {
        const deleteValidator = client_1.Prisma.validator()({
            where: { id },
        });
        return database_1.default.user.delete(deleteValidator);
    }
    async findByOrganizationId(organizationId) {
        const findManyValidator = client_1.Prisma.validator()({
            where: { organizationId },
            orderBy: { createdAt: 'desc' },
        });
        return database_1.default.user.findMany(findManyValidator);
    }
}
exports.UserModel = UserModel;
//# sourceMappingURL=userModel.js.map