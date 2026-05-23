import api from "./api";

export const historyService = {
  getHistoryDates: (page = 1, limit = 30) =>
    api.get(`/api/history?page=${page}&limit=${limit}`),
  getHistoryByDate: (date: string) => api.get(`/api/history/${date}`),
};
