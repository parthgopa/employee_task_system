import api from "./api";

export interface TaskPayload {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  taskDate?: string;
  projectId?: string | null;
}

export interface TaskUpdatePayload {
  title?: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  status?: "not_initiated" | "in_progress" | "completed";
  projectId?: string | null;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "not_initiated" | "in_progress" | "completed";
  taskDate: string;
  projectId?: string | null;
  createdAt: string;
  completedAt: string | null;
}

export const taskService = {
  getTodayTasks: () => api.get("/api/tasks/today"),
  getTasksByDate: (date: string, projectId?: string | null) => 
    api.get(`/api/tasks/date/${date}${projectId !== undefined ? `?projectId=${projectId || "null"}` : ""}`),
  getTasksByProject: (projectId: string) => api.get(`/api/tasks/project/${projectId}`),
  createTask: (data: TaskPayload) => api.post("/api/tasks", data),
  updateTask: (id: string, data: TaskUpdatePayload) => api.put(`/api/tasks/${id}`, data),
  deleteTask: (id: string) => api.delete(`/api/tasks/${id}`),
  updateTaskStatus: (id: string, status: "not_initiated" | "in_progress" | "completed") => 
    api.patch(`/api/tasks/${id}/status`, { status }),
  // Legacy toggle for backward compatibility
  toggleTask: (id: string) => api.patch(`/api/tasks/${id}/status`, { status: "completed" }),
};
