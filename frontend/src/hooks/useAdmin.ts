import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin';

export function useAdminDeletePost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminApi.deletePost(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feed'] });
            queryClient.invalidateQueries({ queryKey: ['post'] });
        },
    });
}

export function useAdminDeleteComment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminApi.deleteComment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['post'] });
            queryClient.invalidateQueries({ queryKey: ['feed'] });
        },
    });
}

export function useAdminToggleBan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminApi.toggleBan(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users', 'all'] });
        },
    });
}

export function useAdminDeleteUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminApi.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users', 'all'] });
            queryClient.invalidateQueries({ queryKey: ['feed'] });
        },
    });
}