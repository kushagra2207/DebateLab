import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { LandingPage } from '../features/landing';
import { ResearchPage } from '../features/research';
import { ArenaPage } from '../features/arena';
import { DebriefPage, PastDebatesPage } from '../features/debrief';
import HydrationGate from './HydrationGate';
import Layout from './Layout';

export default function App() {
  return (
    <BrowserRouter>
      <HydrationGate>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="research" element={<ResearchPage />} />
            <Route path="arena" element={<ArenaPage />} />
            <Route path="debriefs" element={<PastDebatesPage />} />
            <Route path="debrief/:id" element={<DebriefPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HydrationGate>
    </BrowserRouter>
  );
}
