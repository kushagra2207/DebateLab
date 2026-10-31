import { useEffect, useState } from 'react';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

// Health check banner on initial load
export default function ServerStatus() {
  const [warning, setWarning] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/health`, { signal: AbortSignal.timeout(8000) })
      .then((response) => response.json())
      .then((health) => {
        const missing = [];
        if (!health.aiConfigured) missing.push('the AI opponent (GROQ_API_KEY)');
        if (!health.newsConfigured) missing.push('news search (GUARDIAN_API_KEY)');
        if (missing.length > 0) setWarning(`Not configured on the server yet: ${missing.join(' and ')}.`);
      })
      .catch(() =>
        setWarning(
          API_URL
            ? 'Cannot reach the DebateLab server. Searches and debates will not work until it is running.'
            : 'VITE_API_URL is not set. Add it to frontend/.env and restart the dev server.',
        ),
      );
  }, []);

  if (!warning) return null;

  return <div className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">{warning}</div>;
}
