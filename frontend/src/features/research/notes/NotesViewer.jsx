import { useNotesStore } from './notesStore';

export default function NotesViewer() {
  const allNotes = useNotesStore((state) => state.notes);
  const notes = allNotes.filter((note) => note.text.trim());

  if (notes.length === 0) {
    return <p className="text-sm text-slate-500">No notes. You can add them in the Research Room.</p>;
  }

  return (
    <ul className="space-y-2">
      {notes.map((note) => (
        <li key={note.id} className="rounded-md bg-amber-50 p-3 text-sm whitespace-pre-wrap text-slate-700">
          {note.text}
        </li>
      ))}
    </ul>
  );
}
