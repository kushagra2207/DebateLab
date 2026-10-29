import { getOpponentReply } from '../services/opponent.service.js';
import { cancelOnDisconnect } from '../utils/cancelOnDisconnect.js';

export async function debateTurnController(req, res) {
  const signal = cancelOnDisconnect(req, res);

  try {
    const { motion, side, round, totalRounds, history } = req.validated.body;
    const reply = await getOpponentReply({ motion, side, round, totalRounds, history, signal });
    res.json({ reply });
  } catch (err) {
    if (signal.aborted) return;

    console.error('[debate] turn failed:', err);
    res.status(err.status || 500).json({ error: { message: err.status ? err.message : 'Something went wrong on the server.' } });
  }
}