import multer from 'multer';
import { HttpError } from '../utils/HttpError.js';

const MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024;

/** In-memory upload restricted to a single PDF. Magic bytes are checked by the service. */
export const uploadPdf = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PDF_SIZE_BYTES, files: 1 },
  fileFilter: (_req, file, callback) =>
    file.mimetype === 'application/pdf'
      ? callback(null, true)
      : callback(new HttpError(415, 'Only PDF files are accepted')),
}).single('file');
