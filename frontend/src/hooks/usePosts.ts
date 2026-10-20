import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { postsApi } from "../api/posts";

export function useFeed(feed: "all" | "following" = "all") {
  return useInfiniteQuery({
    queryKey: ["feed", feed],
    queryFn: ({ pageParam }) => postsApi.feed(pageParam, feed),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postsApi.like,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: ["post", id],
    queryFn: () => postsApi.get(id),
    enabled: !!id,
  });
}

export function useAddComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ text, parentId }: { text: string; parentId?: string }) =>
      postsApi.comment(postId, text, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useSearchPosts(query: string) {
  return useQuery({
    queryKey: ["posts", "search", query],
    queryFn: () => postsApi.search(query),
    enabled: query.trim().length > 0,
  });
}
