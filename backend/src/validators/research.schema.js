import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const indicatorSearchSchema = z.object({
  q: z.string().trim().min(2, 'Search text must be at least 2 characters.').max(100),
});

export const indicatorDataSchema = z
  .object({
    indicator: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9._-]{2,80}$/, 'Indicator code may only contain letters, numbers, dots, dashes and underscores.'),
    country: z.string().trim().min(2, 'Enter a country or region.').max(60),
    from: z.coerce.number().int().min(1960).max(currentYear).default(currentYear - 15),
    to: z.coerce.number().int().min(1960).max(currentYear).default(currentYear),
  })
  .refine((data) => data.from <= data.to, { message: '"from" year must not be after "to" year.', path: ['from'] });

export const newsSearchSchema = z.object({
  q: z.string().trim().min(2, 'Search text must be at least 2 characters.').max(150),
  from: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must look like YYYY-MM-DD.')
    .optional()
    .or(z.literal('').transform(() => undefined)),
});