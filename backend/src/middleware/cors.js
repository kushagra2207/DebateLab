import cors from 'cors';

export const corsMiddleware = cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-Session-Id'],
});