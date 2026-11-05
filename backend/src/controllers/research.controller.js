import { searchIndicators, getIndicatorData, getCountries } from '../services/worldBank.service.js';
import { searchNews } from '../services/news.service.js';

export async function searchIndicatorsController(req, res) {
  try {
    const { q } = req.validated.query;
    const results = await searchIndicators(q);
    res.json({ results });
  } catch (err) {
    console.error('[research] indicator search failed:', err);
    res.status(err.status || 500).json({ error: { message: err.status ? err.message : 'Something went wrong on the server.' } });
  }
}

export async function getIndicatorDataController(req, res) {
  try {
    const { indicator, country, from, to } = req.validated.query;
    const data = await getIndicatorData({ indicatorId: indicator, country, fromYear: from, toYear: to });
    res.json(data);
  } catch (err) {
    console.error('[research] indicator data failed:', err);
    res.status(err.status || 500).json({ error: { message: err.status ? err.message : 'Something went wrong on the server.' } });
  }
}

export async function getCountriesController(req, res) {
  try {
    const countries = await getCountries();
    res.json({ countries });
  } catch (err) {
    console.error('[research] country list failed:', err);
    res.status(err.status || 500).json({ error: { message: err.status ? err.message : 'Something went wrong on the server.' } });
  }
}

export async function searchNewsController(req, res) {
  try {
    const { q, from } = req.validated.query;
    const articles = await searchNews(q, from);
    res.json({ articles });
  } catch (err) {
    console.error('[research] news search failed:', err);
    res.status(err.status || 500).json({ error: { message: err.status ? err.message : 'Something went wrong on the server.' } });
  }
}