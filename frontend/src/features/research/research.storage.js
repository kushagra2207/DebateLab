import { createStore, get, set, del } from 'idb-keyval';
import { createJSONStorage } from 'zustand/middleware';

const appDatabase = createStore('debatelab', 'kv');

export const idbStorage = createJSONStorage(() => ({
  getItem: async (name) => (await get(name, appDatabase)) ?? null,
  setItem: (name, value) => set(name, value, appDatabase),
  removeItem: (name) => del(name, appDatabase),
}));
