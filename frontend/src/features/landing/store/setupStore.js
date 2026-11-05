import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { idbStorage } from '../landing.storage';

export const ROUND_OPTIONS = [3, 4, 5, 6];
export const MINUTE_OPTIONS = [2, 3, 4, 5];
export const MOTION_MIN = 10;
export const MOTION_MAX = 300;

export const useSetupStore = create(
  persist(
    (set) => ({
      topic: '',
      motion: '',
      side: 'for', // 'for' | 'against'
      totalRounds: 4,
      roundMinutes: 3,
      locked: false, // set to true once debate starts

      // Ignore updates if a debate is currently active
      updateSetup: (changes) => set((state) => (state.locked ? {} : changes)),
      lockSetup: () => set({ locked: true }),
      unlockSetup: () => set({ locked: false }),
    }),
    { name: 'debatelab-setup', storage: idbStorage },
  ),
);
