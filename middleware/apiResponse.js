/**
 * API Response Middleware
 * Standardizes API responses for consistency
 */

/**
 * Success response wrapper
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message,
    ...(data !== null && { data })
  };

  // Add metadata if available
  if (res.locals.pagination) {
    response.pagination = res.locals.pagination;
  }

  return res.status(statusCode).json(response);
};

/**
 * Error response wrapper
 */
const errorResponse = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    error: {
      message,
      statusCode
    }
  };

  if (errors) {
    response.error.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Pagination helper
 */
const paginate = (req, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null
  };
};

/**
 * Attach pagination to response
 */
const attachPagination = (req, total, page, limit) => {
  return (req, res, next) => {
    res.locals.pagination = paginate(req, total, page, limit);
    next();
  };
};

module.exports = {
  successResponse,
  errorResponse,
  paginate,
  attachPagination
};

