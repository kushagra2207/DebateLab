export default function TranscriptView({ transcript, side }) {
  const userLabel = `You (${side === 'for' ? 'For' : 'Against'})`;
  const opponentLabel = `Opponent (${side === 'for' ? 'Against' : 'For'})`;

  return (
    <details className="card">
      <summary className="cursor-pointer font-semibold">Show the full transcript ({transcript.length} messages)</summary>
      <div className="mt-4 space-y-3">
        {transcript.map((turn, i) => (
          <div key={i} className={`rounded-md p-3 text-sm ${turn.role === 'user' ? 'bg-indigo-50' : 'bg-slate-100'}`}>
            <p className="mb-1 text-xs font-semibold text-slate-500">{turn.role === 'user' ? userLabel : opponentLabel}</p>
            <p className="whitespace-pre-wrap">{turn.text}</p>
          </div>
        ))}
      </div>
    </details>
  );
}
