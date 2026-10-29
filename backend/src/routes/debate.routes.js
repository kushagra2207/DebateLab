import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { debateLimiter } from '../middleware/rateLimit.js';
import { debateTurnSchema } from '../validators/debate.schema.js';
import { debateTurnController } from '../controllers/debate.controller.js';

const router = Router();

router.post('/turn', debateLimiter, validate({ body: debateTurnSchema }), debateTurnController);

export default router;