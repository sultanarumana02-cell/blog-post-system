const Joi = require('joi');
const mongoose = require('mongoose');

// Helper to validate MongoDB ObjectId
const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'MongoDB ObjectId validation');

// Post creation/update validation schema
const createPostSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required',
    }),
  content: Joi.string()
    .trim()
    .min(10)
    .required()
    .messages({
      'string.empty': 'Content is required',
      'string.min': 'Content must be at least 10 characters',
      'any.required': 'Content is required',
    }),
});

// Post update validation schema (all fields optional but if provided, must be valid)
const updatePostSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .messages({
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title cannot exceed 200 characters',
    }),
  content: Joi.string()
    .trim()
    .min(10)
    .messages({
      'string.min': 'Content must be at least 10 characters',
    }),
}).min(1).messages({
  'object.min': 'At least one field (title or content) must be provided',
});

// Post ID/Slug parameter validation
const postIdSchema = Joi.object({
  id: Joi.string()
    .required()
    .messages({
      'any.required': 'Post ID or slug is required',
    }),
});

// Bulk delete validation schema
const bulkDeleteSchema = Joi.object({
  postIds: Joi.array()
    .items(objectId)
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one post ID must be provided',
      'any.required': 'postIds array is required',
    }),
});

module.exports = {
  createPostSchema,
  updatePostSchema,
  postIdSchema,
  bulkDeleteSchema,
};

