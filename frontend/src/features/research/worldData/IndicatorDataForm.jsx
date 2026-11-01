import { useEffect, useState } from 'react';
import { useResearchStore } from '../store/researchStore';
import { getCountries, getIndicatorData } from '../research.api';

const currentYear = new Date().getFullYear();

export default function IndicatorDataForm() {
  const { selectedIndicator, country, fromYear, toYear, update } = useResearchStore();
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getCountries()
      .then(setCountries)
      .catch(() => setCountries([]));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (country.trim().length < 2) {
      setError('Enter a country or region.');
      return;
    }
    if (Number(fromYear) > Number(toYear)) {
      setError('"From" year must not be after "To" year.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await getIndicatorData({
        indicator: selectedIndicator.id,
        country: country.trim(),
        from: fromYear,
        to: toYear,
      });
      update({ indicatorData: data });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-3">
      <h3 className="font-semibold">2. Choose a country and years</h3>
      <p className="text-sm text-slate-600">
        Indicator: <span className="font-medium">{selectedIndicator.name}</span>
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="country" className="label">
            Country or region
          </label>
          <input
            id="country"
            className="input"
            list="country-options"
            placeholder="e.g. India or World"
            value={country}
            onChange={(e) => update({ country: e.target.value })}
          />
          <datalist id="country-options">
            {countries.map((c) => (
              <option key={c.code} value={c.name} />
            ))}
          </datalist>
        </div>
        <div>
          <label htmlFor="fromYear" className="label">
            From
          </label>
          <input
            id="fromYear"
            type="number"
            className="input"
            min={1960}
            max={currentYear}
            value={fromYear}
            onChange={(e) => update({ fromYear: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="toYear" className="label">
            To
          </label>
          <input
            id="toYear"
            type="number"
            className="input"
            min={1960}
            max={currentYear}
            value={toYear}
            onChange={(e) => update({ toYear: e.target.value })}
          />
        </div>
      </div>

      {error && <p className="error-box">{error}</p>}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Loading...' : 'Get data'}
      </button>
    </form>
  );
}
