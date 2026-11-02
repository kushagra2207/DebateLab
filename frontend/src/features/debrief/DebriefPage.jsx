import { useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { useArchiveStore } from './store/archiveStore';
import ReportView from './components/ReportView';
import TranscriptView from './components/TranscriptView';

export default function DebriefPage() {
  const { id } = useParams();
  const debate = useArchiveStore((state) => state.debates.find((d) => d.id === id));
  const generateReport = useArchiveStore((state) => state.generateReport);

  const status = debate?.status;

  // Request report on load if not yet generated
  useEffect(() => {
    if (status === 'pending') generateReport(id);
  }, [status, id, generateReport]);

  if (!debate) {
    return (
      <div className="card">
        <p>This debate could not be found. It may have been deleted.</p>
        <Link to="/debriefs" className="btn-secondary mt-4">
          See past debates
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Debate feedback</h1>
        <p className="mt-1 text-slate-600">
          <span className="font-medium">Motion:</span> {debate.motion}
        </p>
        <p className="text-sm text-slate-500">
          You argued {debate.side === 'for' ? 'For' : 'Against'} · {new Date(debate.createdAt).toLocaleString()}
        </p>
      </div>

      {status === 'pending' && (
        <div className="card text-slate-600">Your coach is writing the report. This can take up to a minute...</div>
      )}

      {status === 'error' && (
        <div className="card space-y-3">
          <p className="error-box">{debate.error}</p>
          <button type="button" className="btn-primary" onClick={() => generateReport(id)}>
            Try again
          </button>
        </div>
      )}

      {status === 'done' && (
        <>
          {!debate.complete && (
            <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
              Some parts of this report could not be generated.
            </p>
          )}
          <ReportView report={debate.report} />
        </>
      )}

      <TranscriptView transcript={debate.transcript} side={debate.side} />

      <div className="flex flex-wrap gap-3">
        <Link to="/" className="btn-primary">
          Start a new debate
        </Link>
        <Link to="/debriefs" className="btn-secondary">
          All past debates
        </Link>
      </div>
    </div>
  );
}
