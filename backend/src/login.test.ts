import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "./app.js";
import { prisma } from "./lib/prisma.js";

let app: FastifyInstance;

// Уникальные данные для теста
const testSuffix = Date.now();
const testUser = {
  email: `login_${testSuffix}@example.com`,
  username: `login_${String(testSuffix).slice(-6)}`,
  password: "secret123",
};

beforeAll(async () => {
  app = await buildApp();
  await app.ready();

  // Регистрируем тестового пользователя (с уникального IP, чтобы не сработал rate limit)
  await app.inject({
    method: "POST",
    url: "/api/auth/register",
    remoteAddress: "10.0.1.1",
    payload: testUser,
  });
});

afterAll(async () => {
  // Чистим тестового пользователя
  await prisma.user.deleteMany({
    where: { email: testUser.email },
  });
  await app.close();
});

describe("POST /api/auth/login", () => {
  it("должен успешно логинить с верными данными и возвращать cookie", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      remoteAddress: "10.0.1.2",
      payload: {
        email: testUser.email,
        password: testUser.password,
      },
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.user).toHaveProperty("id");
    expect(body.user.email).toBe(testUser.email);
    // Пароль не должен возвращаться
    expect(body.user).not.toHaveProperty("password");
    // В ответе должен быть JWT-токен
    expect(body).toHaveProperty("token");

    // В заголовках должна быть установлена httpOnly cookie
    const setCookie = response.headers["set-cookie"];
    expect(setCookie).toBeDefined();
    expect(String(setCookie)).toContain("token=");
    expect(String(setCookie)).toContain("HttpOnly");
  });

  it("должен возвращать 401 при неверном пароле", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      remoteAddress: "10.0.1.3",
      payload: {
        email: testUser.email,
        password: "wrong-password",
      },
    });

    expect(response.statusCode).toBe(401);
    const body = response.json();
    expect(body.error).toBe("Неверный email или пароль");
  });

  it("должен возвращать 401 при несуществующем email", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      remoteAddress: "10.0.1.4",
      payload: {
        email: "nonexistent@example.com",
        password: "whatever",
      },
    });

    expect(response.statusCode).toBe(401);
    const body = response.json();
    expect(body.error).toBe("Неверный email или пароль");
  });
});
