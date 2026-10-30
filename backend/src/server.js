import 'dotenv/config';
import express from 'express';
import { corsMiddleware } from './middleware/cors.js';
import { sessionId } from './middleware/sessionId.js';
import { ipLimiter } from './middleware/rateLimit.js';
import apiRoutes from './routes/index.js';
import { warmUpCatalogue } from './services/worldBank.service.js';

const app = express();

app.use(corsMiddleware);
app.use(express.json({ limit: '100kb' }));
app.use(sessionId);
app.use('/api', ipLimiter, apiRoutes);

app.use((req, res) => {
  res.status(404).json({ error: { message: `Route ${req.method} ${req.originalUrl} does not exist.` } });
});

app.use((err, req, res, next) => {
  console.error(`[error] ${req.method} ${req.originalUrl}:`, err.message);
  let message = 'Something went wrong on the server.';
  if (err.status === 400) message = 'The request body is not valid JSON.';
  if (err.status === 413) message = 'The request is too large.';
  res.status(err.status || 500).json({ error: { message } });
});

app.listen(process.env.PORT, () => {
  console.log(`DebateLab API listening on http://localhost:${process.env.PORT}`);
  warmUpCatalogue();
});