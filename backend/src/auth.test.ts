import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "./app.js";
import { prisma } from "./lib/prisma.js";

let app: FastifyInstance;

// Уникальные данные для теста (чтобы не конфликтовать с реальными)
const testSuffix = Date.now();
const testUser = {
  email: `test_${testSuffix}@example.com`,
  username: `testuser_${String(testSuffix).slice(-6)}`,
  password: "123456",
};

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  // Чистим тестового пользователя из базы
  await prisma.user.deleteMany({
    where: { email: testUser.email },
  });
  await app.close();
});

describe("POST /api/auth/register", () => {
  it("должен регистрировать нового пользователя и возвращать 201", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      remoteAddress: "10.0.0.1", // Уникальный IP, чтобы не сработал rate limit
      payload: testUser,
    });

    expect(response.statusCode).toBe(201);

    const body = response.json();
    expect(body.user).toHaveProperty("id");
    expect(body.user.email).toBe(testUser.email);
    expect(body.user.username).toBe(testUser.username);
    // Пароль НЕ должен возвращаться в ответе
    expect(body.user).not.toHaveProperty("password");
  });

  it("должен хранить пароль в хешированном виде в базе", async () => {
    const userInDb = await prisma.user.findUnique({
      where: { email: testUser.email },
    });

    expect(userInDb).not.toBeNull();
    // Пароль в базе не должен совпадать с открытым паролем
    expect(userInDb?.password).not.toBe(testUser.password);
    // И должен начинаться с bcrypt-префикса ($2a$ или $2b$)
    expect(userInDb?.password).toMatch(/^\$2[aby]\$/);
  });
});
