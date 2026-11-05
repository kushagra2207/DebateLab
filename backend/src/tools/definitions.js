import { z } from 'zod';
import { toJsonSchema } from '../utils/toJsonSchema.js';

export const toolSchemas = {
  get_world_bank_data: {
    description:
      'Get yearly World Bank statistics for one country or region in a single lookup. ' +
      'Finds the best matching indicator for the topic and returns its most recent values, plus other close matches. ' +
      'Good for long-term figures on economy, health, education, environment and population.',
    schema: z.object({
      topic: z
        .string()
        .trim()
        .min(2)
        .max(100)
        .describe(
          'Short keywords for the statistic only, without the country, using World Bank wording, ' +
            'e.g. "unemployment total labor force", "health expenditure" or "CO2 emissions per capita"',
        ),
      indicator_id: z
        .string()
        .trim()
        .regex(/^[A-Za-z0-9._-]{2,80}$/)
        .optional()
        .describe('Exact World Bank indicator code if you know it, e.g. "SL.UEM.TOTL.ZS" (optional)'),
      country: z.string().trim().min(2).max(60).describe('Country or region name or code, e.g. "India", "USA" or "World"'),
      from_year: z.coerce.number().int().min(1960).max(2100).optional().describe('First year (optional)'),
      to_year: z.coerce.number().int().min(1960).max(2100).optional().describe('Last year (optional)'),
    }),
  },

  search_news: {
    description:
      'Search news articles from the last two years (The Guardian). Returns headlines, short summaries and dates. ' +
      'Good for recent events, policies, announcements and current developments.',
    schema: z.object({
      query: z.string().trim().min(2).max(100).describe('What to search for, e.g. "India renewable energy targets"'),
    }),
  },
};

export const toolDefinitions = Object.entries(toolSchemas).map(([name, tool]) => ({
  type: 'function',
  function: {
    name,
    description: tool.description,
    parameters: toJsonSchema(tool.schema),
  },
}));