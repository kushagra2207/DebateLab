import { useNotesStore } from '../notes/notesStore';

function formatDate(isoDate) {
  return isoDate ? new Date(isoDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';
}

export default function NewsCard({ article }) {
  const addNote = useNotesStore((state) => state.addNote);

  function handleAddToNotes() {
    addNote(`${article.title} (${article.source}, ${formatDate(article.publishedAt)})\n${article.url}`);
    window.alert('Added to your notes.');
  }

  return (
    <article className="card space-y-2">
      <a href={article.url} target="_blank" rel="noreferrer" className="font-semibold text-indigo-700 hover:underline">
        {article.title}
      </a>
      <p className="text-xs text-slate-500">
        {article.source} · {formatDate(article.publishedAt)}
      </p>
      {article.summary && <p className="text-sm text-slate-700">{article.summary}</p>}
      <button type="button" className="text-sm text-indigo-600 hover:underline" onClick={handleAddToNotes}>
        Add to notes
      </button>
    </article>
  );
}
