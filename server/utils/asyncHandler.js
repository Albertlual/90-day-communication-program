// Wraps an async Express handler so rejected promises are forwarded to
// next(err) automatically, instead of every controller needing its own
// try/catch. Errors end up in the central errorHandler middleware.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
