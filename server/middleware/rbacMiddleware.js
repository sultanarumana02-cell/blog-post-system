const { isOwnerOrAdmin, isAdminFromReq } = require('../utils/rbacHelpers');

/**
 * Middleware to check if user owns the resource or is admin
 * Used for routes that require ownership or admin privileges
 * 
 * @param {Function} getResourceOwnerId - Function to extract resource owner ID from request
 * @returns {Function} Express middleware function
 */
const checkOwnershipOrAdmin = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      // Admins can access any resource
      if (isAdminFromReq(req)) {
        return next();
      }

      // Get resource owner ID from request
      const resourceOwnerId = await getResourceOwnerId(req);

      if (!resourceOwnerId) {
        return res.status(404).json({ 
          message: 'Resource not found',
          code: 'RESOURCE_NOT_FOUND'
        });
      }

      // Check if user owns the resource
      if (isOwnerOrAdmin(req.user.userId, resourceOwnerId, req.user.role)) {
        return next();
      }

      // User is not authorized
      return res.status(403).json({ 
        message: 'You do not have permission to perform this action. You can only manage your own resources.',
        code: 'FORBIDDEN'
      });
    } catch (error) {
      console.error('RBAC middleware error:', error);
      return res.status(500).json({ 
        message: 'Authorization check failed',
        code: 'AUTHORIZATION_ERROR'
      });
    }
  };
};

/**
 * Middleware to ensure user is admin
 * Alias for adminMiddleware, but with better error messages
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  if (!isAdminFromReq(req)) {
    return res.status(403).json({ 
      message: 'Admin access required. This action is restricted to administrators.',
      code: 'ADMIN_REQUIRED'
    });
  }

  next();
};

module.exports = {
  checkOwnershipOrAdmin,
  requireAdmin,
};

