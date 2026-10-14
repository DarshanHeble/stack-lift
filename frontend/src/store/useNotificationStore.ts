import { create } from 'zustand';

export interface GlobalNotification {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  message: string;
}

interface NotificationState {
  notifications: GlobalNotification[];
  notify: (notification: Omit<GlobalNotification, 'id'>) => void;
  notifyError: (message: string, title?: string) => void;
  dismiss: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  notify: (notification) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }));

    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 6000);
  },

  notifyError: (message: string, title: string = 'Operation Failed') => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id, type: 'error', title, message },
      ],
    }));

    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 8000);
  },

  dismiss: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearAll: () => set({ notifications: [] }),
}));
