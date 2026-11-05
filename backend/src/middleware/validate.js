export function validate({ query, body }) {
  return (req, res, next) => {
    req.validated = {};

    if (query) {
      const result = query.safeParse(req.query);
      if (!result.success) return sendValidationError(res, result.error);
      req.validated.query = result.data;
    }

    if (body) {
      const result = body.safeParse(req.body ?? {});
      if (!result.success) return sendValidationError(res, result.error);
      req.validated.body = result.data;
    }

    next();
  };
}

function sendValidationError(res, zodError) {
  const details = zodError.issues.map((issue) => ({ 
    field: issue.path.join('.'), 
    message: issue.message 
  }));
  res.status(400).json({ 
    error: { 
      message: details[0]?.message || 'Invalid request.', details 
    } 
  });
}