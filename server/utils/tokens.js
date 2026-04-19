const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function signAccessToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  // Short-lived access token (used in Authorization header)
  const expiresIn = process.env.ACCESS_TOKEN_EXPIRE || '20m';
  return jwt.sign({ id: userId, type: 'access' }, secret, { expiresIn });
}

function createRefreshToken() {
  // Opaque token stored only as hash in DB (cookie holds raw token)
  return crypto.randomBytes(48).toString('hex');
}

function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function getRefreshCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  const maxAgeMs = Number(process.env.REFRESH_COOKIE_MAX_AGE_MS || 7 * 24 * 60 * 60 * 1000); // 7 days
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: maxAgeMs,
    path: '/api/auth',
  };
}

function getInactivityWindowMs() {
  return Number(process.env.INACTIVITY_WINDOW_MS || 20 * 60 * 1000); // 20 minutes
}

module.exports = {
  signAccessToken,
  createRefreshToken,
  hashRefreshToken,
  getRefreshCookieOptions,
  getInactivityWindowMs,
};

