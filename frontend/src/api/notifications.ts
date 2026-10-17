import { api } from "./client";
import type { User } from "../types";

export interface Notification {
  id: string;
  type: "like" | "comment" | "follow";
  read: boolean;
  createdAt: string;
  actor: Pick<User, "id" | "username" | "avatar">;
  post: {
    id: string;
    text: string;
    image?: string | null;
  } | null;
}

export interface NotificationsResponse {
  items: Notification[];
  unreadCount: number;
}

export const notificationsApi = {
  getAll: () =>
    api.get<NotificationsResponse>("/notifications").then((res) => res.data),

  markAsRead: () =>
    api.patch<{ ok: boolean }>("/notifications/read").then((res) => res.data),
};
