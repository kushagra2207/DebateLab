import { useResearchStore } from '../store/researchStore';
import { useNotesStore } from '../notes/notesStore';

function formatValue(value) {
  return value === null ? '—' : value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function DataTable() {
  const data = useResearchStore((state) => state.indicatorData);
  const addNote = useNotesStore((state) => state.addNote);

  if (!data) return null;

  const rows = [...data.values].reverse();
  const latest = rows.find((row) => row.value !== null);

  function handleAddToNotes() {
    addNote(`${data.indicator.name}, ${data.country.name}: ${formatValue(latest.value)} in ${latest.year} (World Bank)`);
    window.alert('Added to your notes.');
  }

  return (
    <div className="card space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold">{data.indicator.name}</h3>
          <p className="text-sm text-slate-500">
            {data.country.name} · {data.fromYear}–{data.toYear}
            {data.indicator.source && ` · ${data.indicator.source}`}
          </p>
        </div>
        {latest && (
          <button type="button" className="btn-secondary" onClick={handleAddToNotes}>
            Add latest value to notes
          </button>
        )}
      </div>

      {data.indicator.description && <p className="text-sm text-slate-600">{data.indicator.description}</p>}

      {!data.available ? (
        <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">{data.message}</p>
      ) : (
        <table className="w-full max-w-md text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className="py-2">Year</th>
              <th className="py-2 text-right">Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.year} className="border-b border-slate-100">
                <td className="py-1.5">{row.year}</td>
                <td className={`py-1.5 text-right ${row.value === null ? 'text-slate-400' : ''}`}>
                  {row.value === null ? 'No data' : formatValue(row.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
