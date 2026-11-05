import { isCatalogueLoaded } from '../services/worldBank.service.js';

export function getHealth(req, res) {
  res.json({
    status: 'ok',
    aiConfigured: Boolean(process.env.GROQ_API_KEY),
    newsConfigured: Boolean(process.env.GUARDIAN_API_KEY),
    indicatorCatalogueLoaded: isCatalogueLoaded(),
  });
}