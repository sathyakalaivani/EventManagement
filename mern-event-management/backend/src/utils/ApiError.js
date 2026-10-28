/**
 * Standardized application error used throughout controllers.
 * Thrown errors are caught by the global error middleware.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;