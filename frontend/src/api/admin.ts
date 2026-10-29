import { api } from './client';

export const adminApi = {
    // Удалить любой пост
    deletePost: (id: string) =>
        api.delete(`/admin/posts/${id}`).then((res) => res.data),

    // Удалить любой комментарий
    deleteComment: (id: string) =>
        api.delete(`/admin/comments/${id}`).then((res) => res.data),

    // Забанить / разбанить пользователя
    toggleBan: (id: string) =>
        api
            .patch<{ id: string; username: string; banned: boolean }>(
                `/admin/users/${id}/ban`
            )
            .then((res) => res.data),

    // Полностью удалить пользователя
    deleteUser: (id: string) =>
        api.delete(`/admin/users/${id}`).then((res) => res.data),
};