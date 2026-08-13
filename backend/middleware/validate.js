const ApiError = require('../utils/ApiError');

/**
 * Validates req.body against a Zod schema. On success, req.body is replaced
 * with the parsed/coerced (and therefore type-safe, trimmed, etc.) result so
 * downstream controllers/services/repositories never see raw unvalidated
 * input. On failure, responds 400 with a readable message instead of letting
 * malformed input reach business logic or the database layer.
 */
const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`)
      .join('; ');
    return next(new ApiError(400, message || 'Invalid request body'));
  }
  req.body = result.data;
  next();
};

/**
 * Lightweight guard rail for endpoints whose body shape is inherently
 * dynamic (e.g. a form-builder's public submission endpoint, where the set
 * of fields is defined by an admin at runtime and can't be described by a
 * fixed schema). Rejects non-object bodies, empty submissions, an excessive
 * number of fields, and individual values that are implausibly large -
 * without knowing/caring what the actual field names are.
 */
const validateDynamicObjectBody = ({ maxKeys = 100, maxStringLength = 10000 } = {}) => (req, res, next) => {
  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return next(new ApiError(400, 'Request body must be a JSON object'));
  }

  const keys = Object.keys(body);
  if (keys.length === 0) {
    return next(new ApiError(400, 'Request body cannot be empty'));
  }
  if (keys.length > maxKeys) {
    return next(new ApiError(400, `Request body has too many fields (max ${maxKeys})`));
  }

  for (const key of keys) {
    const value = body[key];
    if (typeof value === 'string' && value.length > maxStringLength) {
      return next(new ApiError(400, `Field "${key}" is too long (max ${maxStringLength} characters)`));
    }
  }

  next();
};

module.exports = { validateBody, validateDynamicObjectBody };
