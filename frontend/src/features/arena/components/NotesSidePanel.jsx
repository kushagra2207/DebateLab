import { NotesViewer } from '../../research';

export default function NotesSidePanel() {
  return (
    <details open className="card">
      <summary className="cursor-pointer font-semibold">Your notes</summary>
      <div className="mt-3 max-h-[60vh] overflow-y-auto">
        <NotesViewer />
      </div>
    </details>
  );
}
