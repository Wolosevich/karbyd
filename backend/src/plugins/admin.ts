import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../lib/prisma.js';

declare module 'fastify' {
    interface FastifyInstance {
        requireAdmin: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}

export default fp(async (app: FastifyInstance) => {
    app.decorate('requireAdmin', async (req: FastifyRequest, reply: FastifyReply) => {
        // 1. Проверяем, что пользователь авторизован (валидный JWT)
        try {
            await req.jwtVerify();
        } catch {
            reply.code(401).send({ error: 'Не авторизован' });
            return;
        }

        // 2. Достаем пользователя из БД, чтобы проверить роль и бан
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { role: true, banned: true },
        });

        // 3. Если пользователя нет или он не админ — отказываем
        if (!user || user.role !== 'admin') {
            reply.code(403).send({ error: 'Доступ запрещён. Только для администраторов.' });
            return;
        }

        // 4. Если админ забанен (такое тоже бывает) — отказываем
        if (user.banned) {
            reply.code(403).send({ error: 'Ваш аккаунт заблокирован.' });
            return;
        }

        // Если всё ок — ничего не делаем, Fastify продолжит выполнение роута
    });
});