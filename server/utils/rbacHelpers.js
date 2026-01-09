/**
 * RBAC Helper Functions
 * Utility functions for role-based access control checks
 */

/**
 * Check if user is admin
 * @param {Object} user - User object with role property
 * @returns {boolean} - True if user is admin
 */
const isAdmin = (user) => {
  return user && user.role === 'admin';
};

/**
 * Check if user is admin (from request object)
 * @param {Object} req - Express request object
 * @returns {boolean} - True if user is admin
 */
const isAdminFromReq = (req) => {
  return req.user && req.user.role === 'admin';
};

/**
 * Check if user owns resource or is admin
 * @param {string} userId - Current user's ID
 * @param {string|ObjectId} resourceOwnerId - Resource owner's ID
 * @param {string} userRole - Current user's role
 * @returns {boolean} - True if user owns resource or is admin
 */
const isOwnerOrAdmin = (userId, resourceOwnerId, userRole) => {
  if (userRole === 'admin') {
    return true;
  }
  return userId.toString() === resourceOwnerId.toString();
};

/**
 * Check if user can manage another user
 * @param {Object} requester - User making the request
 * @param {Object} targetUser - User being managed
 * @returns {boolean} - True if requester can manage target user
 */
const canManageUser = (requester, targetUser) => {
  // Only admins can manage other users
  if (isAdmin(requester)) {
    return true;
  }
  // Users cannot manage other users
  return false;
};

/**
 * Check if user can manage a post
 * @param {Object} requester - User making the request
 * @param {Object} post - Post being managed
 * @returns {boolean} - True if requester can manage post
 */
const canManagePost = (requester, post) => {
  if (!requester || !post) {
    return false;
  }
  
  // Admins can manage any post
  if (isAdmin(requester)) {
    return true;
  }
  
  // Users can only manage their own posts
  return isOwnerOrAdmin(
    requester.userId || requester._id,
    post.author || post.author._id || post.authorId,
    requester.role
  );
};

/**
 * Check if user can delete a comment
 * @param {Object} requester - User making the request
 * @param {Object} comment - Comment being deleted
 * @param {Object} post - Post the comment belongs to
 * @returns {boolean} - True if requester can delete comment
 */
const canDeleteComment = (requester, comment, post) => {
  if (!requester) {
    return false;
  }
  
  // Admins can delete any comment
  if (isAdmin(requester)) {
    return true;
  }
  
  const requesterId = requester.userId || requester._id;
  const commentAuthorId = comment.author || comment.author._id || comment.authorId;
  const postAuthorId = post.author || post.author._id || post.authorId;
  
  // Comment author can delete their own comment
  if (requesterId.toString() === commentAuthorId.toString()) {
    return true;
  }
  
  // Post author can delete comments on their post
  if (requesterId.toString() === postAuthorId.toString()) {
    return true;
  }
  
  return false;
};

module.exports = {
  isAdmin,
  isAdminFromReq,
  isOwnerOrAdmin,
  canManageUser,
  canManagePost,
  canDeleteComment,
};

