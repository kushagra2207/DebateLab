import { useNotesStore, MAX_NOTES, MAX_NOTE_LENGTH } from './notesStore';

export default function NotesEditor() {
  const { notes, addNote, updateNote, deleteNote } = useNotesStore();

  function handleDelete(id) {
    if (window.confirm('Delete this note?')) deleteNote(id);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Write down arguments, facts and rebuttals you want to use. You can read them (but not edit them) during
          the debate. Notes are saved automatically.
        </p>
        <button type="button" className="btn-primary shrink-0" onClick={() => addNote()} disabled={notes.length >= MAX_NOTES}>
          Add note
        </button>
      </div>

      {notes.length === 0 && <p className="text-sm text-slate-500">No notes yet.</p>}

      {notes.map((note, index) => (
        <div key={note.id} className="card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Note {index + 1}</span>
            <button type="button" className="text-sm text-red-600 hover:underline" onClick={() => handleDelete(note.id)}>
              Delete
            </button>
          </div>
          <textarea
            className="input"
            rows={3}
            maxLength={MAX_NOTE_LENGTH}
            placeholder="Write your point here..."
            value={note.text}
            onChange={(e) => updateNote(note.id, e.target.value)}
          />
        </div>
      ))}

      {notes.length >= MAX_NOTES && <p className="text-sm text-slate-500">You have reached the limit of {MAX_NOTES} notes.</p>}
    </div>
  );
}
