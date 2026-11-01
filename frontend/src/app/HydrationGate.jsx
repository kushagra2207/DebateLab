import { useEffect, useState } from 'react';
import { useSetupStore } from '../features/landing';
import { useNotesStore, useResearchStore } from '../features/research';
import { useDebateStore } from '../features/arena';
import { useArchiveStore } from '../features/debrief';

// Persisted stores requiring IndexedDB hydration
const persistedStores = [useSetupStore, useNotesStore, useResearchStore, useDebateStore, useArchiveStore];

function waitUntilRestored(store) {
  return new Promise((resolve) => {
    if (store.persist.hasHydrated()) {
      resolve();
      return;
    }
    const unsubscribe = store.persist.onFinishHydration(() => {
      unsubscribe();
      resolve();
    });
  });
}

// Block render until persisted stores are hydrated from IndexedDB
export default function HydrationGate({ children }) {
  const [ready, setReady] = useState(() => persistedStores.every((store) => store.persist.hasHydrated()));

  useEffect(() => {
    if (ready) return;
    Promise.all(persistedStores.map(waitUntilRestored)).then(() => setReady(true));
  }, [ready]);

  if (!ready) {
    return <p className="p-8 text-center text-slate-500">Loading your data...</p>;
  }
  return children;
}
