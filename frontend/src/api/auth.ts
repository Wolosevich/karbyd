import { api } from "./client";
import type { User } from "../types";

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post<{ user: User; token: string }>("/auth/login", data).then((res) => {
      localStorage.setItem("token", res.data.token);
      return res.data;
    }),

  register: (data: { email: string; username: string; password: string }) =>
    api
      .post<{ user: User; token: string }>("/auth/register", data)
      .then((res) => {
        localStorage.setItem("token", res.data.token);
        return res.data;
      }),

  logout: () => api.post("/auth/logout").then((res) => res.data),

  me: () => api.get<User>("/auth/me").then((res) => res.data),
};
