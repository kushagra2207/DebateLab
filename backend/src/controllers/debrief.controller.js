import { generateDebrief } from '../services/coach.service.js';
import { cancelOnDisconnect } from '../utils/cancelOnDisconnect.js';

export async function debriefController(req, res) {
  const signal = cancelOnDisconnect(req, res);

  try {
    const { motion, side, transcript, notes } = req.validated.body;
    const { report, complete } = await generateDebrief({ motion, side, transcript, notes, signal });
    res.json({ report, complete });
  } catch (err) {
    if (signal.aborted) return;

    console.error('[debrief] report failed:', err);
    res.status(err.status || 500).json({ error: { message: err.status ? err.message : 'Something went wrong on the server.' } });
  }
}