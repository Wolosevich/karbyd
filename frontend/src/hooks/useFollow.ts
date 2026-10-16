import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api/users";

export function useToggleFollow(username: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => usersApi.toggleFollow(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", username] });
    },
  });
}
