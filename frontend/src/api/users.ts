import { api } from './client';
import type { Post, User } from '../types';

export const usersApi = {
    getByUsername: (username: string) =>
        api
            .get<{ user: User; posts: Post[] }>(`/users/${username}`)
            .then((res) => res.data),
};