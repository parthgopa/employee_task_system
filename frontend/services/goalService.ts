import api from "./api";

export interface GoalPayload {
  goal: string;
  notes?: string;
  date?: string;
  completed?: boolean;
}

export const goalService = {
  getTodayGoal: () => api.get("/api/goals/today"),
  getGoalByDate: (date: string) => api.get(`/api/goals/date/${date}`),
  upsertGoal: (data: GoalPayload) => api.post("/api/goals", data),
  updateGoal: (id: string, data: Partial<GoalPayload>) => api.put(`/api/goals/${id}`, data),
};
