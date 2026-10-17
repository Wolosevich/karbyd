import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";

export async function followRoutes(app: FastifyInstance) {
  // POST /api/users/:username/follow — подписаться / отписаться
  app.post(
    "/:username/follow",
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      const { username } = req.params as { username: string };
      const userId = req.user.userId;

      const target = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
      });

      if (!target) {
        return reply.code(404).send({ error: "Пользователь не найден" });
      }

      if (target.id === userId) {
        return reply.code(400).send({ error: "Нельзя подписаться на себя" });
      }

      const existing = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: target.id,
          },
        },
      });

      if (existing) {
        await prisma.follow.delete({
          where: {
            followerId_followingId: {
              followerId: userId,
              followingId: target.id,
            },
          },
        });
        return { following: false };
      }

      await prisma.follow.create({
        data: {
          followerId: userId,
          followingId: target.id,
        },
      });

      // Создаём уведомление о подписке
      await prisma.notification.create({
        data: {
          userId: target.id,
          actorId: userId,
          type: "follow",
        },
      });

      return { following: true };
    },
  );
}
