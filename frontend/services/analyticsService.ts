import api from "./api";

export const analyticsService = {
  getWeekly: () => api.get("/api/analytics/weekly"),
  getMonthly: () => api.get("/api/analytics/monthly"),
  getStats: () => api.get("/api/analytics/stats"),
};
