import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Layers,
  Search,
  ListTodo,
  Code,
  Network,
  FileText,
  Settings as SettingsIcon,
  Sun,
  Moon,
  ChevronsUpDown,
  Check,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import {
  Button,
  Logo,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Tooltip,
} from '@/components/ui';
import { useUIStore } from '@/store';
import { useProjectsQuery } from '@/hooks/queries';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isDarkMode,
    selectedProjectId,
    sidebarWidth,
    isSidebarCollapsed,
    toggleDarkMode,
    setSelectedProjectId,
    setSidebarWidth,
    toggleSidebarCollapsed,
  } = useUIStore();

  const { data: serverProjects } = useProjectsQuery();
  const projects = serverProjects || [];
  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0] || null;

  // Resizable drag handle state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(sidebarWidth);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const currentX = e.clientX;
      
      // If dragged below 150px, collapse to compact mode
      if (currentX < 150) {
        if (!useUIStore.getState().isSidebarCollapsed) {
          useUIStore.getState().setSidebarCollapsed(true);
        }
      } else {
        // Dragged past 180px, ensure it is expanded and clamp between 220px and 440px
        if (useUIStore.getState().isSidebarCollapsed) {
          useUIStore.getState().setSidebarCollapsed(false);
        }
        const delta = currentX - startX.current;
        const newWidth = Math.max(220, Math.min(440, startWidth.current + delta));
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        setIsResizing(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [setSidebarWidth]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = isSidebarCollapsed ? 76 : sidebarWidth;
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    if (location.pathname.startsWith('/projects/')) {
      const parts = location.pathname.split('/');
      const section = parts[3] ? `/${parts[3]}` : '';
      navigate(`/projects/${projectId}${section}`);
    } else {
      navigate(`/projects/${projectId}`);
    }
  };

  const getProjectRoute = (subpath: string) => {
    if (!currentProject) return '/projects';
    return `/projects/${currentProject.id}${subpath ? `/${subpath}` : ''}`;
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--surface-canvas)] text-[var(--text-primary)] transition-colors">
      {/* Sidebar Container */}
      <aside
        style={{ width: isSidebarCollapsed ? 72 : sidebarWidth }}
        className={`relative flex flex-col justify-between border-r border-[var(--border-default)] bg-[var(--surface-card)] ${
          isSidebarCollapsed ? 'px-2 py-3 items-center' : 'p-3'
        } select-none shrink-0 transition-[width] ${
          isResizing ? 'transition-none' : 'duration-200 ease-in-out'
        }`}
      >
        <div className="w-full space-y-4">
          {/* Header & Brand Logo */}
          {isSidebarCollapsed ? (
            <div className="flex flex-col items-center gap-2 pb-1">
              <Tooltip content="StackLift Home">
                <div
                  onClick={() => navigate('/')}
                  className="cursor-pointer group flex items-center justify-center p-1 rounded-[var(--radius-md)] hover:bg-[var(--surface-hover)] transition-colors"
                >
                  <Logo size={28} className="transition-transform group-hover:scale-105" />
                </div>
              </Tooltip>
              <Tooltip content="Expand Sidebar">
                <button
                  onClick={toggleSidebarCollapsed}
                  className="h-7 w-7 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                >
                  <PanelLeft className="h-4 w-4" />
                </button>
              </Tooltip>
            </div>
          ) : (
            <div className="flex items-center justify-between px-1.5 py-1">
              <div
                onClick={() => navigate('/')}
                className="flex items-center gap-2.5 cursor-pointer group min-w-0"
              >
                <Logo size={32} className="transition-transform group-hover:scale-105 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-[15px] tracking-tight text-[var(--text-primary)] truncate">
                    StackLift
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] tracking-tight truncate">
                    Modernization Studio
                  </span>
                </div>
              </div>

              {/* Collapse Toggle Button */}
              <Tooltip content="Collapse Sidebar (Compact)">
                <button
                  onClick={toggleSidebarCollapsed}
                  className="h-7 w-7 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer shrink-0"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              </Tooltip>
            </div>
          )}

          {/* Everbee-inspired Project Switcher Card */}
          {!isSidebarCollapsed ? (
            <div className="px-0.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full flex items-center justify-between gap-2.5 p-2 rounded-[var(--radius-lg)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] transition-all cursor-pointer text-left group shadow-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Avatar / Icon badge */}
                      <div className="h-8 w-8 rounded-[var(--radius-md)] bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/30 text-[var(--brand-primary)] flex items-center justify-center shrink-0 font-bold text-xs">
                        {currentProject ? currentProject.name.slice(0, 2).toUpperCase() : 'SL'}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                          {currentProject ? currentProject.name : 'Select Project'}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] truncate flex items-center gap-1 font-mono">
                          {currentProject?.default_branch || 'main'} • {currentProject?.repo_source || 'No Repo'}
                        </span>
                      </div>
                    </div>
                    <ChevronsUpDown className="h-3.5 w-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 max-h-72 overflow-y-auto">
                  <div className="px-2.5 py-1.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]">
                    Active Modernization Target
                  </div>
                  {projects.map((p) => {
                    const isSelected = currentProject?.id === p.id;
                    return (
                      <DropdownMenuItem
                        key={p.id}
                        onClick={() => handleSelectProject(p.id)}
                        className={`flex items-center justify-between gap-2 py-2 px-2.5 cursor-pointer ${
                          isSelected ? 'bg-[var(--surface-subtle)] text-[var(--text-primary)] font-semibold' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-6 w-6 rounded bg-[var(--surface-card)] border border-[var(--border-default)] flex items-center justify-center text-[10px] font-bold text-[var(--text-secondary)] shrink-0">
                            {p.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs truncate">{p.name}</span>
                            <span className="text-[10px] text-[var(--text-muted)] truncate font-mono">
                              {p.default_branch} • {p.repo_source}
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 text-[var(--brand-primary)] shrink-0" />}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            /* Compact Mode Avatar Tooltip */
            <div className="flex justify-center">
              <Tooltip content={currentProject ? currentProject.name : 'Select Project'}>
                <div className="h-9 w-9 rounded-[var(--radius-md)] bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/30 text-[var(--brand-primary)] flex items-center justify-center font-bold text-xs cursor-pointer hover:scale-105 transition-transform">
                  {currentProject ? currentProject.name.slice(0, 2).toUpperCase() : 'SL'}
                </div>
              </Tooltip>
            </div>
          )}

          {/* Navigation Links (Everbee Clean SaaS Aesthetic) */}
          <nav className="space-y-4 pt-1">
            {/* Main Section */}
            <div className="space-y-1">
              {!isSidebarCollapsed && (
                <span className="px-2.5 text-[10px] font-bold tracking-wider uppercase text-[var(--text-muted)]">
                  Workspace
                </span>
              )}
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-2.5 py-2 rounded-[var(--radius-lg)] text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[var(--surface-subtle)] text-[var(--text-primary)] font-semibold shadow-xs'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                  } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`
                }
              >
                <Tooltip content={isSidebarCollapsed ? 'Workspace Overview' : ''}>
                  <div className="flex items-center gap-3">
                    <Layers className="h-4 w-4 shrink-0" />
                    {!isSidebarCollapsed && <span>Overview</span>}
                  </div>
                </Tooltip>
              </NavLink>

              <NavLink
                to={getProjectRoute('')}
                end
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-2.5 py-2 rounded-[var(--radius-lg)] text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[var(--surface-subtle)] text-[var(--text-primary)] font-semibold shadow-xs'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                  } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`
                }
              >
                <Tooltip content={isSidebarCollapsed ? 'Diagnostics & AST Findings' : ''}>
                  <div className="flex items-center gap-3">
                    <Search className="h-4 w-4 shrink-0" />
                    {!isSidebarCollapsed && <span>Diagnostics</span>}
                  </div>
                </Tooltip>
              </NavLink>
            </div>

            {/* Engineering Modernization Tools */}
            <div className="space-y-1">
              {!isSidebarCollapsed && (
                <span className="px-2.5 text-[10px] font-bold tracking-wider uppercase text-[var(--text-muted)]">
                  Modernization Tools
                </span>
              )}
              <NavLink
                to={getProjectRoute('plan')}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-2.5 py-2 rounded-[var(--radius-lg)] text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[var(--surface-subtle)] text-[var(--text-primary)] font-semibold shadow-xs'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                  } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`
                }
              >
                <Tooltip content={isSidebarCollapsed ? 'Migration Plans' : ''}>
                  <div className="flex items-center gap-3">
                    <ListTodo className="h-4 w-4 shrink-0" />
                    {!isSidebarCollapsed && <span>Migration Plans</span>}
                  </div>
                </Tooltip>
              </NavLink>

              <NavLink
                to={getProjectRoute('patches')}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-2.5 py-2 rounded-[var(--radius-lg)] text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[var(--surface-subtle)] text-[var(--text-primary)] font-semibold shadow-xs'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                  } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`
                }
              >
                <Tooltip content={isSidebarCollapsed ? 'Monaco Patch Review' : ''}>
                  <div className="flex items-center gap-3">
                    <Code className="h-4 w-4 shrink-0" />
                    {!isSidebarCollapsed && <span>Patch Review</span>}
                  </div>
                </Tooltip>
              </NavLink>

              <NavLink
                to={getProjectRoute('architecture')}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-2.5 py-2 rounded-[var(--radius-lg)] text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[var(--surface-subtle)] text-[var(--text-primary)] font-semibold shadow-xs'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                  } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`
                }
              >
                <Tooltip content={isSidebarCollapsed ? 'Architecture Graph' : ''}>
                  <div className="flex items-center gap-3">
                    <Network className="h-4 w-4 shrink-0" />
                    {!isSidebarCollapsed && <span>Architecture Graph</span>}
                  </div>
                </Tooltip>
              </NavLink>
            </div>

            {/* Verification & Compliance */}
            <div className="space-y-1">
              {!isSidebarCollapsed && (
                <span className="px-2.5 text-[10px] font-bold tracking-wider uppercase text-[var(--text-muted)]">
                  Verification & Audit
                </span>
              )}
              <NavLink
                to={getProjectRoute('reports')}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-2.5 py-2 rounded-[var(--radius-lg)] text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[var(--surface-subtle)] text-[var(--text-primary)] font-semibold shadow-xs'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                  } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`
                }
              >
                <Tooltip content={isSidebarCollapsed ? 'Audit Reports' : ''}>
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 shrink-0" />
                    {!isSidebarCollapsed && <span>Audit Reports</span>}
                  </div>
                </Tooltip>
              </NavLink>

              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-2.5 py-2 rounded-[var(--radius-lg)] text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[var(--surface-subtle)] text-[var(--text-primary)] font-semibold shadow-xs'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                  } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`
                }
              >
                <Tooltip content={isSidebarCollapsed ? 'Settings & Security' : ''}>
                  <div className="flex items-center gap-3">
                    <SettingsIcon className="h-4 w-4 shrink-0" />
                    {!isSidebarCollapsed && <span>Settings & Security</span>}
                  </div>
                </Tooltip>
              </NavLink>
            </div>
          </nav>
        </div>

        {/* Bottom Section: Quota Card (Like Everbee 'Product Analytics 4/10') & Theme Switcher */}
        <div className="space-y-3 pt-3 border-t border-[var(--border-subtle)]">
          {!isSidebarCollapsed && (
            <div className="rounded-[var(--radius-lg)] bg-[var(--surface-subtle)] p-3 border border-[var(--border-default)] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--text-primary)]">Sandbox Quota</span>
                <span className="font-mono text-[var(--brand-primary)] font-bold">1 / 4 Active</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[var(--border-default)] overflow-hidden">
                <div className="h-full bg-[var(--brand-primary)] rounded-full w-1/4 transition-all" />
              </div>
              <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-0.5">
                <span>Network: Isolated</span>
                <span className="text-[var(--status-success-dot)] font-semibold">● Ready</span>
              </div>
            </div>
          )}

          {/* Theme switcher */}
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between px-1'}`}>
            {!isSidebarCollapsed && <span className="text-xs font-medium text-[var(--text-muted)]">Appearance</span>}
            <Tooltip content={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <Button
                variant="ghost"
                size="sm"
                icon={isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                onClick={toggleDarkMode}
              >
                {!isSidebarCollapsed && (isDarkMode ? 'Light' : 'Dark')}
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Resizable Width Drag Handle on right border (drag to expand/collapse/resize) */}
        <div
          onMouseDown={handleMouseDown}
          className={`absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-[var(--brand-primary)]/50 transition-colors z-20 ${
            isResizing ? 'bg-[var(--brand-primary)]' : 'bg-transparent'
          }`}
          title="Drag to adjust width or collapse/expand sidebar"
        />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};
