import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useSetupStore } from '../landing';
import { useDebateStore, isUsersTurn } from './store/debateStore';
import { useCountdown } from './hooks/useCountdown';
import RoundTimer from './components/RoundTimer';
import ChatLog from './components/ChatLog';
import Composer from './components/Composer';
import NotesSidePanel from './components/NotesSidePanel';

export default function ArenaPage() {
  const navigate = useNavigate();
  const { motion, side, totalRounds, locked } = useSetupStore();
  const debate = useDebateStore();
  const { status, round, turns, deadline, draft, waiting, pendingText, error } = debate;

  const remainingMs = useCountdown(deadline);
  const usersTurn = status === 'active' && !waiting && isUsersTurn(turns, side);

  useEffect(() => {
    const store = useDebateStore.getState();
    if (store.status === 'idle' && useSetupStore.getState().locked) store.startDebate();
    else store.resume();
  }, []);

  useEffect(() => {
    if (usersTurn && deadline && remainingMs === 0) {
      useDebateStore.getState().sendArgument(useDebateStore.getState().draft);
    }
  }, [usersTurn, deadline, remainingMs]);

  if (status === 'idle' && !locked) {
    return <Navigate to="/" replace />;
  }

  function handleEndEarly() {
    if (turns.length === 0) {
      handleAbandon();
      return;
    }
    if (window.confirm('End the debate now and get your feedback?')) debate.endEarly();
  }

  function handleAbandon() {
    if (window.confirm('Abandon this debate? It will not be saved.')) {
      debate.resetDebate();
      navigate('/');
    }
  }

  function handleGetFeedback() {
    const id = debate.archiveDebate();
    navigate(`/debrief/${id}`);
  }

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase">Motion</p>
          <p className="font-medium">{motion}</p>
          <p className="mt-1 text-sm text-slate-500">
            You argue <span className="font-semibold">{side === 'for' ? 'For' : 'Against'}</span> · Round{' '}
            {Math.min(round, totalRounds)} of {totalRounds}
          </p>
        </div>
        {status === 'active' && <RoundTimer remainingMs={remainingMs} paused={!usersTurn} />}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <ChatLog turns={turns} side={side} waiting={waiting} pendingText={pendingText} />

          {error && (
            <div className="error-box flex items-center justify-between gap-2">
              <span>{error}</span>
              {turns.length === 0 && side === 'against' ? (
                <button type="button" className="underline" onClick={() => debate.requestOpening()}>
                  Retry
                </button>
              ) : (
                <button type="button" className="underline" onClick={debate.clearError}>
                  Dismiss
                </button>
              )}
            </div>
          )}

          {status === 'active' && (
            <>
              <Composer
                draft={draft}
                onDraftChange={debate.setDraft}
                onSend={() => debate.sendArgument(draft)}
                disabled={!usersTurn}
              />
              <div className="flex flex-wrap gap-3">
                <button type="button" className="btn-secondary" onClick={handleEndEarly} disabled={waiting}>
                  End debate early
                </button>
                <button type="button" className="btn-danger" onClick={handleAbandon} disabled={waiting}>
                  Abandon debate
                </button>
              </div>
            </>
          )}

          {status === 'finished' && (
            <div className="card space-y-3 text-center">
              <p className="font-semibold">The debate is over.</p>
              <p className="text-sm text-slate-600">Read the opponent's last reply, then get your coaching report.</p>
              <button type="button" className="btn-primary" onClick={handleGetFeedback}>
                Get my feedback
              </button>
            </div>
          )}
        </div>

        <NotesSidePanel />
      </div>
    </div>
  );
}
