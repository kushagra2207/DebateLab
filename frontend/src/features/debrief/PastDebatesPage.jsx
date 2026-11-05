import { Link } from 'react-router';
import { useArchiveStore } from './store/archiveStore';

const STATUS_TEXT = {
  pending: 'Report not ready',
  done: 'Report ready',
  error: 'Report failed',
};

export default function PastDebatesPage() {
  const { debates, deleteDebate } = useArchiveStore();

  function handleDelete(id) {
    if (window.confirm('Delete this debate and its report?')) deleteDebate(id);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Past debates</h1>

      {debates.length === 0 && (
        <div className="card text-slate-600">
          You have not finished any debates yet. <Link to="/" className="text-indigo-600 hover:underline">Start one</Link>.
        </div>
      )}

      <ul className="space-y-3">
        {debates.map((debate) => (
          <li key={debate.id} className="card flex flex-wrap items-center justify-between gap-3">
            <div>
              <Link to={`/debrief/${debate.id}`} className="font-medium text-indigo-700 hover:underline">
                {debate.motion}
              </Link>
              <p className="text-sm text-slate-500">
                {new Date(debate.createdAt).toLocaleString()} · You argued {debate.side === 'for' ? 'For' : 'Against'} ·{' '}
                {STATUS_TEXT[debate.status]}
              </p>
            </div>
            <button type="button" className="btn-danger" onClick={() => handleDelete(debate.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
