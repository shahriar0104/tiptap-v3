"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPaginatedResponse = exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, data, message, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        data,
        message,
    });
};
exports.sendSuccess = sendSuccess;
const sendError = (res, error, statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        error,
    });
};
exports.sendError = sendError;
const sendPaginatedResponse = (res, data, page, limit, total, message) => {
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({
        success: true,
        data: {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        },
        message,
    });
};
exports.sendPaginatedResponse = sendPaginatedResponse;
//# sourceMappingURL=response.js.map