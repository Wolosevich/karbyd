import { z } from 'zod';

export const updateProfileSchema = z.object({
    bio: z.string().max(200, 'Максимум 200 символов').optional(),
    avatar: z
        .string()
        .url('Ссылка на аватар должна быть URL')
        .optional()
        .or(z.literal('')),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;