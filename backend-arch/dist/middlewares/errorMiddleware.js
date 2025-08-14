"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const errorHandler = (error, _req, res, next) => {
    if (res.headersSent) {
        next(error);
        return;
    }
    if (error instanceof errors_1.AppError) {
        res.status(error.statusCode).json({
            success: false,
            error: error.message,
        });
        return;
    }
    if (error.name === 'ValidationError') {
        res.status(400).json({
            success: false,
            error: error.message,
        });
        return;
    }
    if (error.name === 'PrismaClientKnownRequestError') {
        const prismaError = error;
        switch (prismaError.code) {
            case 'P2002':
                res.status(409).json({
                    success: false,
                    error: 'A record with this information already exists',
                });
                return;
            case 'P2025':
                res.status(404).json({
                    success: false,
                    error: 'Record not found',
                });
                return;
            default:
                res.status(500).json({
                    success: false,
                    error: 'Database error occurred',
                });
                return;
        }
    }
    res.status(500).json({
        success: false,
        error: process.env['NODE_ENV'] === 'production'
            ? 'Internal server error'
            : error.message,
    });
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    return res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.path} not found`,
    });
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=errorMiddleware.js.map