function formatTime(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export default function RoundTimer({ remainingMs, paused }) {
  if (paused || remainingMs === null) {
    return <span className="rounded-md bg-slate-100 px-3 py-1 font-mono text-slate-500">Paused</span>;
  }

  const lowTime = remainingMs < 30 * 1000;
  return (
    <span
      className={`rounded-md px-3 py-1 font-mono text-lg font-semibold ${lowTime ? 'bg-red-100 text-red-700' : 'bg-indigo-50 text-indigo-700'}`}
      title="Time left this round. When it runs out, your text is sent automatically."
    >
      {formatTime(remainingMs)}
    </span>
  );
}
