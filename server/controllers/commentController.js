const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { canDeleteComment, isOwnerOrAdmin } = require('../utils/rbacHelpers');
const AppError = require('../utils/AppError');

// @desc    Create comment
// @route   POST /api/comments
// @access  Private
const createComment = async (req, res, next) => {
  try {
    const { content, postId } = req.body;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return next(new AppError('Post not found', 404));
    }

    const comment = await Comment.create({
      content,
      author: req.user.userId,
      post: postId,
    });

    const populatedComment = await Comment.findById(comment._id).populate('author', 'username');

    res.status(201).json({ comment: populatedComment });
  } catch (error) {
    next(error);
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private (comment author or admin)
const updateComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.id).populate('post');

    if (!comment) {
      return next(new AppError('Comment not found', 404));
    }

    // Check if user can edit this comment (comment author or admin)
    const commentAuthorId = comment.author.toString();
    const canEdit = isOwnerOrAdmin(
      req.user.userId,
      commentAuthorId,
      req.user.role
    );

    if (!canEdit) {
      return next(new AppError('You do not have permission to edit this comment. You can only edit your own comments.', 403));
    }

    comment.content = content;
    await comment.save();

    const updatedComment = await Comment.findById(comment._id).populate('author', 'username');

    res.json({
      message: 'Comment updated successfully',
      comment: updatedComment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private (comment author, post author, or admin)
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id).populate('post');

    if (!comment) {
      return next(new AppError('Comment not found', 404));
    }

    // Check if user can delete this comment (author, post author, or admin)
    if (!canDeleteComment(req.user, comment, comment.post)) {
      return next(new AppError('You do not have permission to delete this comment. Only the comment author, post author, or administrators can delete comments.', 403));
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComment,
  updateComment,
  deleteComment,
};

