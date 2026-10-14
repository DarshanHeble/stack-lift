import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import './index.css';
import App from './App.tsx';
import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary';
import { useNotificationStore } from '@/store';

// Centralized Query & Mutation Error Handling across all components
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      useNotificationStore.getState().notifyError(error.message, 'Query Error');
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      useNotificationStore.getState().notifyError(error.message, 'Action Failed');
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </GlobalErrorBoundary>
  </StrictMode>,
);

