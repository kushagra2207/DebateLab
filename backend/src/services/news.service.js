import { fetchJson } from '../utils/fetchJson.js';
import { cached, cacheKey, TTL } from './cache.service.js';

const BASE_URL = 'https://content.guardianapis.com/search';
const SERVICE_NAME = 'the Guardian news service';

function toPlainText(html = '') {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function searchNews(query, fromDate) {
  if (!process.env.GUARDIAN_API_KEY) {
    const error = new Error('News search is not configured on the server yet (GUARDIAN_API_KEY is missing).');
    error.status = 503;
    throw error;
  }

  const key = cacheKey('news', query, fromDate);

  return cached(key, TTL.TWENTY_MINUTES, async () => {
    const params = new URLSearchParams({
      q: query,
      'order-by': 'relevance',
      'page-size': '10',
      'show-fields': 'trailText',
      'api-key': process.env.GUARDIAN_API_KEY,
    });
    if (fromDate) params.set('from-date', fromDate);

    let body;
    try {
      body = await fetchJson(`${BASE_URL}?${params}`, { serviceName: SERVICE_NAME });
    } catch (err) {
      if (err.upstreamStatus === 401 || err.upstreamStatus === 403) {
        const error = new Error('The news service rejected the server API key. Check GUARDIAN_API_KEY.');
        error.status = 503;
        throw error;
      }
      if (err.upstreamStatus === 429) {
        const error = new Error('The news service limit has been reached. Please try again later.');
        error.status = 503;
        throw error;
      }
      throw err;
    }

    const results = body?.response?.results ?? [];
    return results.map((article) => ({
      title: article.webTitle,
      summary: toPlainText(article.fields?.trailText),
      source: article.sectionName ? `The Guardian - ${article.sectionName}` : 'The Guardian',
      publishedAt: article.webPublicationDate,
      url: article.webUrl,
    }));
  });
}