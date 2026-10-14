import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users';

export function useProfile(username: string) {
    return useQuery({
        queryKey: ['profile', username],
        queryFn: () => usersApi.getByUsername(username),
        enabled: !!username,
    });
}