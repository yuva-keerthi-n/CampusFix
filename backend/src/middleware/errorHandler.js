/* eslint-disable no-unused-vars */

// Thrown deliberately anywhere in the app for a controlled error response.
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function notFoundHandler(req, res, next) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  // Prisma "record not found"
  if (err.code === 'P2025') {
    return res.status(404).json({ success: false, message: 'Record not found.' });
  }
  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    return res.status(409).json({ success: false, message: `Duplicate value for field: ${err.meta?.target}` });
  }
  // Prisma foreign-key violation (e.g. deleting a category that complaints still use)
  if (err.code === 'P2003') {
    return res.status(409).json({ success: false, message: 'This item is in use by existing complaints and cannot be deleted.' });
  }
  // Multer file-type / size rejection
  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: err.message });
  }

  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'Something went wrong on the server.';

  res.status(statusCode).json({ success: false, message });
}

module.exports = { ApiError, notFoundHandler, errorHandler };
