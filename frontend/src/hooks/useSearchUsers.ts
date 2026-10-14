import { useQuery } from "@tanstack/react-query";
import { usersApi } from "../api/users";

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ["users", "search", query],
    queryFn: () => usersApi.search(query),
    enabled: query.trim().length > 0,
  });
}
