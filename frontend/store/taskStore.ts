import { create } from "zustand";

export interface Task {
  _id: string;
  userId: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "not_initiated" | "in_progress" | "completed";
  taskDate: string;
  projectId?: string | null;
  createdAt: string;
  completedAt: string | null;
}

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  setLoading: (v: boolean) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  loading: false,
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
  updateTask: (id, updates) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t._id === id ? { ...t, ...updates } : t)),
    })),
  removeTask: (id) =>
    set((s) => ({ tasks: s.tasks.filter((t) => t._id !== id) })),
  setLoading: (v) => set({ loading: v }),
}));
