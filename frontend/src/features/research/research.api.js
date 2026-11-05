const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const SESSION_KEY = 'debatelab:session';

function getSessionId() {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

async function getJson(path, params = {}, timeoutMs = 20000) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}?${query}`, {
      headers: { 'X-Session-Id': getSessionId() },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    if (err.name === 'TimeoutError') throw new Error('The server took too long to respond. Please try again.', { cause: err });
    throw new Error('Could not reach the DebateLab server. Is it running?', { cause: err });
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error?.message || `Request failed (HTTP ${response.status}).`);
  }
  return data;
}

export async function searchIndicators(query) {
  const data = await getJson('/api/research/indicators/search', { q: query }, 60000);
  return data.results;
}

export function getIndicatorData({ indicator, country, from, to }) {
  return getJson('/api/research/indicators/data', { indicator, country, from, to });
}

export async function getCountries() {
  const data = await getJson('/api/research/countries');
  return data.countries;
}

export async function searchNews(query, fromDate) {
  const data = await getJson('/api/research/news', { q: query, from: fromDate });
  return data.articles;
}
