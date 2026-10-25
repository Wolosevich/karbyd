import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messagesApi } from "../api/messages";

export function useDialogs() {
  return useQuery({
    queryKey: ["dialogs"],
    queryFn: () => messagesApi.listDialogs(),
    refetchInterval: 30 * 1000, // Обновлять каждые 30 сек
  });
}

export function useChat(username: string) {
  return useQuery({
    queryKey: ["chat", username],
    queryFn: () => messagesApi.getChat(username),
    enabled: !!username,
    /*refetchInterval: 10 * 1000, // Обновлять каждые 10 сек для актуальности*/
  });
}

export function useSendMessage(username: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      text,
      file,
    }: {
      text: string;
      file?: { url: string; name: string; size: number; type: string };
    }) => messagesApi.send(username, text, file),
    onSuccess: (newMessage) => {
      // Вместо запроса к серверу, просто добавляем сообщение в кэш
      queryClient.setQueryData(["chat", username], (oldData: any) => {
        if (!oldData) return oldData;
        // Проверяем, нет ли уже этого сообщения (чтобы избежать дублей)
        if (oldData.messages.some((m: any) => m.id === newMessage.id))
          return oldData;
        return {
          ...oldData,
          messages: [...oldData.messages, newMessage],
        };
      });
      // Список диалогов можно обновить (чтобы там появился последний текст)
      queryClient.invalidateQueries({ queryKey: ["dialogs"] });
    },
  });
}
export function useDeleteDialog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (username: string) => messagesApi.deleteDialog(username),
    onSuccess: () => {
      // Обновляем список диалогов после удаления
      queryClient.invalidateQueries({ queryKey: ["dialogs"] });
    },
  });
}
