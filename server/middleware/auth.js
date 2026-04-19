const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ message: 'User not found' });

    // Track last activity (server-enforced inactivity is checked during refresh)
    const now = Date.now();
    const last = req.user.lastActiveAt ? req.user.lastActiveAt.getTime() : 0;
    // avoid writing on every request; update at most once per minute
    if (now - last > 60 * 1000) {
      req.user.lastActiveAt = new Date(now);
      await req.user.save({ validateBeforeSave: false });
    }
    next();
  } catch (error) {
    if (error?.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Access token expired', code: 'ACCESS_TOKEN_EXPIRED' });
    }
    res.status(401).json({ message: 'Not authorized, token failed', code: 'NOT_AUTHORIZED' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).json({ message: 'Admin access required' });
};

module.exports = { protect, isAdmin };
