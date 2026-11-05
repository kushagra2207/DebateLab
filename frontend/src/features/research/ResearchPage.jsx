import { useEffect } from 'react';
import { useSetupStore } from '../landing';
import { useResearchStore } from './store/researchStore';
import { useNotesStore } from './notes/notesStore';
import WorldDataPanel from './worldData/WorldDataPanel';
import NewsPanel from './news/NewsPanel';
import NotesEditor from './notes/NotesEditor';

export default function ResearchPage() {
  const activeTab = useResearchStore((state) => state.activeTab);
  const update = useResearchStore((state) => state.update);
  const noteCount = useNotesStore((state) => state.notes.length);
  const motion = useSetupStore((state) => state.motion);

  useEffect(() => {
    const topic = useSetupStore.getState().topic.trim();
    const { indicatorQuery, newsQuery } = useResearchStore.getState();
    if (topic && !indicatorQuery && !newsQuery) {
      useResearchStore.getState().update({ indicatorQuery: topic, newsQuery: topic });
    }
  }, []);

  const tabs = [
    { id: 'world', label: 'World data' },
    { id: 'news', label: 'News' },
    { id: 'notes', label: `Notes (${noteCount})` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Research Room</h1>
        {motion.trim() && (
          <p className="mt-1 text-slate-600">
            Preparing for: <span className="font-medium">{motion}</span>
          </p>
        )}
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => update({ activeTab: tab.id })}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
              activeTab === tab.id ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'world' && <WorldDataPanel />}
      {activeTab === 'news' && <NewsPanel />}
      {activeTab === 'notes' && <NotesEditor />}
    </div>
  );
}
