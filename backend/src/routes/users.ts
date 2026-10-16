import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { updateProfileSchema } from "../schemas/user.js";

export async function userRoutes(app: FastifyInstance) {
  // PATCH /api/users/me — обновить свой профиль
  app.patch("/me", { preHandler: [app.authenticate] }, async (req, reply) => {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: "Некорректные данные",
        details: parsed.error.issues.map((i) => i.message),
      });
    }

    const { bio, avatar } = parsed.data;

    const updated = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(bio !== undefined ? { bio } : {}),
        ...(avatar !== undefined ? { avatar: avatar || null } : {}),
      },
      select: {
        id: true,
        username: true,
        bio: true,
        avatar: true,
        createdAt: true,
      },
    });

    return updated;
  });

  // GET /api/users/search?q=... — поиск пользователей
  app.get("/search", async (req) => {
    const { q } = req.query as { q?: string };

    if (!q || q.trim().length === 0) {
      return { items: [] };
    }

    const users = await prisma.user.findMany({
      where: {
        username: { contains: q, mode: "insensitive" },
      },
      take: 20,
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
      },
      orderBy: { username: "asc" },
    });

    return { items: users };
  });

  // GET /api/users/:username — профиль + посты + подписки
  app.get("/:username", async (req, reply) => {
    const { username } = req.params as { username: string };

    let currentUserId: string | null = null;
    try {
      await req.jwtVerify();
      currentUserId = req.user.userId;
    } catch {
      // не залогинен — isFollowing будет false
    }

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        bio: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      return reply.code(404).send({ error: "Пользователь не найден" });
    }

    const [posts, followersCount, followingCount, isFollowing] =
      await Promise.all([
        prisma.post.findMany({
          where: { authorId: user.id },
          orderBy: { createdAt: "desc" },
          include: {
            author: { select: { id: true, username: true, avatar: true } },
            _count: { select: { likes: true, comments: true } },
          },
        }),
        prisma.follow.count({ where: { followingId: user.id } }),
        prisma.follow.count({ where: { followerId: user.id } }),
        currentUserId
          ? prisma.follow.findUnique({
              where: {
                followerId_followingId: {
                  followerId: currentUserId,
                  followingId: user.id,
                },
              },
            })
          : null,
      ]);

    return {
      user: {
        ...user,
        _count: {
          followers: followersCount,
          following: followingCount,
        },
      },
      posts,
      isFollowing: !!isFollowing,
    };
  });
}
