// Generic request-body validator. Pass a zod schema; on success req.body is
// replaced with the parsed (trimmed/typed) data, on failure a 400 is returned
// with a readable message. The backend remains the source of truth for
// validation even when the frontend also checks input.
const validateRequest = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const message = result.error.errors.map((e) => e.message).join(', ');
    return res.status(400).json({ error: message });
  }

  req.body = result.data;
  next();
};

module.exports = validateRequest;
