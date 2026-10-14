import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '../api/posts';

export function useFeed() {
    return useQuery({
        queryKey: ['feed'],
        queryFn: () => postsApi.feed(),
    });
}

export function useCreatePost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: postsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feed'] });
        },
    });
}

export function useLikePost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: postsApi.like,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feed'] });
        },
    });
}

export function useDeletePost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: postsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feed'] });
        },
    });
}
export function usePost(id: string) {
    return useQuery({
        queryKey: ['post', id],
        queryFn: () => postsApi.get(id),
        enabled: !!id,
    });
}

export function useAddComment(postId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (text: string) => postsApi.comment(postId, text),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['post', postId] });
            queryClient.invalidateQueries({ queryKey: ['feed'] });
        },
    });
}