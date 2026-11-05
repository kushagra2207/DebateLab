import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { idbStorage } from '../debrief.storage';
import { requestDebrief } from '../debrief.api';

const MAX_SAVED_DEBATES = 20; // Bound storage usage in IndexedDB
const reportsInProgress = new Set(); // Deduplicate concurrent report requests

export const useArchiveStore = create(
  persist(
    (set, get) => ({
      debates: [],

      saveFinishedDebate: ({ topic, motion, side, transcript, notes }) => {
        const id = crypto.randomUUID();
        const debate = {
          id,
          createdAt: Date.now(),
          topic,
          motion,
          side,
          transcript,
          notes,
          status: 'pending', // 'pending' | 'done' | 'error'
          report: null,
          complete: false,
          error: null,
        };
        set((state) => ({ debates: [debate, ...state.debates].slice(0, MAX_SAVED_DEBATES) }));
        return id;
      },

      updateDebate: (id, changes) =>
        set((state) => ({
          debates: state.debates.map((debate) => (debate.id === id ? { ...debate, ...changes } : debate)),
        })),

      deleteDebate: (id) => set((state) => ({ debates: state.debates.filter((debate) => debate.id !== id) })),

      generateReport: async (id) => {
        const debate = get().debates.find((d) => d.id === id);
        if (!debate || reportsInProgress.has(id)) return;

        reportsInProgress.add(id);
        get().updateDebate(id, { status: 'pending', error: null });
        try {
          const { report, complete } = await requestDebrief({
            motion: debate.motion,
            side: debate.side,
            transcript: debate.transcript,
            notes: debate.notes,
          });
          get().updateDebate(id, { status: 'done', report, complete });
        } catch (err) {
          get().updateDebate(id, { status: 'error', error: err.message });
        } finally {
          reportsInProgress.delete(id);
        }
      },
    }),
    { name: 'debatelab-archive', storage: idbStorage },
  ),
);
