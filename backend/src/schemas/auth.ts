import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email('Некорректный email'),
    username: z
        .string()
        .min(3, 'Минимум 3 символа')
        .max(20, 'Максимум 20 символов')
        .regex(/^[a-zA-Z0-9_]+$/, 'Только буквы, цифры и _'),
    password: z.string().min(6, 'Минимум 6 символов'),
});

export const loginSchema = z.object({
    email: z.string().email('Некорректный email'),
    password: z.string().min(1, 'Пароль обязателен'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;