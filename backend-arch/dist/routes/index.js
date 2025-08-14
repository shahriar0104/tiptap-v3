"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const boardMeetingRoutes_1 = __importDefault(require("./boardMeetingRoutes"));
const agendaRoutes_1 = __importDefault(require("./agendaRoutes"));
const router = (0, express_1.Router)();
router.get('/health', (_req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
    });
});
router.use('/auth', authRoutes_1.default);
router.use('/board-meetings', boardMeetingRoutes_1.default);
router.use('/agenda', agendaRoutes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map