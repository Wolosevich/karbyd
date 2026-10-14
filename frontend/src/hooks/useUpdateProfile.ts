import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api/users";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.updateMe,
    onSuccess: (updatedUser) => {
      // Обновляем данные текущего пользователя
      queryClient.setQueryData(["me"], (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        return { ...(old as object), ...updatedUser };
      });

      // Обновляем кэш профиля этого пользователя
      queryClient.invalidateQueries({
        queryKey: ["profile", updatedUser.username],
      });
    },
  });
}
