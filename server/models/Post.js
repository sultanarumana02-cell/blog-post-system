const mongoose = require('mongoose');
const { generateSlug, ensureUniqueSlug } = require('../utils/slugGenerator');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      maxlength: [200, 'Slug cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      minlength: [10, 'Content must be at least 10 characters'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ slug: 1 });
postSchema.index({ deletedAt: 1 });
postSchema.index({ title: 'text', content: 'text' }); // Text index for search

// Query helper to exclude soft-deleted posts by default
postSchema.query.notDeleted = function () {
  return this.where({ deletedAt: null });
};

// Query helper to include soft-deleted posts
postSchema.query.withDeleted = function () {
  return this; // No filtering
};

// Query helper to get only soft-deleted posts
postSchema.query.onlyDeleted = function () {
  return this.where({ deletedAt: { $ne: null } });
};

// Pre-save hook to generate slug from title
postSchema.pre('save', async function (next) {
  // Only generate slug if title is modified or slug doesn't exist
  if (this.isModified('title') || !this.slug) {
    const baseSlug = generateSlug(this.title);

    // Ensure slug is unique
    const checkSlugExists = async (slug, excludeId) => {
      const query = { slug, deletedAt: null }; // Only check non-deleted posts
      if (excludeId) {
        query._id = { $ne: excludeId };
      }
      const existing = await mongoose.model('Post').findOne(query);
      return !!existing;
    };

    try {
      this.slug = await ensureUniqueSlug(baseSlug, checkSlugExists, this._id);
    } catch (error) {
      return next(error);
    }
  }

  next();
});

module.exports = mongoose.model('Post', postSchema);

