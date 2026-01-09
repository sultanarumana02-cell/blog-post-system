const Joi = require('joi');
const mongoose = require('mongoose');

// Helper to validate MongoDB ObjectId
const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'MongoDB ObjectId validation');

// Comment creation validation schema
const createCommentSchema = Joi.object({
  content: Joi.string()
    .trim()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'string.empty': 'Comment content is required',
      'string.min': 'Comment must be at least 1 character',
      'string.max': 'Comment cannot exceed 1000 characters',
      'any.required': 'Comment content is required',
    }),
  postId: objectId
    .required()
    .messages({
      'any.required': 'Post ID is required',
      'any.invalid': 'Invalid post ID format',
    }),
});

// Comment update validation schema
const updateCommentSchema = Joi.object({
  content: Joi.string()
    .trim()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'string.empty': 'Comment content is required',
      'string.min': 'Comment must be at least 1 character',
      'string.max': 'Comment cannot exceed 1000 characters',
      'any.required': 'Comment content is required',
    }),
});

// Comment ID parameter validation
const commentIdSchema = Joi.object({
  id: objectId
    .required()
    .messages({
      'any.required': 'Comment ID is required',
      'any.invalid': 'Invalid comment ID format',
    }),
});

module.exports = {
  createCommentSchema,
  updateCommentSchema,
  commentIdSchema,
};

