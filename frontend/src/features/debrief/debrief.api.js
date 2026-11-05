const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const SESSION_KEY = 'debatelab:session';

// Session identifier for rate limiting
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

export async function requestDebrief({ motion, side, transcript, notes }) {
  let response;
  try {
    response = await fetch(`${API_URL}/api/debrief`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Session-Id': getSessionId() },
      body: JSON.stringify({ motion, side, transcript, notes }),
      signal: AbortSignal.timeout(90000), // 90s timeout for LLM report generation
    });
  } catch (err) {
    if (err.name === 'TimeoutError') throw new Error('The coach took too long to respond. Please try again.', { cause: err });
    throw new Error('Could not reach the DebateLab server. Is it running?', { cause: err });
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error?.message || `Request failed (HTTP ${response.status}).`);
  }
  return data;
}
