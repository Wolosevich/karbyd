import { api } from "./client";
import type { Post, User } from "../types";

export const usersApi = {
  listAll: () => api.get<{ items: User[] }>("/users").then((res) => res.data),
  getByUsername: (username: string) =>
    api
      .get<{
        user: User;
        posts: Post[];
        isFollowing: boolean;
      }>(`/users/${username}`)
      .then((res) => res.data),

  updateMe: (data: { bio?: string; avatar?: string }) =>
    api.patch<User>("/users/me", data).then((res) => res.data),

  search: (q: string) =>
    api
      .get<{ items: User[] }>("/users/search", { params: { q } })
      .then((res) => res.data),

  toggleFollow: (username: string) =>
    api
      .post<{ following: boolean }>(`/users/${username}/follow`)
      .then((res) => res.data),
};
