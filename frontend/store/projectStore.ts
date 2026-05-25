import { create } from "zustand";

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

interface ProjectStore {
  projects: Project[];
  selectedProject: Project | null;
  loading: boolean;
  setProjects: (projects: Project[]) => void;
  setSelectedProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  setLoading: (v: boolean) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  selectedProject: null,
  loading: false,
  setProjects: (projects) => set({ projects }),
  setSelectedProject: (project) => set({ selectedProject: project }),
  addProject: (project) => set((s) => ({ projects: [project, ...s.projects] })),
  updateProject: (id, updates) =>
    set((s) => ({
      projects: s.projects.map((p) => (p._id === id ? { ...p, ...updates } : p)),
      selectedProject: s.selectedProject?._id === id ? { ...s.selectedProject, ...updates } : s.selectedProject,
    })),
  removeProject: (id) =>
    set((s) => ({ 
      projects: s.projects.filter((p) => p._id !== id),
      selectedProject: s.selectedProject?._id === id ? null : s.selectedProject,
    })),
  setLoading: (v) => set({ loading: v }),
}));
