export async function fetchJson(url, { serviceName = 'External service', timeoutMs = 8000, signal, ...options } = {}) {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const combinedSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;

  let response;
  try {
    response = await fetch(url, { ...options, signal: combinedSignal });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw err;
    }
    const error = new Error(
      err.name === 'TimeoutError'
        ? `${serviceName} took too long to respond. Please try again.`
        : `Could not reach ${serviceName}. Please try again later.`,
    );
    error.status = err.name === 'TimeoutError' ? 504 : 502;
    throw error;
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(`${serviceName} returned an error (HTTP ${response.status}).`);
    error.status = 502;
    error.upstreamStatus = response.status;
    error.upstreamBody = body;
    error.retryAfter = Number(response.headers.get('retry-after')) || null;
    throw error;
  }

  if (body === null) {
    const error = new Error(`${serviceName} sent a response that could not be read.`);
    error.status = 502;
    throw error;
  }

  return body;
}