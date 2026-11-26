import { HttpError } from '../utils/HttpError.js';

/**
 * Validates and normalises a request part with a zod schema.
 * @param {import('zod').ZodTypeAny} schema
 * @param {'body'|'query'} source
 */
export const validate =
  (schema, source = 'body') =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(new HttpError(400, 'Validation failed', result.error.flatten().fieldErrors));
    }
    // `req.query` is a getter in Express 5, so the parsed value goes to a dedicated field.
    req.validated = { ...req.validated, [source]: result.data };
    return next();
  };
