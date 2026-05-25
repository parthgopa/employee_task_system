"use client";

import { useEffect } from "react";
import { useAlertStore } from "@/store/alertStore";
import { useNotificationStore } from "@/store/notificationStore";

export function useOverdueAlerts() {
  const { summary, overdueTasks, fetchAlerts } = useAlertStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    // Initial fetch
    fetchAlerts();
    
    // Poll every 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  useEffect(() => {
    if (summary && summary.count > 0) {
      const highPriorityCount = overdueTasks.filter(t => t.priority === "high").length;
      const regularCount = summary.count - highPriorityCount;
      
      // Only notify if there are unacknowledged high priority tasks
      if (highPriorityCount > 0 && summary.hasHighPriority) {
        addNotification({
          title: "High Priority Tasks Overdue",
          message: `${highPriorityCount} high priority task${highPriorityCount !== 1 ? "s" : ""} from previous days need${highPriorityCount === 1 ? "s" : ""} immediate attention.`,
          type: "info",
        });
      } else if (regularCount > 0 && !summary.hasHighPriority) {
        // Only show regular notification once per session for non-high-priority
        addNotification({
          title: "Overdue Tasks",
          message: `You have ${regularCount} pending task${regularCount !== 1 ? "s" : ""} from previous days. Check the Alerts page.`,
          type: "info",
        });
      }
    }
  }, [summary?.count, summary?.hasHighPriority, addNotification]);
}
