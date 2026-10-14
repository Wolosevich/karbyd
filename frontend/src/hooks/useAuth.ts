import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import type { User } from '../types';

export function useAuth() {
    const queryClient = useQueryClient();

    const { data: user, isLoading } = useQuery<User | null>({
        queryKey: ['me'],
        queryFn: async () => {
            try {
                return await authApi.me();
            } catch {
                return null;
            }
        },
        staleTime: 5 * 60 * 1000,
    });

    const login = useMutation({
        mutationFn: authApi.login,
        onSuccess: (data) => {
            queryClient.setQueryData(['me'], data.user);
        },
    });

    const register = useMutation({
        mutationFn: authApi.register,
        onSuccess: (data) => {
            queryClient.setQueryData(['me'], data.user);
        },
    });

    const logout = useMutation({
        mutationFn: authApi.logout,
        onSuccess: () => {
            queryClient.setQueryData(['me'], null);
        },
    });

    return { user, isLoading, login, register, logout };
}