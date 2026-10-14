import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ActiveView =
  | 'dashboard'
  | 'overview'
  | 'review'
  | 'architecture'
  | 'migration'
  | 'reports'
  | 'settings';

interface UIState {
  activeView: ActiveView;
  isDarkMode: boolean;
  selectedProjectId: string | null;
  activeJobId: string | null;
  activeStepId: string | null;
  sidebarWidth: number;
  isSidebarCollapsed: boolean;
  setActiveView: (view: ActiveView) => void;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
  setSelectedProjectId: (id: string | null) => void;
  setActiveJobId: (id: string | null) => void;
  setActiveStepId: (id: string | null) => void;
  setSidebarWidth: (width: number) => void;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activeView: 'dashboard',
      isDarkMode: true,
      selectedProjectId: null,
      activeJobId: null,
      activeStepId: null,
      sidebarWidth: 260,
      isSidebarCollapsed: false,

      setActiveView: (view) => set({ activeView: view }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setDarkMode: (dark) => set({ isDarkMode: dark }),
      setSelectedProjectId: (id) => set({ selectedProjectId: id }),
      setActiveJobId: (id) => set({ activeJobId: id }),
      setActiveStepId: (id) => set({ activeStepId: id }),
      setSidebarWidth: (width) => set({ sidebarWidth: Math.max(200, Math.min(420, width)) }),
      toggleSidebarCollapsed: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
    }),
    {
      name: 'stacklift-ui-theme',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        sidebarWidth: state.sidebarWidth,
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
    }
  )
);
