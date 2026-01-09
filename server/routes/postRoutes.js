const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getMyPosts,
  getAllPostsAdmin,
  getPostByIdAdmin,
  bulkDeletePosts,
  restorePost,
} = require('../controllers/postController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const validate = require('../middleware/validation');
const {
  createPostSchema,
  updatePostSchema,
  postIdSchema,
  bulkDeleteSchema,
} = require('../validators/postValidator');

// Public routes
router.get('/', getAllPosts);

// User-specific routes (must come before /:id route)
router.get('/my/posts', authMiddleware, getMyPosts);

// Admin routes (must come before /:id route)
router.get('/admin/all', authMiddleware, adminMiddleware, getAllPostsAdmin);
router.get(
  '/admin/:id',
  authMiddleware,
  adminMiddleware,
  validate(postIdSchema, 'params'),
  getPostByIdAdmin
);
router.post(
  '/admin/bulk-delete',
  authMiddleware,
  adminMiddleware,
  validate(bulkDeleteSchema),
  bulkDeletePosts
);
router.post(
  '/:id/restore',
  authMiddleware,
  adminMiddleware,
  validate(postIdSchema, 'params'),
  restorePost
);

// Public single post route
router.get('/:id', validate(postIdSchema, 'params'), getPostById);

// Protected routes
router.post('/', authMiddleware, validate(createPostSchema), createPost);
router.put(
  '/:id',
  authMiddleware,
  validate(postIdSchema, 'params'),
  validate(updatePostSchema),
  updatePost
);
router.delete('/:id', authMiddleware, validate(postIdSchema, 'params'), deletePost);

module.exports = router;

