import api from "./api";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  register: (data: RegisterPayload) => api.post("/api/auth/register", data),
  login: (data: LoginPayload) => api.post("/api/auth/login", data),
  getMe: () => api.get("/api/auth/me"),
};
