import { BadRequestError } from '../errors/custom-errors.js';

/**
 * Middleware factory to validate Express request (body, params, query) using Zod
 */
export function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = parsed.body || req.body;
      req.query = parsed.query || req.query;
      req.params = parsed.params || req.params;

      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.').replace(/^(body|query|params)\./, ''),
          message: err.message,
        }));
        return next(new BadRequestError('Validation Failed', formattedErrors));
      }
      next(error);
    }
  };
}
