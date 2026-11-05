import { searchIndicators, getIndicatorData } from '../services/worldBank.service.js';
import { searchNews } from '../services/news.service.js';
import { toolSchemas } from './definitions.js';

const handlers = {
  async get_world_bank_data({ topic, indicator_id, country, from_year, to_year }) {
    const countryWords = country.toLowerCase().split(/\s+/);
    const query = topic
      .split(/\s+/)
      .filter((word) => !countryWords.includes(word.toLowerCase()))
      .join(' ');

    const results = (await searchIndicators(query, 6)).map(({ id, name }) => ({ id, name }));
    const candidates = indicator_id ? [{ id: indicator_id }, ...results] : results;
    if (candidates.length === 0) return { available: false, note: 'No matching World Bank indicator. Try other keywords.' };

    const toYear = to_year ?? new Date().getFullYear();
    const fromYear = from_year ?? toYear - 15;

    for (const match of candidates.slice(0, 3)) {
      const data = await getIndicatorData({ indicatorId: match.id, country, fromYear, toYear }).catch(() => null);
      if (!data?.available) continue;

      const recentValues = data.values
        .filter((row) => row.value !== null)
        .slice(-8)
        .map((row) => ({ year: row.year, value: Math.round(row.value * 100) / 100 }));

      return {
        indicator_id: match.id,
        indicator: data.indicator.name,
        country: data.country.name,
        values: recentValues,
        other_matches: results.filter((result) => result.id !== match.id).slice(0, 4),
      };
    }

    return {
      available: false,
      note: `The World Bank has no recent data on "${topic}" for ${country}.`,
      other_matches: results.slice(0, 4),
    };
  },

  async search_news({ query }) {
    const fromDate = new Date();
    fromDate.setFullYear(fromDate.getFullYear() - 2);

    const articles = await searchNews(query, fromDate.toISOString().slice(0, 10));
    if (articles.length === 0) return { articles: [], note: 'No recent articles found. Try different keywords.' };
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