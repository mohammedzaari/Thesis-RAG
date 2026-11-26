import multer from 'multer';
import { HttpError } from '../utils/HttpError.js';

export const notFoundHandler = (_req, _res, next) => next(new HttpError(404, 'Route not found'));

/** Last middleware: converts every error into a consistent JSON payload. */
// eslint-disable-next-line no-unused-vars
export function errorHandler(error, _req, res, _next) {
  if (error instanceof multer.MulterError) {
    const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(status).json({ message: error.message });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: 'Resource already exists' });
  }
  const status = error.status ?? 500;
  if (status >= 500) console.error('[error]', error);
  return res.status(status).json({
    message: status >= 500 ? 'Internal server error' : error.message,
    details: error.details,
  });
}
