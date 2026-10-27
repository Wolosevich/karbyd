import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { createPostSchema, createCommentSchema } from "../schemas/post.js";
import { sendToUser } from "../lib/ws-manager.js";

export async function postRoutes(app: FastifyInstance) {
  // GET /api/posts — лента (публичная, с пагинацией)
  // GET /api/posts?feed=following — лента (все или только подписки)
  app.get("/", async (req) => {
    const query = req.query as {
      limit?: string;
      cursor?: string;
      feed?: string;
    };
    const limit = Math.min(Number(query.limit) || 20, 50);

    // Если feed=following — нужна авторизация и фильтр по подпискам
    let authorFilter: { in: string[] } | undefined = undefined;

    if (query.feed === "following") {
      let currentUserId: string | null = null;
      try {
        await req.jwtVerify();
        currentUserId = req.user.userId;
      } catch {
        // не залогинен — вернём пустую ленту
      }

      if (!currentUserId) {
        return { items: [], nextCursor: null };
      }

      const followed = await prisma.follow.findMany({
        where: { followerId: currentUserId },
        select: { followingId: true },
      });

      authorFilter = { in: followed.map((f) => f.followingId) };

      if (authorFilter.in.length === 0) {
        return { items: [], nextCursor: null };
      }
    }

    const posts = await prisma.post.findMany({
      take: limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      ...(authorFilter ? { where: { authorId: authorFilter } } : {}),
      orderBy: { createdAt: "desc" },
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
  app.post("/", { preHandler: [app.authenticate] }, async (req, reply) => {
    const parsed = createPostSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: "Некорректные данные",
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
    // --- ЛОГИКА УПОМИНАНИЙ ---
    // Ищем все @username в тексте (игнорируем email-ы, поэтому проверяем, что перед @ нет букв/цифр)
    // --- ЛОГИКА УПОМИНАНИЙ ---
    const mentionRegex = /(?<!\w)@([a-zA-Z0-9_]+)/g;
    const mentionedUsernames = Array.from(
      text.matchAll(mentionRegex),
      (m) => m[1],
    );

    if (mentionedUsernames.length > 0) {
      const mentionedUsers = await prisma.user.findMany({
        where: { username: { in: mentionedUsernames } },
        select: { id: true },
      });

      for (const mUser of mentionedUsers) {
        if (mUser.id !== req.user.userId) {
          await prisma.notification.create({
            data: {
              userId: mUser.id,
              actorId: req.user.userId,
              type: "mention",
              postId: post.id,
            },
          });
          sendToUser(mUser.id, "new_notification", {}); // <-- ОТПРАВЛЯЕМ ТОМУ, КОГО УПОМЯНУЛИ
        }
      }
    }
    // --- КОНЕЦ ЛОГИКИ УПОМИНАНИЙ ---
    // --- КОНЕЦ ЛОГИКИ УПОМИНАНИЙ ---

    return reply.code(201).send(post);
  });
  // POST /api/posts/:id/save — сохранить/убрать из закладок
  app.post(
    "/:id/save",
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      const { id: postId } = req.params as { id: string };
      const userId = req.user.userId;

      // Проверяем, что пост существует
      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (!post) return reply.code(404).send({ error: "Пост не найден" });

      // Ищем, сохранял ли уже этот пользователь пост
      const existing = await prisma.savedPost.findUnique({
        where: { userId_postId: { userId, postId } },
      });

      // Если сохранял — удаляем (убираем из закладок)
      if (existing) {
        await prisma.savedPost.delete({
          where: { userId_postId: { userId, postId } },
        });
        return { saved: false };
      }

      // Если не сохранял — создаем (добавляем в закладки)
      await prisma.savedPost.create({
        data: { userId, postId },
      });

      return { saved: true };
    },
  );
  // GET /api/posts/search?q=... — поиск постов по тексту
  app.get("/search", async (req) => {
    const { q } = req.query as { q?: string };

    if (!q || q.trim().length === 0) {
      return { items: [] };
    }

    const posts = await prisma.post.findMany({
      where: {
        text: { contains: q, mode: "insensitive" },
      },
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    return { items: posts };
  });

  // GET /api/posts/saved — получить список своих сохраненных постов
  app.get("/saved", { preHandler: [app.authenticate] }, async (req) => {
    const userId = req.user.userId;

    const saved = await prisma.savedPost.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        post: {
          include: {
            author: { select: { id: true, username: true, avatar: true } },
            _count: { select: { likes: true, comments: true } },
          },
        },
      },
    });

    const items = saved.map((s) => s.post);
    return { items };
  });

  // GET /api/posts/:id — один пост
  app.get("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { id: true, username: true, avatar: true } },
          },
        },
        _count: { select: { likes: true, comments: true } },
      },
    });

    if (!post) return reply.code(404).send({ error: "Пост не найден" });
    return post;
  });

  // DELETE /api/posts/:id — удалить свой пост
  app.delete("/:id", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return reply.code(404).send({ error: "Пост не найден" });
    if (post.authorId !== req.user.userId) {
      return reply.code(403).send({ error: "Можно удалять только свои посты" });
    }

    await prisma.post.delete({ where: { id } });
    return reply.code(204).send();
  });

  // PATCH /api/posts/:id — редактировать свой пост
  app.patch("/:id", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };

    // Используем ту же схему валидации, что и при создании
    const parsed = createPostSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: "Некорректные данные",
        details: parsed.error.issues.map((i) => i.message),
      });
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return reply.code(404).send({ error: "Пост не найден" });

    // Проверяем, что редактирует автор поста
    if (post.authorId !== req.user.userId) {
      return reply
        .code(403)
        .send({ error: "Можно редактировать только свои посты" });
    }

    const { text, image } = parsed.data;

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        text,
        image: image || null,
      },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    return updatedPost;
  });

  // POST /api/posts/:id/like — поставить/снять лайк
  app.post(
    "/:id/like",
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      const { id: postId } = req.params as { id: string };
      const userId = req.user.userId;

      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (!post) return reply.code(404).send({ error: "Пост не найден" });

      const existing = await prisma.like.findUnique({
        where: { userId_postId: { userId, postId } },
      });

      if (existing) {
        await prisma.like.delete({
          where: { userId_postId: { userId, postId } },
        });
        return { liked: false };
      }

      await prisma.like.create({ data: { userId, postId } });

      // Создаём уведомление, если лайкнули чужой пост
      if (post.authorId !== userId) {
        await prisma.notification.create({
          data: {
            userId: post.authorId,
            actorId: userId,
            type: "like",
            postId: postId,
          },
        });
        sendToUser(post.authorId, "new_notification", {});
      }

      return { liked: true };
    },
  );

  // POST /api/posts/:id/comments — добавить комментарий
  app.post(
    "/:id/comments",
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      const { id: postId } = req.params as { id: string };
      const parsed = createCommentSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: "Некорректные данные",
          details: parsed.error.issues.map((i) => i.message),
        });
      }

      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (!post) return reply.code(404).send({ error: "Пост не найден" });

      const comment = await prisma.comment.create({
        data: {
          text: parsed.data.text,
          postId,
          authorId: req.user.userId,
          parentId: parsed.data.parentId || null,
        },
        include: {
          author: { select: { id: true, username: true, avatar: true } },
        },
      });

      // Создаём уведомление, если прокомментировали чужой пост
      if (post.authorId !== req.user.userId) {
        await prisma.notification.create({
          data: {
            userId: post.authorId,
            actorId: req.user.userId,
            type: "comment",
            postId: postId,
          },
        });
        sendToUser(post.authorId, "new_notification", {});
      }
      const mentionRegex = /(?<!\w)@([a-zA-Z0-9_]+)/g;
      const mentionedUsernames = Array.from(
        parsed.data.text.matchAll(mentionRegex),
        (m) => m[1],
      );

      if (mentionedUsernames.length > 0) {
        const mentionedUsers = await prisma.user.findMany({
          where: { username: { in: mentionedUsernames } },
          select: { id: true },
        });

        for (const mUser of mentionedUsers) {
          if (mUser.id !== req.user.userId) {
            await prisma.notification.create({
              data: {
                userId: mUser.id,
                actorId: req.user.userId,
                type: "mention",
                postId: postId,
              },
            });
            sendToUser(mUser.id, "new_notification", {});
          }
        }
      }
      // --- КОНЕЦ ЛОГИКИ УПОМИНАНИЙ ---

      return reply.code(201).send(comment);
    },
  );
}
