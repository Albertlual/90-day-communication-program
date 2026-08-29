const jwt = require('jsonwebtoken');

const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Protects a route: verifies the httpOnly "token" cookie, loads the user,
// and attaches it as req.user. Every controller for user-owned data should
// scope its queries by req.user.id — never trust a client-supplied userId.
const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  const user = await User.findById(payload.userId);
  if (!user) {
    return res.status(401).json({ error: 'User no longer exists' });
  }

  req.user = user;
  next();
});

module.exports = requireAuth;
