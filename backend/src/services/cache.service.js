import NodeCache from 'node-cache';

const cache = new NodeCache({ useClones: false, checkperiod: 600 });

const inFlight = new Map();

export const TTL = {
  DAY: 24 * 60 * 60,
  SIX_HOURS: 6 * 60 * 60,
  TWENTY_MINUTES: 20 * 60,
};

export function cacheKey(...parts) {
  return parts.map((part) => String(part ?? '').trim().toLowerCase()).join('|');
}

export async function cached(key, ttlSeconds, loader) {
  const hit = cache.get(key);
  if (hit !== undefined) {
    console.log(`[cache] hit  ${key}`);
    return hit;
  }

  if (inFlight.has(key)) {
    return inFlight.get(key);
  }

  console.log(`[cache] miss ${key}`);
  const promise = loader()
    .then((value) => {
      cache.set(key, value, ttlSeconds);
      return value;
    })
    .finally(() => inFlight.delete(key));

  inFlight.set(key, promise);
  return promise;
}

export function isCached(key) {
  return cache.has(key);
}