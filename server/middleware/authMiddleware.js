const { verifyAccessToken } = require('../utils/generateToken');
const User = require('../models/User');

// Verify access token and attach user to request
const authMiddleware = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({
        message: 'Authentication required. Please log in to access this resource.',
        code: 'AUTH_REQUIRED'
      });
    }

    const decoded = verifyAccessToken(accessToken);

    if (!decoded) {
      return res.status(401).json({
        message: 'Invalid or expired authentication token. Please log in again.',
        code: 'INVALID_TOKEN'
      });
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

// Check if user is admin
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Admin access required. This action is restricted to administrators only.',
      code: 'ADMIN_REQUIRED'
    });
  }

  next();
};

module.exports = { authMiddleware, adminMiddleware };

