import { useQuery } from "@tanstack/react-query";
import { usersApi } from "../api/users";

export function useAllUsers() {
  return useQuery({
    queryKey: ["users", "all"],
    queryFn: () => usersApi.listAll(),
    staleTime: 60 * 1000,
  });
}
