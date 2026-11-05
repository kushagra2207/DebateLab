import { clear, createStore, entries, setMany } from 'idb-keyval';

// Shared IndexedDB store used across features
const appDatabase = createStore('debatelab', 'kv');

const EXPORT_VERSION = 1;
const KEY_PREFIX = 'debatelab-';

// Export all persisted stores as a JSON backup
export async function exportData() {
  const allEntries = await entries(appDatabase);
  const data = {};
  for (const [key, value] of allEntries) {
    data[key] = JSON.parse(value);
  }

  const file = { app: 'debatelab', version: EXPORT_VERSION, exportedAt: new Date().toISOString(), data };
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `debatelab-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// Restore data from backup file
export async function importData(file) {
  let parsed;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new Error('This file is not valid JSON.');
  }

  if (parsed?.app !== 'debatelab' || typeof parsed.data !== 'object' || parsed.data === null) {
    throw new Error('This is not a DebateLab backup file.');
  }
  if (parsed.version > EXPORT_VERSION) {
    throw new Error('This backup was made by a newer version of DebateLab.');
  }

  const newEntries = Object.entries(parsed.data)
    .filter(([key]) => key.startsWith(KEY_PREFIX))
    .map(([key, value]) => [key, JSON.stringify(value)]);

  await clear(appDatabase);
  await setMany(newEntries, appDatabase);
}

// Clear all local app data from IndexedDB and localStorage
export async function clearAllData() {
  await clear(appDatabase);
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith('debatelab:'))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    // localStorage may be blocked; nothing to clear then
  }
}
