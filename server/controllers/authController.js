const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/generateToken');

const AppError = require('../utils/AppError');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return next(new AppError('User already exists', 400));
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role: 'user', // Default role
    });

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return next(new AppError('No refresh token', 401));
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return next(new AppError('Invalid refresh token', 401));
    }

    // Generate new access token
    const accessToken = generateAccessToken(decoded.userId, decoded.role);

    // Set new access token cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.json({ message: 'Token refreshed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    console.log('getMe called with user:', req.user);
    if (!req.user || !req.user.userId) {
      console.error('getMe: Missing user ID in request');
      return next(new AppError('User ID missing', 400));
    }

    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      console.error('getMe: User not found in DB for ID:', req.user.userId);
      return next(new AppError('User not found', 404));
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('getMe: Error encountered:', error);
    next(error);
  }
};

// Helper function to set JWT tokens in cookies and redirect
const setTokensAndRedirect = (req, res, user) => {
  // Generate tokens
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id, user.role);

  // Set cookies
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Redirect to frontend with user data in URL (for frontend to store)
  const userData = encodeURIComponent(
    JSON.stringify({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    })
  );

  const redirectUrl = `${process.env.CLIENT_URL}/auth/callback?user=${userData}`;
  res.redirect(redirectUrl);
};

// ============================================
// GOOGLE OAUTH CALLBACK HANDLER
// ============================================
// @desc    Handle callback after Google OAuth authentication
// @route   GET /api/auth/google/callback
// @access  Public
// This function is called after Passport successfully authenticates with Google
// It sets JWT tokens and redirects the user back to the frontend
const googleCallback = (req, res) => {
  try {
    // req.user is populated by Passport after successful authentication
    if (!req.user) {
      console.error('Google OAuth: No user returned from authentication');
      return res.redirect(`${process.env.CLIENT_URL}/login?error=authentication_failed`);
    }

    // Save session before redirect to ensure session data persists
    // This is important for maintaining authentication state
    req.session.save((err) => {
      if (err) {
        console.error('Google OAuth: Session save error:', err);
        return res.redirect(`${process.env.CLIENT_URL}/login?error=session_error`);
      }
      // Set JWT tokens in cookies and redirect to frontend
      setTokensAndRedirect(req, res, req.user);
    });
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_callback_error`);
  }
};

// ============================================
// FACEBOOK OAUTH CALLBACK HANDLER
// ============================================
// @desc    Handle callback after Facebook OAuth authentication
// @route   GET /api/auth/facebook/callback
// @access  Public
// This function is called after Passport successfully authenticates with Facebook
// It sets JWT tokens and redirects the user back to the frontend
const facebookCallback = (req, res) => {
  try {
    // req.user is populated by Passport after successful authentication
    if (!req.user) {
      console.error('Facebook OAuth: No user returned from authentication');
      return res.redirect(`${process.env.CLIENT_URL}/login?error=authentication_failed`);
    }

    // Save session before redirect to ensure session data persists
    // This is important for maintaining authentication state
    req.session.save((err) => {
      if (err) {
        console.error('Facebook OAuth: Session save error:', err);
        return res.redirect(`${process.env.CLIENT_URL}/login?error=session_error`);
      }
      // Set JWT tokens in cookies and redirect to frontend
      setTokensAndRedirect(req, res, req.user);
    });
  } catch (error) {
    console.error('Facebook OAuth callback error:', error);
    return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_callback_error`);
  }
};

module.exports = {
  register,
  login,
  logout,
  refresh,
  getMe,
  googleCallback,
  facebookCallback,
};

