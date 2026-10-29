import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function adminRoutes(app: FastifyInstance) {
    // DELETE /api/admin/posts/:id — удалить любой пост (даже чужой)
    app.delete(
        '/posts/:id',
        { preHandler: [app.requireAdmin] },
        async (req, reply) => {
            const { id } = req.params as { id: string };

            const post = await prisma.post.findUnique({ where: { id } });
            if (!post) return reply.code(404).send({ error: 'Пост не найден' });

            await prisma.post.delete({ where: { id } });
            return reply.code(204).send();
        },
    );
    // DELETE /api/admin/comments/:id — удалить любой комментарий
    app.delete(
        '/comments/:id',
        { preHandler: [app.requireAdmin] },
        async (req, reply) => {
            const { id } = req.params as { id: string };

            const comment = await prisma.comment.findUnique({ where: { id } });
            if (!comment) return reply.code(404).send({ error: 'Комментарий не найден' });

            await prisma.comment.delete({ where: { id } });
            return reply.code(204).send();
        },
    );
    // PATCH /api/admin/users/:id/ban — забанить/разбанить пользователя
    app.patch(
        '/users/:id/ban',
        { preHandler: [app.requireAdmin] },
        async (req, reply) => {
            const { id } = req.params as { id: string };

            const user = await prisma.user.findUnique({
                where: { id },
                select: { id: true, username: true, role: true, banned: true }
            });

            if (!user) return reply.code(404).send({ error: 'Пользователь не найден' });

            // Запрещаем банить других администраторов (и самого себя)
            if (user.role === 'admin') {
                return reply.code(403).send({ error: 'Нельзя забанить администратора' });
            }

            // Переключаем статус: если был забанен — разбаниваем, и наоборот
            const updatedUser = await prisma.user.update({
                where: { id },
                data: { banned: !user.banned },
                select: { id: true, username: true, banned: true },
            });

            return updatedUser;
        },
    );
    // DELETE /api/admin/users/:id — полностью удалить пользователя
    app.delete(
        '/users/:id',
        { preHandler: [app.requireAdmin] },
        async (req, reply) => {
            const { id } = req.params as { id: string };

            const user = await prisma.user.findUnique({
                where: { id },
                select: { id: true, role: true }
            });

            if (!user) return reply.code(404).send({ error: 'Пользователь не найден' });

            // Защита от удаления других администраторов
            if (user.role === 'admin') {
                return reply.code(403).send({ error: 'Нельзя удалить администратора' });
            }

            // Благодаря onDelete: Cascade в Prisma, все посты, комменты, лайки и сообщения удалятся автоматически
            await prisma.user.delete({ where: { id } });

            return reply.code(204).send();
        },
    );
}