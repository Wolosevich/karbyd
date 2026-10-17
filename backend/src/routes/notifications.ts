import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";

export async function notificationRoutes(app: FastifyInstance) {
  // GET /api/notifications — получить уведомления текущего пользователя
  app.get("/", { preHandler: [app.authenticate] }, async (req) => {
    const userId = req.user.userId;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        actor: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });

    // Для лайков/комментариев подтягиваем текст поста (если есть)
    const postIds = notifications
      .map((n) => n.postId)
      .filter((id): id is string => !!id);

    const posts = postIds.length
      ? await prisma.post.findMany({
          where: { id: { in: postIds } },
          select: { id: true, text: true, image: true },
        })
      : [];

    const postsMap = new Map(posts.map((p) => [p.id, p]));

    const items = notifications.map((n) => ({
      id: n.id,
      type: n.type,
      read: n.read,
      createdAt: n.createdAt,
      actor: n.actor,
      post: n.postId ? postsMap.get(n.postId) || null : null,
    }));

    const unreadCount = notifications.filter((n) => !n.read).length;

    return { items, unreadCount };
  });

  // PATCH /api/notifications/read — отметить все как прочитанные
  app.patch("/read", { preHandler: [app.authenticate] }, async (req) => {
    const userId = req.user.userId;

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return { ok: true };
  });
}
