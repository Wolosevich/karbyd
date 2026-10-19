import { z } from 'zod';

export const createPostSchema = z.object({
    text: z
        .string()
        .min(1, 'Пост не может быть пустым')
        .max(1000, 'Максимум 1000 символов'),
    image: z
        .string()
        .url('Ссылка на картинку должна быть URL')
        .optional()
        .or(z.literal('')),
});

export const createCommentSchema = z.object({
    text: z
        .string()
        .min(1, 'Комментарий не может быть пустым')
        .max(500, 'Максимум 500 символов'),
    parentId: z.string().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;