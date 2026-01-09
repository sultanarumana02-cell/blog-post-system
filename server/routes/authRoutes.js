const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
  register,
  login,
  logout,
  refresh,
  getMe,
  googleCallback,
  facebookCallback,
} = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  registerLimiter,
  loginLimiter,
  refreshLimiter,
} = require('../middleware/rateLimiter');

// Regular auth routes
router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.post('/refresh', refreshLimiter, refresh);
router.get('/me', authMiddleware, getMe);

// Google OAuth routes
router.get(
  '/google',
  (req, res, next) => {
    console.log('Initiating Google OAuth flow');
    next();
  },
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

const fs = require('fs');
const path = require('path');

const logToFile = (message) => {
  const logPath = path.join(__dirname, '..', 'debug_oauth.log');
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
};

router.get(
  '/google/callback',
  (req, res, next) => {
    console.log('Google OAuth: Callback received');
    logToFile('Google OAuth: Callback received at route handler');
    logToFile(`Request Query: ${JSON.stringify(req.query)}`);
    next();
  },
  passport.authenticate('google', {
    failureRedirect: process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/login?error=oauth_failed` : '/login?error=oauth_failed',
    session: true
  }),
  googleCallback
);

// Facebook OAuth routes
router.get(
  '/facebook',
  (req, res, next) => {
    console.log('Initiating Facebook OAuth flow');
    next();
  },
  passport.authenticate('facebook', { scope: ['email'] })
);

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/login?error=oauth_failed` : '/login?error=oauth_failed',
    session: true
  }),
  facebookCallback
);

module.exports = router;

