import { create } from "zustand";
import { alertService } from "@/services/alertService";

export interface OverdueTask {
  _id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "completed";
  taskDate: string;
  createdAt: string;
}

interface AlertSummary {
  count: number;
  hasHighPriority: boolean;
  today: string;
}

interface AlertStore {
  overdueTasks: OverdueTask[];
  summary: AlertSummary | null;
  loading: boolean;
  fetchAlerts: () => Promise<void>;
  dismissAlert: (taskId: string) => Promise<void>;
  getUnreadCount: () => number;
  hasHighPriorityAlerts: () => boolean;
}

export const useAlertStore = create<AlertStore>((set, get) => ({
  overdueTasks: [],
  summary: null,
  loading: false,

  fetchAlerts: async () => {
    set({ loading: true });
    try {
      const [overdueRes, summaryRes] = await Promise.all([
        alertService.getOverdueTasks(),
        alertService.getAlertsSummary(),
      ]);
      set({
        overdueTasks: overdueRes.data.data.tasks || [],
        summary: summaryRes.data.data,
      });
    } catch (err) {
      console.error("Failed to fetch alerts", err);
    } finally {
      set({ loading: false });
    }
  },

  dismissAlert: async (taskId: string) => {
    try {
      await alertService.dismissAlert(taskId);
      set((s) => ({
        overdueTasks: s.overdueTasks.filter((t) => t._id !== taskId),
      }));
      // Refresh summary
      get().fetchAlerts();
    } catch (err) {
      console.error("Failed to dismiss alert", err);
    }
  },

  getUnreadCount: () => get().summary?.count || 0,
  hasHighPriorityAlerts: () => get().summary?.hasHighPriority || false,
}));
