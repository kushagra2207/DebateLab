
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


export async function requestOpponentReply({ motion, side, round, totalRounds, history }) {
  let response;
  try {
    response = await fetch(`${API_URL}/api/debate/turn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Session-Id': getSessionId() },
      body: JSON.stringify({ motion, side, round, totalRounds, history }),
      signal: AbortSignal.timeout(90000),
    });
  } catch (err) {
    if (err.name === 'TimeoutError') throw new Error('The opponent took too long to reply. Please try again.', { cause: err });
    throw new Error('Could not reach the DebateLab server. Is it running?', { cause: err });
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error?.message || `Request failed (HTTP ${response.status}).`);
  }
  return data.reply;
}
