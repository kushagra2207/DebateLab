import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { debriefLimiter } from '../middleware/rateLimit.js';
import { debriefSchema } from '../validators/debrief.schema.js';
import { debriefController } from '../controllers/debrief.controller.js';

const router = Router();

router.post('/', debriefLimiter, validate({ body: debriefSchema }), debriefController);

export default router;