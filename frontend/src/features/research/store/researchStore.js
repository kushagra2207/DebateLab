import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { idbStorage } from '../research.storage';

const currentYear = new Date().getFullYear();

export const useResearchStore = create(
  persist(
    (set) => ({
      activeTab: 'world', 

      indicatorQuery: '',
      indicatorResults: null, 
      selectedIndicator: null,
      country: '',
      fromYear: currentYear - 15,
      toYear: currentYear,
      indicatorData: null,

      newsQuery: '',
      newsFrom: '',
      newsResults: null,

      update: (changes) => set(changes),
    }),
    { name: 'debatelab-research', storage: idbStorage },
  ),
);
