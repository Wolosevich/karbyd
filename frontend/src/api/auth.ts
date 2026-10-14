import { api } from './client';
import type { User } from '../types';

export const authApi = {
    register: (data: { email: string; username: string; password: string }) =>
        api.post<{ user: User }>('/auth/register', data).then((res) => res.data),

    login: (data: { email: string; password: string }) =>
        api.post<{ user: User }>('/auth/login', data).then((res) => res.data),

    logout: () => api.post('/auth/logout').then((res) => res.data),

    me: () => api.get<User>('/auth/me').then((res) => res.data),
};