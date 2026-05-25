import api from "./api";

export const alertService = {
  getOverdueTasks: () => api.get("/api/alerts/overdue"),
  getAlertsSummary: () => api.get("/api/alerts/summary"),
  dismissAlert: (taskId: string) => api.post(`/api/alerts/${taskId}/dismiss`),
};
