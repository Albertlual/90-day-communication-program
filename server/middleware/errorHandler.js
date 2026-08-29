const logger = require('../utils/logger');

// Central error handler. Must be registered last, after all routes.
// Known errors (with a statusCode) return their own message.
// Unknown errors return a generic message; full detail goes to server logs only.
const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;

  logger.error(err.message || 'Unhandled error', {
    status,
    path: req.originalUrl,
    method: req.method,
    stack: err.stack,
  });

  const message = status === 500 ? 'Something went wrong. Please try again.' : err.message;

  res.status(status).json({ error: message });
};

module.exports = errorHandler;
