const express = require('express');

const authController = require('../controllers/authController');
const requireAuth = require('../middleware/requireAuth');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.post(
  '/register',
  validateRequest(authController.registerSchema),
  authController.register
);

router.post(
  '/login',
  validateRequest(authController.loginSchema),
  authController.login
);

router.post('/logout', authController.logout);

router.get('/me', requireAuth, authController.me);

module.exports = router;
