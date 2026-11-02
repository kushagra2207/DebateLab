import { useState } from 'react';
import { useResearchStore } from '../store/researchStore';
import { searchNews } from '../research.api';
import NewsCard from './NewsCard';

export default function NewsPanel() {
  const { newsQuery, newsFrom, newsResults, update } = useResearchStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch(event) {
    event.preventDefault();
    if (newsQuery.trim().length < 2) {
      setError('Type at least 2 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const articles = await searchNews(newsQuery.trim(), newsFrom);
      update({ newsResults: articles });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="card space-y-3">
        <p className="text-sm text-slate-600">Search recent news articles from The Guardian.</p>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div>
            <label htmlFor="newsQuery" className="label">
              What do you want to know?
            </label>
            <input
              id="newsQuery"
              className="input"
              placeholder="e.g. India solar power growth"
              value={newsQuery}
              onChange={(e) => update({ newsQuery: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="newsFrom" className="label">
              Published after (optional)
            </label>
            <input
              id="newsFrom"
              type="date"
              className="input"
              value={newsFrom}
              onChange={(e) => update({ newsFrom: e.target.value })}
            />
          </div>
        </div>
        {error && <p className="error-box">{error}</p>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Searching...' : 'Search news'}
        </button>
      </form>

      {newsResults && newsResults.length === 0 && <p className="text-sm text-slate-500">No articles found.</p>}
      {newsResults?.map((article) => (
        <NewsCard key={article.url} article={article} />
      ))}
    </div>
  );
}
