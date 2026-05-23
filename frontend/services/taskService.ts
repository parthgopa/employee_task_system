import api from "./api";

export interface TaskPayload {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  taskDate?: string;
}

export interface TaskUpdatePayload {
  title?: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  status?: "pending" | "completed";
}

export const taskService = {
  getTodayTasks: () => api.get("/api/tasks/today"),
  getTasksByDate: (date: string) => api.get(`/api/tasks/date/${date}`),
  createTask: (data: TaskPayload) => api.post("/api/tasks", data),
  updateTask: (id: string, data: TaskUpdatePayload) => api.put(`/api/tasks/${id}`, data),
  deleteTask: (id: string) => api.delete(`/api/tasks/${id}`),
  toggleTask: (id: string) => api.patch(`/api/tasks/${id}/toggle`),
};
