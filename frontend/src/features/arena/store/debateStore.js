import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { idbStorage } from '../arena.storage';
import { useSetupStore } from '../../landing';
import { useNotesStore } from '../../research';
import { useArchiveStore } from '../../debrief';
import { requestOpponentReply } from '../arena.api';

export const MAX_ARGUMENT_LENGTH = 2000;
export const PASS_TEXT = '(No argument was submitted this round.)';
const MIN_TIME_AFTER_ERROR_MS = 30 * 1000;

const initialDebate = {
  status: 'idle',
  round: 1,
  turns: [], 
  deadline: null, 
  remainingMs: null,
  draft: '', 
};

const roundLengthMs = () => useSetupStore.getState().roundMinutes * 60 * 1000;

export function isUsersTurn(turns, side) {
  if (turns.length === 0) return side === 'for';
  return turns[turns.length - 1].role === 'opponent';
}

export const useDebateStore = create(
  persist(
    (set, get) => ({
      ...initialDebate,
      waiting: false,
      pendingText: '',
      error: '',

      setDraft: (draft) => set({ draft: draft.slice(0, MAX_ARGUMENT_LENGTH) }),
      clearError: () => set({ error: '' }),

      startDebate: () => {
        if (get().status !== 'idle') return;
        const { side } = useSetupStore.getState();
        set({
          ...initialDebate,
          status: 'active',
          deadline: side === 'for' ? Date.now() + roundLengthMs() : null,
        });
        if (side === 'against') get().requestOpening();
      },

      requestOpening: async () => {
        const { status, waiting, turns } = get();
        if (status !== 'active' || waiting || turns.length > 0) return;

        const { motion, side, totalRounds } = useSetupStore.getState();
        set({ waiting: true, error: '' });
        try {
          const reply = await requestOpponentReply({ motion, side, round: 1, totalRounds, history: [] });
          set({ turns: [{ role: 'opponent', text: reply }], waiting: false, deadline: Date.now() + roundLengthMs() });
        } catch (err) {
          set({ waiting: false, error: err.message });
        }
      },

      sendArgument: async (text) => {
        const { status, waiting, turns, round, deadline } = get();
        const { motion, side, totalRounds } = useSetupStore.getState();
        if (status !== 'active' || waiting || !isUsersTurn(turns, side)) return;

        const argument = text.trim().slice(0, MAX_ARGUMENT_LENGTH) || PASS_TEXT;
        const timeLeft = deadline ? Math.max(0, deadline - Date.now()) : roundLengthMs();

        set({ waiting: true, pendingText: argument, error: '', deadline: null, remainingMs: timeLeft });

        try {
          const history = [...turns, { role: 'user', text: argument }];
          const reply = await requestOpponentReply({ motion, side, round, totalRounds, history });

          const newTurns = [...history, { role: 'opponent', text: reply }];
          const isLastRound = round >= totalRounds;
          set({
            turns: newTurns,
            status: isLastRound ? 'finished' : 'active',
            round: isLastRound ? round : round + 1,
            deadline: isLastRound ? null : Date.now() + roundLengthMs(),
            remainingMs: null,
            draft: '',
            waiting: false,
            pendingText: '',
          });
        } catch (err) {
          set({
            waiting: false,
            pendingText: '',
            error: err.message,
            deadline: Date.now() + Math.max(timeLeft, MIN_TIME_AFTER_ERROR_MS),
            remainingMs: null,
          });
        }
      },

     
      resume: () => {
        const { status, waiting, deadline, remainingMs, turns } = get();
        if (status !== 'active' || waiting) return;
        const { side } = useSetupStore.getState();

        if (turns.length === 0 && side === 'against') {
          get().requestOpening();
        } else if (!deadline && isUsersTurn(turns, side)) {
          set({ deadline: Date.now() + (remainingMs ?? roundLengthMs()), remainingMs: null });
        }
      },

      endEarly: () => {
        if (get().waiting) return;
        set({ status: 'finished', deadline: null, remainingMs: null });
      },

      
      archiveDebate: () => {
        const { turns } = get();
        const { topic, motion, side } = useSetupStore.getState();
        const notes = useNotesStore
          .getState()
          .notes.map((note) => note.text.trim())
          .filter(Boolean);

        const id = useArchiveStore.getState().saveFinishedDebate({ topic, motion, side, transcript: turns, notes });
        get().resetDebate();
        return id;
      },

      resetDebate: () => {
        set({ ...initialDebate, waiting: false, pendingText: '', error: '' });
        useSetupStore.getState().unlockSetup();
      },
    }),
    {
      name: 'debatelab-debate',
      storage: idbStorage,
      partialize: (state) => ({
        status: state.status,
        round: state.round,
        turns: state.turns,
        deadline: state.deadline,
        remainingMs: state.remainingMs,
        draft: state.draft,
      }),
    },
  ),
);
