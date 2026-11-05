import { rateLimit, ipKeyGenerator } from 'express-rate-limit';

const ONE_MINUTE = 60 * 1000;

function createLimiter({ limit, keyGenerator, message }) {
  return rateLimit({
    windowMs: ONE_MINUTE,
    limit,
    keyGenerator,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res) => res.status(429).json({ error: { message } }),
  });
}

const bySessionOrIp = (req) => req.sessionId || ipKeyGenerator(req.ip);
const byIp = (req) => ipKeyGenerator(req.ip);

export const ipLimiter = createLimiter({
  limit: 120,
  keyGenerator: byIp,
  message: 'Too many requests from your network. Please wait a minute and try again.',
});

export const researchLimiter = createLimiter({
  limit: 30,
  keyGenerator: bySessionOrIp,
  message: 'Too many research searches. Please wait a minute and try again.',
});

export const debateLimiter = createLimiter({
  limit: 10,
  keyGenerator: bySessionOrIp,
  message: 'You are sending arguments too quickly. Please wait a minute and try again.',
});

export const debriefLimiter = createLimiter({
  limit: 5,
  keyGenerator: bySessionOrIp,
  message: 'Too many debrief requests. Please wait a minute and try again.',
});