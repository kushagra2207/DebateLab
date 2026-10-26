const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function sessionId(req, res, next) {
  const token = req.get('x-session-id');
  req.sessionId = token && UUID_PATTERN.test(token) ? token.toLowerCase() : null;
  next();
}