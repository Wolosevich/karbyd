import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";

export async function messageRoutes(app: FastifyInstance) {
  // GET /api/messages — список всех диалогов
  app.get("/", { preHandler: [app.authenticate] }, async (req) => {
    const myId = req.user.userId;

    // Получаем все сообщения, где я участник
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: myId }, { receiverId: myId }],
      },
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { id: true, username: true, avatar: true } },
        receiver: { select: { id: true, username: true, avatar: true } },
      },
    });

    // Группируем по собеседнику
    const dialogsMap = new Map<string, any>();

    for (const msg of messages) {
      const other = msg.senderId === myId ? msg.receiver : msg.sender;

      if (!dialogsMap.has(other.id)) {
        dialogsMap.set(other.id, {
          user: other,
          lastMessage: msg,
          unreadCount: 0,
        });
      }

      // Считаем непрочитанные (только входящие и только непрочитанные)
      if (msg.receiverId === myId && !msg.read) {
        dialogsMap.get(other.id).unreadCount += 1;
      }
    }

    // Возвращаем массив (сортировка по времени последнего сообщения уже есть благодаря orderBy)
    return { items: Array.from(dialogsMap.values()) };
  });
  // POST /api/messages — отправить сообщение
  app.post("/", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { receiverUsername, text } = req.body as {
      receiverUsername: string;
      text: string;
    };

    if (!text || text.trim().length === 0) {
      return reply.code(400).send({ error: "Сообщение не может быть пустым" });
    }

    const receiver = await prisma.user.findUnique({
      where: { username: receiverUsername },
      select: { id: true },
    });

    if (!receiver) {
      return reply.code(404).send({ error: "Получатель не найден" });
    }

    if (receiver.id === req.user.userId) {
      return reply
        .code(400)
        .send({ error: "Нельзя отправить сообщение самому себе" });
    }

    const message = await prisma.message.create({
      data: {
        senderId: req.user.userId,
        receiverId: receiver.id,
        text: text.trim(),
      },
      include: {
        sender: { select: { id: true, username: true, avatar: true } },
      },
    });

    return reply.code(201).send(message);
  });

  // GET /api/messages/:username — получить историю переписки
  app.get(
    "/:username",
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      const { username } = req.params as { username: string };
      const myId = req.user.userId;

      const otherUser = await prisma.user.findUnique({
        where: { username },
        select: { id: true, username: true, avatar: true },
      });

      if (!otherUser) {
        return reply.code(404).send({ error: "Пользователь не найден" });
      }

      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: myId, receiverId: otherUser.id },
            { senderId: otherUser.id, receiverId: myId },
          ],
        },
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, username: true, avatar: true } },
        },
      });

      // Помечаем входящие сообщения от этого пользователя как прочитанные
      await prisma.message.updateMany({
        where: {
          senderId: otherUser.id,
          receiverId: myId,
          read: false,
        },
        data: { read: true },
      });

      return { user: otherUser, messages };
    },
  );
  // DELETE /api/messages/:username — удалить диалог с пользователем
  app.delete(
    "/:username",
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      const { username } = req.params as { username: string };
      const myId = req.user.userId;

      const otherUser = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
      });

      if (!otherUser) {
        return reply.code(404).send({ error: "Пользователь не найден" });
      }

      // Удаляем все сообщения между нами (в обе стороны)
      await prisma.message.deleteMany({
        where: {
          OR: [
            { senderId: myId, receiverId: otherUser.id },
            { senderId: otherUser.id, receiverId: myId },
          ],
        },
      });

      return { ok: true };
    },
  );
}
