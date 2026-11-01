import { useRef } from 'react';
import { clearAllData, exportData, importData } from './dataTransfer';

export default function DataMenu() {
  const fileInputRef = useRef(null);

  async function handleExport() {
    try {
      await exportData();
    } catch {
      window.alert('Could not export your data.');
    }
  }

  async function handleImportFile(event) {
    const file = event.target.files?.[0];
    event.target.value = ''; // Reset file input so the same file can be re-selected
    if (!file) return;
    if (!window.confirm('Importing replaces ALL your current data (debates, notes, reports). Continue?')) return;

    try {
      await importData(file);
      window.location.reload();
    } catch (err) {
      window.alert(err.message);
    }
  }

  async function handleClear() {
    if (!window.confirm('Delete ALL your DebateLab data (debates, notes, reports)? This cannot be undone.')) return;
    try {
      await clearAllData();
      window.location.assign('/');
    } catch {
      window.alert('Could not clear your data.');
    }
  }

  return (
    <details className="relative">
      <summary className="cursor-pointer list-none rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
        Data ▾
      </summary>
      <div className="absolute right-0 z-10 mt-1 flex w-48 flex-col rounded-md border border-slate-200 bg-white p-1 shadow-lg">
        <button type="button" className="rounded px-3 py-2 text-left text-sm hover:bg-slate-100" onClick={handleExport}>
          Export data
        </button>
        <button
          type="button"
          className="rounded px-3 py-2 text-left text-sm hover:bg-slate-100"
          onClick={() => fileInputRef.current?.click()}
        >
          Import data
        </button>
        <button type="button" className="rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50" onClick={handleClear}>
          Clear all data
        </button>
        <input ref={fileInputRef} type="file" accept="application/json,.json" className="hidden" onChange={handleImportFile} />
      </div>
    </details>
  );
}
