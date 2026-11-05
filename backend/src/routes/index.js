import { Router } from 'express';
import healthRoutes from './health.routes.js';
import researchRoutes from './research.routes.js';
import debateRoutes from './debate.routes.js';
import debriefRoutes from './debrief.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/research', researchRoutes);
router.use('/debate', debateRoutes);
router.use('/debrief', debriefRoutes);

export default router;