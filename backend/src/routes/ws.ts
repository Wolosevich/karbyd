import type { FastifyInstance } from "fastify";
import { addClient, removeClient } from "../lib/ws-manager.js";

export async function wsRoutes(app: FastifyInstance) {
  // Наш WebSocket эндпоинт: ws://localhost:4000/api/ws?token=...
  app.get("/ws", { websocket: true }, (connection, req) => {
    // 1. Достаем токен из URL (query string)
    const { token } = req.query as { token?: string };
    let userId: string | null = null;

    // 2. Проверяем токен
    try {
      if (token) {
        const decoded = app.jwt.verify(token) as { userId: string };
        userId = decoded.userId;
      }
    } catch {
      // Если токен битый или просроченный — ничего не делаем, userId останется null
    }

    // 3. Если пользователь не авторизован — закрываем соединение
    if (!userId) {
      // 1008 — это код "Policy Violation" (доступ запрещен)
      connection.close(1008, "Unauthorized");
      return;
    }

    // 4. Если всё хорошо — добавляем в наш менеджер
    addClient(userId, connection);

    // 5. Когда браузер закрывает вкладку — удаляем соединение
    connection.on("close", () => {
      removeClient(userId!, connection);
    });
  });
}
