import { z } from 'zod';
import { motionSchema, sideSchema, turnSchema, MAX_ROUNDS } from './debate.schema.js';

export const debriefSchema = z.object({
  motion: motionSchema,
  side: sideSchema,
  transcript: z.array(turnSchema).min(1, 'The transcript is empty.').max(MAX_ROUNDS * 2 + 1),
  notes: z.array(z.string().trim().max(2000)).max(50).default([]),
});