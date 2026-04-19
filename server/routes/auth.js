const router = require('express').Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const {
  signAccessToken,
  createRefreshToken,
  hashRefreshToken,
  getRefreshCookieOptions,
  getInactivityWindowMs,
} = require('../utils/tokens');

const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || 'shopverse_refresh';

// POST /api/auth/signup
router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required' });
    
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password });

    const refreshToken = createRefreshToken();
    user.refreshTokenHash = hashRefreshToken(refreshToken);
    user.lastActiveAt = new Date();
    await user.save({ validateBeforeSave: false });

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      token: signAccessToken(user._id)
    });
  } catch (err) { next(err); }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const refreshToken = createRefreshToken();
    user.refreshTokenHash = hashRefreshToken(refreshToken);
    user.lastActiveAt = new Date();
    await user.save({ validateBeforeSave: false });

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());
    res.json({
      _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar,
      token: signAccessToken(user._id)
    });
  } catch (err) { next(err); }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token', code: 'NO_REFRESH_TOKEN' });

    const refreshHash = hashRefreshToken(refreshToken);
    const user = await User.findOne({ refreshTokenHash: refreshHash });
    if (!user) {
      res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
      return res.status(401).json({ message: 'Invalid refresh token', code: 'INVALID_REFRESH_TOKEN' });
    }

    const inactivityMs = getInactivityWindowMs();
    const lastActive = user.lastActiveAt ? user.lastActiveAt.getTime() : 0;
    if (!lastActive || Date.now() - lastActive > inactivityMs) {
      user.refreshTokenHash = '';
      await user.save({ validateBeforeSave: false });
      res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
      return res.status(401).json({ message: 'Session expired due to inactivity', code: 'INACTIVITY_EXPIRED' });
    }

    // Rotate refresh token
    const nextRefreshToken = createRefreshToken();
    user.refreshTokenHash = hashRefreshToken(nextRefreshToken);
    user.lastActiveAt = new Date();
    await user.save({ validateBeforeSave: false });

    res.cookie(REFRESH_COOKIE_NAME, nextRefreshToken, getRefreshCookieOptions());
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: signAccessToken(user._id),
    });
  } catch (err) { next(err); }
});

// POST /api/auth/logout
router.post('/logout', async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (refreshToken) {
      const refreshHash = hashRefreshToken(refreshToken);
      const user = await User.findOne({ refreshTokenHash: refreshHash });
      if (user) {
        user.refreshTokenHash = '';
        await user.save({ validateBeforeSave: false });
      }
    }
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
    res.json({ message: 'Logged out' });
  } catch (err) { next(err); }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json(user);
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { name, phone, avatar, addresses } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (addresses) user.addresses = addresses;
    await user.save();
    res.json(user);
  } catch (err) { next(err); }
});

// PUT /api/auth/password
router.put('/password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) { next(err); }
});

module.exports = router;
