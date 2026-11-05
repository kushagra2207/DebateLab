import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { idbStorage } from '../research.storage';

export const MAX_NOTES = 50;
export const MAX_NOTE_LENGTH = 2000;

export const useNotesStore = create(
  persist(
    (set) => ({
      notes: [], 

      addNote: (text = '') =>
        set((state) => {
          if (state.notes.length >= MAX_NOTES) return {};
          const note = { id: crypto.randomUUID(), text: text.slice(0, MAX_NOTE_LENGTH), createdAt: Date.now() };
          return { notes: [...state.notes, note] };
        }),

      updateNote: (id, text) =>
        set((state) => ({
          notes: state.notes.map((note) => (note.id === id ? { ...note, text: text.slice(0, MAX_NOTE_LENGTH) } : note)),
        })),

      deleteNote: (id) => set((state) => ({ notes: state.notes.filter((note) => note.id !== id) })),
    }),
    { name: 'debatelab-notes', storage: idbStorage },
  ),
);
