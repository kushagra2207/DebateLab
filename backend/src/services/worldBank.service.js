import { fetchJson } from '../utils/fetchJson.js';
import { cached, cacheKey, isCached, TTL } from './cache.service.js';

const BASE_URL = 'https://api.worldbank.org/v2';
const SERVICE_NAME = 'the World Bank';
const WDI_SOURCE = 'World Development Indicators';
const CATALOGUE_KEY = 'wb:catalogue';

function isWorldBankError(body) {
  return Array.isArray(body) && body[0]?.message;
}

async function fetchCataloguePage(page) {
  const url = `${BASE_URL}/indicator?format=json&per_page=20000&page=${page}`;
  const body = await fetchJson(url, { serviceName: SERVICE_NAME, timeoutMs: 60000 });
  if (isWorldBankError(body) || !Array.isArray(body[1])) {
    const error = new Error('The World Bank indicator list could not be loaded.');
    error.status = 502;
    throw error;
  }
  return { totalPages: body[0].pages, indicators: body[1] };
}

async function loadCatalogue() {
  return cached(CATALOGUE_KEY, TTL.DAY, async () => {
    const first = await fetchCataloguePage(1);
    let rawIndicators = first.indicators;

    for (let page = 2; page <= first.totalPages; page++) {
      const next = await fetchCataloguePage(page);
      rawIndicators = rawIndicators.concat(next.indicators);
    }

    const byId = new Map();
    for (const item of rawIndicators) {
      if (byId.has(item.id)) continue;
      const name = item.name?.trim() || item.id;
      const description = item.sourceNote?.trim() || '';
      byId.set(item.id, {
        id: item.id,
        name,
        description,
        source: item.source?.value?.trim() || '',
        nameLower: name.toLowerCase(),
        descriptionLower: description.toLowerCase(),
      });
    }

    console.log(`[worldBank] catalogue loaded: ${byId.size} indicators`);
    return [...byId.values()];
  });
}

export function warmUpCatalogue() {
  loadCatalogue().catch((err) => console.error('[worldBank] catalogue warm-up failed:', err.message));
}

export function isCatalogueLoaded() {
  return isCached(CATALOGUE_KEY);
}

function publicIndicator(indicator, descriptionLength = 300) {
  const description =
    indicator.description.length > descriptionLength
      ? `${indicator.description.slice(0, descriptionLength).trim()}...`
      : indicator.description;
  return { id: indicator.id, name: indicator.name, description, source: indicator.source };
}

export async function searchIndicators(query, limit = 15) {
  const catalogue = await loadCatalogue();
  const words = query.toLowerCase().split(/\s+/).filter((word) => word.length > 1);
  if (words.length === 0) return [];

  const scored = [];
  for (const indicator of catalogue) {
    let score = 0;
    let allWordsFound = true;

    for (const word of words) {
      if (indicator.nameLower.includes(word)) score += 3;
      else if (indicator.descriptionLower.includes(word)) score += 1;
      else {
        allWordsFound = false;
        break;
      }
    }
    if (!allWordsFound) continue;

    if (indicator.source === WDI_SOURCE) score += 4;
    if (indicator.nameLower.startsWith(words[0])) score += 1;
    scored.push({ indicator, score });
  }

  scored.sort((a, b) => b.score - a.score || a.indicator.name.length - b.indicator.name.length);
  return scored.slice(0, limit).map(({ indicator }) => publicIndicator(indicator));
}

async function findIndicatorInCatalogue(indicatorId) {
  try {
    const catalogue = await loadCatalogue();
    return catalogue.find((indicator) => indicator.id.toLowerCase() === indicatorId.toLowerCase()) || null;
  } catch {
    return null;
  }
}

export async function getCountries() {
  return cached('wb:countries', TTL.DAY, async () => {
    const body = await fetchJson(`${BASE_URL}/country?format=json&per_page=400`, { serviceName: SERVICE_NAME });
    if (isWorldBankError(body) || !Array.isArray(body[1])) {
      const error = new Error('The World Bank country list could not be loaded.');
      error.status = 502;
      throw error;
    }
    return body[1]
      .map((country) => ({
        code: country.id,
        iso2: country.iso2Code,
        name: country.name.trim(),
        isRegion: country.region?.value === 'Aggregates',
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });
}

export async function resolveCountry(input) {
  const countries = await getCountries();
  const text = input.trim().toLowerCase();

  const exact = countries.find(
    (c) => c.code.toLowerCase() === text || c.iso2.toLowerCase() === text || c.name.toLowerCase() === text,
  );
  if (exact) return exact;

  const startsWith = countries.find((c) => c.name.toLowerCase().startsWith(text));
  if (startsWith) return startsWith;

  const contains = countries.find((c) => c.name.toLowerCase().includes(text));
  if (contains) return contains;

  const error = new Error(`No country or region called "${input}" was found in World Bank data.`);
  error.status = 404;
  throw error;
}

export async function getIndicatorData({ indicatorId, country, fromYear, toYear }) {
  const resolvedCountry = await resolveCountry(country);
  const key = cacheKey('wb:data', indicatorId, resolvedCountry.code, fromYear, toYear);

  const result = await cached(key, TTL.SIX_HOURS, async () => {
    const url =
      `${BASE_URL}/country/${resolvedCountry.code}/indicator/${encodeURIComponent(indicatorId)}` +
      `?format=json&date=${fromYear}:${toYear}&per_page=200`;
    const body = await fetchJson(url, { serviceName: SERVICE_NAME });

    if (isWorldBankError(body)) {
      const error = new Error(`The World Bank has no indicator with the code "${indicatorId}".`);
      error.status = 404;
      throw error;
    }

    const rows = Array.isArray(body[1]) ? body[1] : [];
    const values = rows
      .map((row) => ({ year: Number(row.date), value: row.value }))
      .filter((row) => Number.isFinite(row.year))
      .sort((a, b) => a.year - b.year);

    return { indicatorNameFromData: rows[0]?.indicator?.value || null, values };
  });

  const catalogueEntry = await findIndicatorInCatalogue(indicatorId);
  const indicator = catalogueEntry
    ? publicIndicator(catalogueEntry, 600)
    : { id: indicatorId, name: result.indicatorNameFromData || indicatorId, description: '', source: '' };

  const available = result.values.some((row) => row.value !== null);

  return {
    indicator,
    country: { code: resolvedCountry.code, name: resolvedCountry.name, isRegion: resolvedCountry.isRegion },
    fromYear,
    toYear,
    available,
    message: available
      ? null
      : `The World Bank has no data for this indicator in ${resolvedCountry.name} between ${fromYear} and ${toYear}.`,
    values: result.values,
  };
}