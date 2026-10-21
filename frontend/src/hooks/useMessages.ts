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
    refetchInterval: 10 * 1000, // Обновлять каждые 10 сек для актуальности
  });
}

export function useSendMessage(username: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => messagesApi.send(username, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", username] });
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
