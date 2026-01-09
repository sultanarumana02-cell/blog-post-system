const express = require('express');
const router = express.Router();
const {
  createComment,
  updateComment,
  deleteComment,
} = require('../controllers/commentController');
const { authMiddleware } = require('../middleware/authMiddleware');
const validate = require('../middleware/validation');
const {
  createCommentSchema,
  updateCommentSchema,
  commentIdSchema,
} = require('../validators/commentValidator');

// All comment routes require authentication
router.use(authMiddleware);

router.post('/', validate(createCommentSchema), createComment);
router.put(
  '/:id',
  validate(commentIdSchema, 'params'),
  validate(updateCommentSchema),
  updateComment
);
router.delete('/:id', validate(commentIdSchema, 'params'), deleteComment);

module.exports = router;

