const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const AppError = require('../utils/AppError');

// Get system stats
router.get('/stats', authMiddleware, adminMiddleware, async (req, res, next) => {
    try {
        const [userCount, postCount, commentCount] = await Promise.all([
            User.countDocuments(),
            Post.countDocuments(),
            Comment.countDocuments()
        ]);

        res.json({
            users: userCount,
            posts: postCount,
            comments: commentCount
        });
    } catch (error) {
        next(new AppError('Error fetching stats', 500));
    }
});

module.exports = router;
