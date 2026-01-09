const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { canManagePost } = require('../utils/rbacHelpers');
const AppError = require('../utils/AppError');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
const getAllPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Exclude soft-deleted posts
    const posts = await Post.find()
      .notDeleted()
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ deletedAt: null });

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post with comments (supports ID or slug)
// @route   GET /api/posts/:id
// @access  Public
const getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if id is a valid MongoDB ObjectId or a slug
    const mongoose = require('mongoose');
    let post;

    if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
      // Try to find by ID first
      post = await Post.findOne({ _id: id }).notDeleted().populate('author', 'username');
    }

    // If not found by ID or not a valid ObjectId, try slug
    if (!post) {
      post = await Post.findOne({ slug: id }).notDeleted().populate('author', 'username');
    }

    if (!post) {
      return next(new AppError('Post not found', 404));
    }

    // Get comments for this post (only if post is not deleted)
    const comments = await Comment.find({ post: post._id })
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    res.json({ post, comments });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    const post = await Post.create({
      title,
      content,
      author: req.user.userId,
    });

    const populatedPost = await Post.findById(post._id).populate('author', 'username');

    res.status(201).json({ post: populatedPost });
  } catch (error) {
    next(error);
  }
};

// @desc    Update post (supports ID or slug)
// @route   PUT /api/posts/:id
// @access  Private (author or admin)
const updatePost = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const { id } = req.params;

    const mongoose = require('mongoose');
    let post;

    // Try by ID first, then by slug
    if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
      post = await Post.findById(id).notDeleted();
    }
    if (!post) {
      post = await Post.findOne({ slug: id }).notDeleted();
    }

    if (!post) {
      return next(new AppError('Post not found', 404));
    }

    // Check if user can manage this post (owner or admin)
    if (!canManagePost(req.user, post)) {
      return next(new AppError('You do not have permission to update this post. You can only update your own posts.', 403));
    }

    post.title = title || post.title;
    post.content = content || post.content;

    await post.save();

    const updatedPost = await Post.findById(post._id).populate('author', 'username');

    res.json({ post: updatedPost });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post (soft delete for users, hard delete for admins)
// @route   DELETE /api/posts/:id
// @access  Private (author or admin)
const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const hardDelete = req.query.hard === 'true' && req.user.role === 'admin';

    const mongoose = require('mongoose');
    let post;

    // Try by ID first, then by slug
    if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
      post = await Post.findById(id);
    }
    if (!post) {
      post = await Post.findOne({ slug: id });
    }

    if (!post) {
      return next(new AppError('Post not found', 404));
    }

    // Check if already soft-deleted
    if (post.deletedAt && !hardDelete) {
      return next(new AppError('Post not found', 404));
    }

    // Check if user can manage this post (owner or admin)
    if (!canManagePost(req.user, post)) {
      return next(new AppError('You do not have permission to delete this post. You can only delete your own posts.', 403));
    }

    if (hardDelete && req.user.role === 'admin') {
      // Hard delete: permanently remove post and comments
      await Comment.deleteMany({ post: post._id });
      await Post.findByIdAndDelete(post._id);
      res.json({ message: 'Post permanently deleted' });
    } else {
      // Soft delete: set deletedAt timestamp
      post.deletedAt = new Date();
      await post.save();
      res.json({ message: 'Post deleted successfully' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Restore soft-deleted post
// @route   POST /api/posts/:id/restore
// @access  Private/Admin
const restorePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const mongoose = require('mongoose');
    let post;

    // Try by ID first, then by slug
    if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
      post = await Post.findById(id);
    }
    if (!post) {
      post = await Post.findOne({ slug: id });
    }

    if (!post) {
      return next(new AppError('Post not found', 404));
    }

    if (!post.deletedAt) {
      return next(new AppError('Post is not deleted', 400));
    }

    post.deletedAt = null;
    await post.save();

    const restoredPost = await Post.findById(post._id).populate('author', 'username');

    res.json({
      message: 'Post restored successfully',
      post: restoredPost
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get authenticated user's own posts
// @route   GET /api/posts/my/posts
// @access  Private
const getMyPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: req.user.userId })
      .notDeleted()
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ author: req.user.userId, deletedAt: null });

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all posts (Admin view with additional metadata, including soft-deleted)
// @route   GET /api/posts/admin/all
// @access  Private/Admin
const getAllPostsAdmin = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const includeDeleted = req.query.deleted === 'true';

    // Admin view includes author email and additional metadata
    let query = Post.find();
    if (!includeDeleted) {
      query = query.notDeleted();
    }

    const posts = await query
      .populate('author', 'username email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = includeDeleted
      ? await Post.countDocuments()
      : await Post.countDocuments({ deletedAt: null });

    // Get comment counts for each post
    const postsWithStats = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await Comment.countDocuments({ post: post._id });
        return {
          ...post.toObject(),
          commentCount,
        };
      })
    );

    res.json({
      posts: postsWithStats,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post (Admin view with full details, supports ID or slug)
// @route   GET /api/posts/admin/:id
// @access  Private/Admin
const getPostByIdAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    let post;

    // Try by ID first, then by slug (admin can see deleted posts)
    if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
      post = await Post.findById(id).populate('author', 'username email role createdAt');
    }
    if (!post) {
      post = await Post.findOne({ slug: id }).populate('author', 'username email role createdAt');
    }

    if (!post) {
      return next(new AppError('Post not found', 404));
    }

    // Get all comments with author details
    const comments = await Comment.find({ post: post._id })
      .populate('author', 'username email role')
      .sort({ createdAt: -1 });

    // Get comment count
    const commentCount = comments.length;

    res.json({
      post: {
        ...post.toObject(),
        commentCount,
      },
      comments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk delete posts (Admin only) - Soft delete by default, hard delete with query param
// @route   POST /api/posts/admin/bulk-delete
// @access  Private/Admin
const bulkDeletePosts = async (req, res, next) => {
  try {
    const { postIds } = req.body;
    const hardDelete = req.query.hard === 'true';

    if (!Array.isArray(postIds) || postIds.length === 0) {
      return next(new AppError('Invalid request. postIds must be a non-empty array.', 400));
    }

    if (hardDelete) {
      // Hard delete: permanently remove posts and comments
      await Comment.deleteMany({ post: { $in: postIds } });
      const result = await Post.deleteMany({ _id: { $in: postIds } });

      res.json({
        message: `Successfully permanently deleted ${result.deletedCount} post(s)`,
        deletedCount: result.deletedCount,
      });
    } else {
      // Soft delete: set deletedAt timestamp
      const result = await Post.updateMany(
        { _id: { $in: postIds }, deletedAt: null },
        { $set: { deletedAt: new Date() } }
      );

      res.json({
        message: `Successfully deleted ${result.modifiedCount} post(s)`,
        deletedCount: result.modifiedCount,
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};

