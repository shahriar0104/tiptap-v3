"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class OrganizationModel {
    async create(data) {
        return database_1.default.organization.create({
            data,
        });
    }
    async findById(id) {
        return database_1.default.organization.findUnique({
            where: { id },
        });
    }
    async findByName(name) {
        return database_1.default.organization.findFirst({
            where: { name },
        });
    }
    async update(id, data) {
        return database_1.default.organization.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return database_1.default.organization.delete({
            where: { id },
        });
    }
    async findAll() {
        return database_1.default.organization.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
}
exports.OrganizationModel = OrganizationModel;
//# sourceMappingURL=organizationModel.js.map