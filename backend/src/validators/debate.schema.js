import { z } from 'zod';

export const MAX_ROUNDS = 6;
export const MAX_USER_TEXT = 2000;
const MAX_TURN_TEXT = 3000;
const MAX_HISTORY = MAX_ROUNDS * 2 + 1;

export const motionSchema = z
  .string()
  .trim()
  .min(10, 'The motion must be at least 10 characters.')
  .max(300, 'The motion must be at most 300 characters.');

export const sideSchema = z.enum(['for', 'against']);

export const turnSchema = z
  .object({
    role: z.enum(['user', 'opponent']),
    text: z.string().trim().min(1).max(MAX_TURN_TEXT),
  })
  .refine((turn) => turn.role !== 'user' || turn.text.length <= MAX_USER_TEXT, {
    message: `Each argument can be at most ${MAX_USER_TEXT} characters.`,
  });

function alternates(turns) {
  return turns.every((turn, i) => i === 0 || turn.role !== turns[i - 1].role);
}

export const debateTurnSchema = z
  .object({
    motion: motionSchema,
    side: sideSchema,
    round: z.number().int().min(1).max(MAX_ROUNDS),
    totalRounds: z.number().int().min(1).max(MAX_ROUNDS),
    history: z.array(turnSchema).max(MAX_HISTORY),
  })
  .refine((data) => data.round <= data.totalRounds, { message: 'round cannot be greater than totalRounds.', path: ['round'] })
  .refine((data) => alternates(data.history), { message: 'History turns must alternate.', path: ['history'] })
  .refine((data) => data.history.length === 0 || data.history.at(-1).role === 'user', {
    message: 'History must end with the user\'s newest argument.',
    path: ['history'],
  });