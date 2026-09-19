import { BadRequestError } from '../errors/custom-errors.js';

/**
 * 🛡️ UNIVERSAL REQUEST VALIDATION MIDDLEWARE (Zod Schema Validator)
 * 
 * Real-World Analogy: Customs & Border Control Inspection Desk 🛂
 * Before an incoming HTTP request reaches any Controller or Database Logic,
 * Zod thoroughly inspects all dimensions of the request:
 *   1. req.body   (POST/PUT payload payloads)
 *   2. req.query  (URL search params e.g. ?page=1&limit=10)
 *   3. req.params (Route path params e.g. /users/:id)
 * 
 * If the payload violates business validation rules:
 * - Halts execution immediately before hitting database queries or controllers.
 * - Formats human-readable errors with stripped path prefixes (e.g. 'email' instead of 'body.email').
 * - Returns a unified HTTP 400 Bad Request JSON response.
 * 
 * @param {import('zod').ZodSchema} schema - Zod object schema defining body, query, and/or params
 * @returns {import('express').RequestHandler}
 */
export function validate(schema) {
  return async (req, res, next) => {
    try {
      // 1. Asynchronously validate across body, query, and path params
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // 2. Re-assign sanitized & transformed values back to Express request object
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) req.query = parsed.query;
      if (parsed.params !== undefined) req.params = parsed.params;

      // 3. Attach immutable typed validated object for downstream handlers
      req.validated = parsed;

      next();
    } catch (error) {
      if (error.name === 'ZodError' && Array.isArray(error.errors)) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.').replace(/^(body|query|params)\./, '') || 'general',
          message: err.message,
        }));
        return next(new BadRequestError('Validation Failed', formattedErrors));
      }
      next(error);
    }
  };
}
