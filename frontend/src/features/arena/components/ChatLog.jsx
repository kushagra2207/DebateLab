import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

export default function ChatLog({ turns, side, waiting, pendingText }) {
  const bottomRef = useRef(null);
  const userLabel = `You (${side === 'for' ? 'For' : 'Against'})`;
  const opponentLabel = `Opponent (${side === 'for' ? 'Against' : 'For'})`;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [turns.length, waiting]);

  return (
    <div className="h-[55vh] space-y-3 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
      {turns.length === 0 && !waiting && (
        <p className="text-center text-sm text-slate-500">
          {side === 'for'
            ? 'You speak first. Make your opening argument below.'
            : 'The opponent (For) gives the opening statement first.'}
        </p>
      )}

      {turns.map((turn, i) => (
        <MessageBubble key={i} role={turn.role} label={turn.role === 'user' ? userLabel : opponentLabel} text={turn.text} />
      ))}

      {waiting && pendingText && <MessageBubble role="user" label={userLabel} text={pendingText} pending />}

      {waiting && (
        <p className="animate-pulse text-sm text-slate-500">
          {turns.length === 0 && !pendingText ? 'The opponent is preparing an opening statement...' : 'The opponent is thinking...'}
        </p>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
