import { z } from 'zod';
import { toJsonSchema } from '../utils/toJsonSchema.js';

export const toolSchemas = {
  search_indicators: {
    description:
      'Search the World Bank indicator catalogue by keywords. Returns indicator ids and names. ' +
      'Use this first when you do not know the exact indicator id.',
    schema: z.object({
      query: z.string().trim().min(2).max(100).describe('Keywords, e.g. "unemployment rate" or "CO2 emissions per capita"'),
    }),
  },

  get_indicator_data: {
    description:
      'Get the yearly values of one World Bank indicator for one country or region. ' +
      'Returns the most recent years that have data.',
    schema: z.object({
      indicator_id: z
        .string()
        .trim()
        .regex(/^[A-Za-z0-9._-]{2,80}$/)
        .describe('Indicator id from search_indicators, e.g. "SL.UEM.TOTL.ZS"'),
      country: z.string().trim().min(2).max(60).describe('Country or region name or code, e.g. "India", "USA" or "World"'),
      from_year: z.coerce.number().int().min(1960).max(2100).optional().describe('First year (optional)'),
      to_year: z.coerce.number().int().min(1960).max(2100).optional().describe('Last year (optional)'),
    }),
  },

  search_news: {
    description: 'Search recent news articles (The Guardian). Returns headlines, short summaries and dates.',
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