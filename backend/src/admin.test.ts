import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "./app.js";
import { prisma } from "./lib/prisma.js";

let app: FastifyInstance;

const testSuffix = Date.now();

// Обычный пользователь (жертва, на которого будем банить)
const victimUser = {
  email: `victim_${testSuffix}@example.com`,
  username: `victim_${String(testSuffix).slice(-6)}`,
  password: "secret123",
};

// Админ
const adminUser = {
  email: `admin_${testSuffix}@example.com`,
  username: `admin_${String(testSuffix).slice(-6)}`,
  password: "secret123",
};

// Токены для обоих
let victimToken: string;
let adminToken: string;

// ID поста для теста удаления
let postId: string;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();

  // 1. Регистрируем обычного пользователя
  await app.inject({
    method: "POST",
    url: "/api/auth/register",
    remoteAddress: "10.0.2.1",
    payload: victimUser,
  });

  // 2. Логинимся, чтобы получить токен (регистрация не возвращает токен в теле)
  const victimLogin = await app.inject({
    method: "POST",
    url: "/api/auth/login",
    remoteAddress: "10.0.2.3", // Уникальный IP, чтобы не сработал rate limit
    payload: { email: victimUser.email, password: victimUser.password },
  });
  victimToken = victimLogin.json().token;

  // 3. Регистрируем админа
  await app.inject({
    method: "POST",
    url: "/api/auth/register",
    remoteAddress: "10.0.2.2",
    payload: adminUser,
  });

  // 4. Логинимся за админа
  const adminLogin = await app.inject({
    method: "POST",
    url: "/api/auth/login",
    remoteAddress: "10.0.2.4",
    payload: { email: adminUser.email, password: adminUser.password },
  });
  adminToken = adminLogin.json().token;

  // 5. Вручную выдаём админу роль admin
  await prisma.user.update({
    where: { email: adminUser.email },
    data: { role: "admin" },
  });

  // 6. Создаём пост от имени жертвы
  const postResponse = await app.inject({
    method: "POST",
    url: "/api/posts",
    headers: {
      cookie: `token=${victimToken}`,
    },
    payload: { text: "Пост для теста админских прав" },
  });
  postId = postResponse.json().id;

  // Проверка: убедимся, что пост создался
  if (!postId) {
    throw new Error("Не удалось создать тестовый пост: " + postResponse.body);
  }
});

afterAll(async () => {
  // Чистим всех тестовых пользователей
  await prisma.user.deleteMany({
    where: {
      email: { in: [victimUser.email, adminUser.email] },
    },
  });
  await app.close();
});

describe("Защита админских роутов", () => {
  it("обычный пользователь получает 403 при попытке удалить пост", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: `/api/admin/posts/${postId}`,
      headers: {
        cookie: `token=${victimToken}`,
      },
    });

    expect(response.statusCode).toBe(403);
    const body = response.json();
    expect(body.error).toBe("Доступ запрещён. Только для администраторов.");
  });

  it("обычный пользователь получает 403 при попытке забанить другого", async () => {
    // Найдём ID жертвы, чтобы попытаться её забанить
    const victim = await prisma.user.findUnique({
      where: { email: victimUser.email },
    });

    const response = await app.inject({
      method: "PATCH",
      url: `/api/admin/users/${victim?.id}/ban`,
      headers: {
        cookie: `token=${victimToken}`,
      },
    });

    expect(response.statusCode).toBe(403);
  });

  it("неавторизованный пользователь получает 401", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: `/api/admin/posts/${postId}`,
    });

    expect(response.statusCode).toBe(401);
  });

  it("админ успешно удаляет чужой пост (204)", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: `/api/admin/posts/${postId}`,
      headers: {
        cookie: `token=${adminToken}`,
      },
    });

    expect(response.statusCode).toBe(204);

    // Проверяем, что пост действительно удалён из базы
    const postInDb = await prisma.post.findUnique({ where: { id: postId } });
    expect(postInDb).toBeNull();
  });

  it("админ успешно банит обычного пользователя (200)", async () => {
    const victim = await prisma.user.findUnique({
      where: { email: victimUser.email },
    });

    const response = await app.inject({
      method: "PATCH",
      url: `/api/admin/users/${victim?.id}/ban`,
      headers: {
        cookie: `token=${adminToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.banned).toBe(true);
  });
});
