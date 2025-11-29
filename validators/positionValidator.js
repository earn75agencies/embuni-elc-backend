const Joi = require('joi');

/**
 * Position validation schemas
 */

const positionSchema = Joi.object({
  title: Joi.string()
    .required()
    .min(3)
    .max(100)
    .trim()
    .messages({
      'string.empty': 'Position title is required',
      'string.min': 'Position title must be at least 3 characters long',
      'string.max': 'Position title cannot exceed 100 characters',
      'any.required': 'Position title is required'
    }),

  description: Joi.string()
    .required()
    .min(10)
    .max(1000)
    .trim()
    .messages({
      'string.empty': 'Position description is required',
      'string.min': 'Position description must be at least 10 characters long',
      'string.max': 'Position description cannot exceed 1000 characters',
      'any.required': 'Position description is required'
    }),

  electionId: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.empty': 'Election ID is required',
      'string.pattern.base': 'Invalid election ID format',
      'any.required': 'Election ID is required'
    }),

  order: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .default(0)
    .messages({
      'number.base': 'Order must be a number',
      'number.integer': 'Order must be an integer',
      'number.min': 'Order cannot be negative',
      'number.max': 'Order cannot exceed 100'
    }),

  maxCandidates: Joi.number()
    .integer()
    .min(1)
    .max(20)
    .default(10)
    .messages({
      'number.base': 'Maximum candidates must be a number',
      'number.integer': 'Maximum candidates must be an integer',
      'number.min': 'Maximum candidates must be at least 1',
      'number.max': 'Maximum candidates cannot exceed 20'
    }),

  requirements: Joi.array()
    .items(
      Joi.string()
        .min(5)
        .max(200)
        .trim()
    )
    .max(10)
    .default([])
    .messages({
      'array.base': 'Requirements must be an array',
      'array.max': 'Cannot have more than 10 requirements',
      'string.min': 'Each requirement must be at least 5 characters long',
      'string.max': 'Each requirement cannot exceed 200 characters'
    }),

  status: Joi.string()
    .valid('active', 'inactive', 'archived')
    .default('active')
    .messages({
      'any.only': 'Status must be one of: active, inactive, archived'
    }),

  votingMethod: Joi.string()
    .valid('single', 'multiple', 'ranked')
    .default('single')
    .messages({
      'any.only': 'Voting method must be one of: single, multiple, ranked'
    }),

  allowAbstention: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Allow abstention must be a boolean'
    }),

  writeInEnabled: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'Write-in enabled must be a boolean'
    }),

  displayOrder: Joi.number()
    .integer()
    .min(0)
    .default(0)
    .messages({
      'number.base': 'Display order must be a number',
      'number.integer': 'Display order must be an integer',
      'number.min': 'Display order cannot be negative'
    })
});

/**
 * Update position schema (all fields optional)
 */
const updatePositionSchema = positionSchema.fork(
  ['title', 'description', 'electionId'],
  (schema) => schema.optional()
);

/**
 * Validate position creation
 */
const validatePosition = (data) => {
  return positionSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });
};

/**
 * Validate position update
 */
const validatePositionUpdate = (data) => {
  return updatePositionSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });
};

/**
 * Validate position reorder
 */
const validatePositionReorder = Joi.object({
  newOrder: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .required()
    .messages({
      'number.base': 'New order must be a number',
      'number.integer': 'New order must be an integer',
      'number.min': 'New order cannot be negative',
      'number.max': 'New order cannot exceed 100',
      'any.required': 'New order is required'
    })
});

/**
 * Validate position query parameters
 */
const validatePositionQuery = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),

  election: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Invalid election ID format'
    }),

  status: Joi.string()
    .valid('active', 'inactive', 'archived', 'all')
    .default('active')
    .messages({
      'any.only': 'Status must be one of: active, inactive, archived, all'
    }),

  search: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Search term must be at least 2 characters long',
      'string.max': 'Search term cannot exceed 100 characters'
    }),

  sortBy: Joi.string()
    .valid('title', 'createdAt', 'updatedAt', 'order', 'status')
    .default('createdAt')
    .messages({
      'any.only': 'Sort by must be one of: title, createdAt, updatedAt, order, status'
    }),

  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  validatePosition,
  validatePositionUpdate,
  validatePositionReorder,
  validatePositionQuery
};