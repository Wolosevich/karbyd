import { api } from "./client";
import type { DialogsResponse, ChatResponse, Message } from "../types";

export const messagesApi = {
  listDialogs: () =>
    api.get<DialogsResponse>("/messages").then((res) => res.data),

  getChat: (username: string) =>
    api.get<ChatResponse>(`/messages/${username}`).then((res) => res.data),

  send: (
    receiverUsername: string,
    text: string,
    file?: { url: string; name: string; size: number; type: string }
  ) =>
    api
      .post<Message>('/messages', {
        receiverUsername,
        text,
        ...(file
          ? {
            fileUrl: file.url,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
          }
          : {}),
      })
      .then((res) => res.data),

  deleteDialog: (username: string) =>
    api.delete(`/messages/${username}`).then((res) => res.data),
};
