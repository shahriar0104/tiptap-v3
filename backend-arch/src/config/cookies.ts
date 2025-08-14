export const cookieConfig = {
  httpOnly: true,
  secure: process.env['NODE_ENV'] === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
  secret: process.env['COOKIE_SECRET'] || 'your-secret-key',
};

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'sb_access_token',
  REFRESH_TOKEN: 'sb_refresh_token',
} as const;
