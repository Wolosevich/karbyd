import type { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { registerSchema, loginSchema } from "../schemas/auth.js";

export async function authRoutes(app: FastifyInstance) {
  // POST /api/auth/register — регистрация
  app.post(
    "/register",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "15 minutes",
        },
      },
    },
    async (req, reply) => {
      const parsed = registerSchema.safeParse(req.body);

      if (!parsed.success) {
        return reply.code(400).send({
          error: "Некорректные данные",
          details: parsed.error.issues.map((i) => i.message),
        });
      }

      const { email, username, password } = parsed.data;

      const existing = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
      });

      if (existing) {
        return reply.code(409).send({
          error:
            existing.email === email ? "Email уже занят" : "Username уже занят",
        });
      }

      const hash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: { email, username, password: hash },
        select: { id: true, email: true, username: true, createdAt: true },
      });

      const token = app.jwt.sign({ userId: user.id }, { expiresIn: "7d" });

      reply
        .setCookie("token", token, {
          httpOnly: true,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        })
        .code(201)
        .send({ user });
    },
  );

  // POST /api/auth/login — вход
  app.post(
    "/login",
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "5 minutes",
        },
      },
    },
    async (req, reply) => {
      const parsed = loginSchema.safeParse(req.body);

      if (!parsed.success) {
        return reply.code(400).send({
          error: "Некорректные данные",
          details: parsed.error.issues.map((i) => i.message),
        });
      }

      const { email, password } = parsed.data;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return reply.code(401).send({ error: "Неверный email или пароль" });
      }

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        return reply.code(401).send({ error: "Неверный email или пароль" });
      }

      const token = app.jwt.sign({ userId: user.id }, { expiresIn: "7d" });

      reply
        .setCookie("token", token, {
          httpOnly: true,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        })
        .send({
          user: { id: user.id, email: user.email, username: user.username },
          token,
        });
    },
  );

  // POST /api/auth/logout — выход
  // POST /api/auth/logout — выход
  app.post("/logout", async (_req, reply) => {
    reply
      .clearCookie("token", {
        path: "/",
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
      })
      .send({ ok: true });
  });

  // GET /api/auth/me — текущий пользователь
  app.get("/me", { preHandler: [app.authenticate] }, async (req, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) return reply.code(404).send({ error: "Пользователь не найден" });
    return user;
  });
}
