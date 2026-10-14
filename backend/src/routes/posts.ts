import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { createPostSchema, createCommentSchema } from '../schemas/post.js';

export async function postRoutes(app: FastifyInstance) {
    // GET /api/posts — лента (публичная, с пагинацией)
    app.get('/', async (req) => {
        const query = req.query as { limit?: string; cursor?: string };
        const limit = Math.min(Number(query.limit) || 20, 50);

        const posts = await prisma.post.findMany({
            take: limit + 1,
            ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
            orderBy: { createdAt: 'desc' },
            include: {
                author: { select: { id: true, username: true, avatar: true } },
                _count: { select: { likes: true, comments: true } },
            },
        });

        const hasMore = posts.length > limit;
        const items = hasMore ? posts.slice(0, -1) : posts;
        const nextCursor = hasMore ? items[items.length - 1].id : null;

        return { items, nextCursor };
    });

    // POST /api/posts — создать пост (только авторизованным)
    app.post('/', { preHandler: [app.authenticate] }, async (req, reply) => {
        const parsed = createPostSchema.safeParse(req.body);
        if (!parsed.success) {
            return reply.code(400).send({
                error: 'Некорректные данные',
                details: parsed.error.issues.map((i) => i.message),
            });
        }

        const { text, image } = parsed.data;

        const post = await prisma.post.create({
            data: {
                text,
                image: image || null,
                authorId: req.user.userId,
            },
            include: {
                author: { select: { id: true, username: true, avatar: true } },
                _count: { select: { likes: true, comments: true } },
            },
        });

        return reply.code(201).send(post);
    });

    // GET /api/posts/:id — один пост
    app.get('/:id', async (req, reply) => {
        const { id } = req.params as { id: string };

        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                author: { select: { id: true, username: true, avatar: true } },
                comments: {
                    orderBy: { createdAt: 'asc' },
                    include: { author: { select: { id: true, username: true, avatar: true } } },
                },
                _count: { select: { likes: true, comments: true } },
            },
        });

        if (!post) return reply.code(404).send({ error: 'Пост не найден' });
        return post;
    });

    // DELETE /api/posts/:id — удалить свой пост
    app.delete('/:id', { preHandler: [app.authenticate] }, async (req, reply) => {
        const { id } = req.params as { id: string };

        const post = await prisma.post.findUnique({ where: { id } });
        if (!post) return reply.code(404).send({ error: 'Пост не найден' });
        if (post.authorId !== req.user.userId) {
            return reply.code(403).send({ error: 'Можно удалять только свои посты' });
        }

        await prisma.post.delete({ where: { id } });
        return reply.code(204).send();
    });

    // POST /api/posts/:id/like — поставить/снять лайк
    app.post('/:id/like', { preHandler: [app.authenticate] }, async (req, reply) => {
        const { id: postId } = req.params as { id: string };
        const userId = req.user.userId;

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) return reply.code(404).send({ error: 'Пост не найден' });

        const existing = await prisma.like.findUnique({
            where: { userId_postId: { userId, postId } },
        });

        if (existing) {
            await prisma.like.delete({ where: { userId_postId: { userId, postId } } });
            return { liked: false };
        }

        await prisma.like.create({ data: { userId, postId } });
        return { liked: true };
    });

    // POST /api/posts/:id/comments — добавить комментарий
    app.post('/:id/comments', { preHandler: [app.authenticate] }, async (req, reply) => {
        const { id: postId } = req.params as { id: string };
        const parsed = createCommentSchema.safeParse(req.body);
        if (!parsed.success) {
            return reply.code(400).send({
                error: 'Некорректные данные',
                details: parsed.error.issues.map((i) => i.message),
            });
        }

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) return reply.code(404).send({ error: 'Пост не найден' });

        const comment = await prisma.comment.create({
            data: {
                text: parsed.data.text,
                postId,
                authorId: req.user.userId,
            },
            include: { author: { select: { id: true, username: true, avatar: true } } },
        });

        return reply.code(201).send(comment);
    });
}