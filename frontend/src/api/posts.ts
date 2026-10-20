import { api } from "./client";
import type { FeedResponse, Post, Comment } from "../types";

export const postsApi = {
  feed: (cursor?: string | null, feed?: "all" | "following") =>
    api
      .get<FeedResponse>("/posts", {
        params: {
          cursor,
          ...(feed === "following" ? { feed: "following" } : {}),
        },
      })
      .then((res) => res.data),
  search: (q: string) =>
    api
      .get<{ items: Post[] }>("/posts/search", { params: { q } })
      .then((res) => res.data),

  get: (id: string) => api.get<Post>(`/posts/${id}`).then((res) => res.data),

  create: (data: { text: string; image?: string }) =>
    api.post<Post>("/posts", data).then((res) => res.data),

  delete: (id: string) => api.delete(`/posts/${id}`).then((res) => res.data),

  like: (id: string) =>
    api.post<{ liked: boolean }>(`/posts/${id}/like`).then((res) => res.data),

  comment: (id: string, text: string, parentId?: string) =>
    api
      .post<Comment>(`/posts/${id}/comments`, { text, parentId })
      .then((res) => res.data),
};
