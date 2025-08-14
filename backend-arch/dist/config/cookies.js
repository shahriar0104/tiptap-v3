"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COOKIE_NAMES = exports.cookieConfig = void 0;
exports.cookieConfig = {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
    secret: process.env['COOKIE_SECRET'] || 'your-secret-key',
};
exports.COOKIE_NAMES = {
    ACCESS_TOKEN: 'sb_access_token',
    REFRESH_TOKEN: 'sb_refresh_token',
};
//# sourceMappingURL=cookies.js.map