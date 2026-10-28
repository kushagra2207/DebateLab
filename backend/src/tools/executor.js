import { searchIndicators, getIndicatorData } from '../services/worldBank.service.js';
import { searchNews } from '../services/news.service.js';
import { toolSchemas } from './definitions.js';

const handlers = {
  async search_indicators({ query }) {
    const results = await searchIndicators(query, 6);
    if (results.length === 0) return { results: [], note: 'No matching indicators. Try different keywords.' };
    return { results: results.map(({ id, name }) => ({ id, name })) };
  },

  async get_indicator_data({ indicator_id, country, from_year, to_year }) {
    const currentYear = new Date().getFullYear();
    const toYear = to_year ?? currentYear;
    const fromYear = from_year ?? toYear - 15;

    const data = await getIndicatorData({ indicatorId: indicator_id, country, fromYear, toYear });
    if (!data.available) return { available: false, note: data.message };

    const recentValues = data.values
      .filter((row) => row.value !== null)
      .slice(-8)
      .map((row) => ({ year: row.year, value: Math.round(row.value * 100) / 100 }));

    return { indicator: data.indicator.name, country: data.country.name, values: recentValues };
  },

  async search_news({ query }) {
    const articles = await searchNews(query);
    if (articles.length === 0) return { articles: [], note: 'No articles found.' };
    return {
      articles: articles.slice(0, 5).map((article) => ({
        title: article.title,
        summary: article.summary.slice(0, 200),
        date: article.publishedAt?.slice(0, 10),
      })),
    };
  },
};

export async function runTool(name, rawArguments) {
  const tool = toolSchemas[name];
  if (!tool) {
    return JSON.stringify({ error: `Unknown tool "${name}".` });
  }

  let args;
  try {
    args = JSON.parse(rawArguments || '{}');
  } catch {
    return JSON.stringify({ error: 'Arguments were not valid JSON.' });
  }

  const parsed = tool.schema.safeParse(args);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    return JSON.stringify({ error: `Invalid arguments: ${problems}` });
  }

  try {
    const result = await handlers[name](parsed.data);
    console.log(`[tool] ${name} ok`);
    return JSON.stringify(result);
  } catch (err) {
    console.warn(`[tool] ${name} failed: ${err.message}`);
    return JSON.stringify({ error: `Lookup failed: ${err.message} Do not guess numbers; argue without them.` });
  }
}