import axios from 'axios';
import { useNotificationStore } from '@/store';

/**
 * Enterprise Axios client configured with base URL, timeout, and response interceptors.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorData = error.response?.data;
    const message =
      errorData?.error?.message ||
      errorData?.detail ||
      error.message ||
      'An unexpected API error occurred';

    // Broadcast to global notification toast system automatically
    useNotificationStore.getState().notifyError(message);

    return Promise.reject(new Error(message));
  }
);

