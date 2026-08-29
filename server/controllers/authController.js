const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { z } = require('zod');

const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const SALT_ROUNDS = 12;
const COOKIE_NAME = 'token';
const COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// --- Validation schemas (used by validateRequest middleware in the routes) ---

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

// --- Helpers ---

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });

const setAuthCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE_MS,
  });
};

const clearAuthCookie = (res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
};

// --- Handlers ---

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, passwordHash });

  const token = signToken(user._id);
  setAuthCookie(res, token);

  res.status(201).json({ user: user.toSafeObject() });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Same message for "no such user" and "wrong password" —
    // never reveal which one it was.
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  user.lastActiveDate = new Date();
  await user.save();

  const token = signToken(user._id);
  setAuthCookie(res, token);

  res.status(200).json({ user: user.toSafeObject() });
});

const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  res.status(200).json({ message: 'Logged out' });
});

const me = asyncHandler(async (req, res) => {
  // req.user is attached by the requireAuth middleware
  res.status(200).json({ user: req.user.toSafeObject() });
});

module.exports = {
  register,
  login,
  logout,
  me,
  registerSchema,
  loginSchema,
};
