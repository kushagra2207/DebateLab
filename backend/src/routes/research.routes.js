import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { researchLimiter } from '../middleware/rateLimit.js';
import { indicatorSearchSchema, indicatorDataSchema, newsSearchSchema } from '../validators/research.schema.js';
import {
  searchIndicatorsController,
  getIndicatorDataController,
  getCountriesController,
  searchNewsController,
} from '../controllers/research.controller.js';

const router = Router();

router.use(researchLimiter);

router.get('/indicators/search', validate({ query: indicatorSearchSchema }), searchIndicatorsController);
router.get('/indicators/data', validate({ query: indicatorDataSchema }), getIndicatorDataController);
router.get('/countries', getCountriesController);
router.get('/news', validate({ query: newsSearchSchema }), searchNewsController);

export default router;