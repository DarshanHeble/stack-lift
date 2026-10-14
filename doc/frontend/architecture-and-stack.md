# Frontend Architecture & Tech Stack

## 1. Overview & Directory Structure

The StackLift frontend is a high-performance Single Page Application (SPA) designed for clarity, interactive code review, and live build observability.

- **Framework**: React 18/19 with TypeScript.
- **Build Tool**: Vite.
- **Styling**: Tailwind CSS + Radix UI primitives.
- **Icons**: Lucide React.
- **Diff & Code Editor**: Monaco Editor (`@monaco-editor/react`).
- **Data Fetching & Caching**: TanStack Query (React Query) + Axios.
- **Routing**: React Router v6.

### Directory Layout:
```
frontend/
├── src/
│   ├── assets/                     # Logos, brand marks, and SVG icons
│   ├── components/                 # Reusable UI primitives
│   │   ├── ui/                     # Buttons, Badges, Modals, Tabs, Tooltips
│   │   ├── layout/                 # Navbar, Sidebar, PageContainer
│   │   ├── diff/                   # Monaco Diff Viewer component
│   │   ├── terminal/               # Real-time SSE Terminal Log Streamer
│   │   └── chat/                   # Iterative Revision Chat Panel
│   ├── features/                   # Feature modules
│   │   ├── projects/               # Project listing, upload modal, credential picker
│   │   ├── analysis/               # Dependency map, CVE inspector, module tree
│   │   ├── plan/                   # Step tracker, risk tags, prerequisite graph
│   │   ├── review/                 # Patch diff, approval actions, revision chat
│   │   └── report/                 # Modernization audit report, patch history timeline
│   ├── hooks/                      # Custom hooks (useSSE, useJobProgress, usePatchRevision)
│   ├── services/                   # Axios API clients & typed interfaces
│   ├── types/                      # TypeScript domain interfaces
│   ├── App.tsx                     # Top-level routes
│   └── main.tsx                    # React root mount
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 2. Design System & User Experience Principles

1. **Information Density with Hierarchy**: Use clear badges, collapsible accordions, and clean monospace views for deep dependency graphs and stack traces.
2. **Review First**: Before code changes are accepted, provide a dedicated side-by-side Monaco diff viewer with syntax highlighting and line numbers.
3. **Live Streaming Observability**: Never leave the user looking at a generic spinner during long builds; show real-time terminal output streamed via SSE.
4. **Iterative Refinement over Start-Over**: The revision chat panel lets users nudge a 95%-correct patch to 100% without regenerating from scratch.
