import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TooltipProvider, ToastContainer } from '@/components/ui';
import { AppShell } from '@/components/layout/AppShell';
import {
  DashboardPage,
  ProjectOverviewPage,
  MigrationPage,
  PatchReviewPage,
  ArchitecturePage,
  ReportsPage,
  SettingsPage,
} from '@/pages';
import { useUIStore } from '@/store';

export function App() {
  const { isDarkMode } = useUIStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <BrowserRouter>
      <TooltipProvider>
        <AppShell>
          <Routes>
            {/* Global Workspace Routes */}
            <Route path="/" element={<DashboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Project Scoped URL Hierarchy */}
            <Route path="/projects/:projectId" element={<ProjectOverviewPage />} />
            <Route path="/projects/:projectId/plan" element={<MigrationPage />} />
            <Route path="/projects/:projectId/patches" element={<PatchReviewPage />} />
            <Route path="/projects/:projectId/architecture" element={<ArchitecturePage />} />
            <Route path="/projects/:projectId/reports" element={<ReportsPage />} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
        <ToastContainer />
      </TooltipProvider>
    </BrowserRouter>
  );
}

export default App;
