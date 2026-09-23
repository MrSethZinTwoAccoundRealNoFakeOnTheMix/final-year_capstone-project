const { NODE_ENV } = require('../config');
const logger = require('../utils/logger');

/**
 * Global Express error handling middleware.
 */
function errorHandler(err, req, res, next) {
  logger.error(`[ErrorHandler] ${req.method} ${req.originalUrl}:`, err.stack || err.message || err);

  let status = err.status || err.statusCode;

  if (!status) {
    const msg = (err.message || '').toLowerCase();
    if (msg.includes('insufficient stock')) {
      status = 409;
    } else if (msg.includes('not found')) {
      status = 404;
    } else if (msg.includes('unauthorized')) {
      status = 401;
    } else if (msg.includes('forbidden') || msg.includes('requires')) {
      status = 403;
    } else if (msg.includes('cannot confirm') || msg.includes('cannot cancel') || msg.includes('cannot ship') || msg.includes('cannot return')) {
      status = 400;
    } else {
      status = 500;
    }
  }

  const response = {
    error: err.message || 'Internal Server Error',
  };

  // Stack trace only exposed in development for non-standard errors
  if (NODE_ENV === 'development' && status === 500 && err.stack) {
    response.stack = err.stack;
  }

  res.status(status).json(response);
}

module.exports = errorHandler;
