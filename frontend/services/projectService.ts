import api from "./api";

export interface ProjectPayload {
  name: string;
  description?: string;
}

export interface ProjectUpdatePayload {
  name?: string;
  description?: string;
  status?: "active" | "completed" | "archived";
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  status: "active" | "completed" | "archived";
  createdAt: string;
  taskStats?: {
    total: number;
    notInitiated: number;
    inProgress: number;
    completed: number;
  };
}

export const projectService = {
  getProjects: (status?: string) => api.get(`/api/projects${status ? `?status=${status}` : ""}`),
  getProject: (id: string) => api.get(`/api/projects/${id}`),
  createProject: (data: ProjectPayload) => api.post("/api/projects", data),
  updateProject: (id: string, data: ProjectUpdatePayload) => api.put(`/api/projects/${id}`, data),
  deleteProject: (id: string, deleteTasks?: boolean) => 
    api.delete(`/api/projects/${id}${deleteTasks ? "?deleteTasks=true" : ""}`),
};
