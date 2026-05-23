import { create } from "zustand";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "task_created" | "task_completed" | "goal_set" | "info";
  read: boolean;
  createdAt: string;
}

interface NotificationStore {
  notifications: AppNotification[];
  addNotification: (n: Omit<AppNotification, "id" | "read" | "createdAt">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
  unreadCount: () => number;
}

let _counter = 0;

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],

  addNotification: (n) => {
    const newNotif: AppNotification = {
      ...n,
      id: `notif_${Date.now()}_${++_counter}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ notifications: [newNotif, ...s.notifications].slice(0, 50) }));
  },

  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),

  clearAll: () => set({ notifications: [] }),

  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));
