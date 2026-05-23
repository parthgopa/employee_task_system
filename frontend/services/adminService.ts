import api from "./api";

export const adminService = {
  getStats: () => api.get("/api/admin/stats"),
  getEmployees: (page = 1, search = "") =>
    api.get(`/api/admin/employees?page=${page}&search=${encodeURIComponent(search)}`),
  getEmployee: (id: string) => api.get(`/api/admin/employees/${id}`),
  getEmployeeTasks: (id: string, date?: string, status?: string) => {
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (status) params.set("status", status);
    return api.get(`/api/admin/employees/${id}/tasks?${params}`);
  },
  getEmployeeHistory: (id: string, page = 1) =>
    api.get(`/api/admin/employees/${id}/history?page=${page}`),
};
