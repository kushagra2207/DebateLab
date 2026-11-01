import { useState } from 'react';
import { useResearchStore } from '../store/researchStore';
import { searchIndicators } from '../research.api';

export default function IndicatorSearch() {
  const { indicatorQuery, indicatorResults, selectedIndicator, update } = useResearchStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch(event) {
    event.preventDefault();
    if (indicatorQuery.trim().length < 2) {
      setError('Type at least 2 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const results = await searchIndicators(indicatorQuery.trim());
      update({ indicatorResults: results });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card space-y-3">
      <h3 className="font-semibold">1. Find an indicator</h3>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          className="input"
          placeholder='e.g. "unemployment", "forest area", "CO2 emissions"'
          value={indicatorQuery}
          onChange={(e) => update({ indicatorQuery: e.target.value })}
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      {loading && <p className="text-xs text-slate-500">The first search after the server starts can take a few seconds.</p>}
      {error && <p className="error-box">{error}</p>}

      {indicatorResults && indicatorResults.length === 0 && (
        <p className="text-sm text-slate-500">No indicators found. Try other keywords.</p>
      )}

      {indicatorResults && indicatorResults.length > 0 && (
        <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto rounded-md border border-slate-200">
          {indicatorResults.map((indicator) => {
            const isSelected = selectedIndicator?.id === indicator.id;
            return (
              <li key={indicator.id}>
                <button
                  type="button"
                  className={`w-full p-3 text-left hover:bg-slate-50 ${isSelected ? 'bg-indigo-50' : ''}`}
                  onClick={() => update({ selectedIndicator: indicator, indicatorData: null })}
                >
                  <p className="text-sm font-medium">{indicator.name}</p>
                  <p className="text-xs text-slate-500">
                    {indicator.id} · {indicator.source}
                  </p>
                  {indicator.description && <p className="mt-1 line-clamp-2 text-xs text-slate-600">{indicator.description}</p>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
