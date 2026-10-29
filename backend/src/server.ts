import "dotenv/config";
import adminPlugin from './plugins/admin.js';
import { adminRoutes } from './routes/admin.js';
import Fastify from "fastify";
import cookie from "@fastify/cookie";
import helmet from '@fastify/helmet';
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import authPlugin from "./plugins/auth.js";
import { authRoutes } from "./routes/auth.js";
import { wsRoutes } from "./routes/ws.js";
import { postRoutes } from "./routes/posts.js";
import { userRoutes } from "./routes/users.js";
import multipart from "@fastify/multipart";
import { uploadRoutes } from "./routes/upload.js";
import { followRoutes } from "./routes/follows.js";
import { notificationRoutes } from "./routes/notifications.js";
import { messageRoutes } from "./routes/messages.js";
import websocket from "@fastify/websocket";

const app = Fastify({ logger: true });

const start = async () => {
  try {
    await app.register(cors, {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
      methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    });

    await app.register(cookie);
    await app.register(helmet, {
      global: true, // Включаем для всех маршрутов
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
        },
      },
    });

    await app.register(multipart, {
      limits: { fileSize: 10 * 1024 * 1024 },
    });
    await app.register(rateLimit, {
      global: true, // Включаем лимиты для всех маршрутов по умолчанию
      max: 100, // Максимум 100 запросов
      timeWindow: "1 minute", // За одну минуту с одного IP
      errorResponseBuilder: () => ({
        statusCode: 429,
        error: "Too Many Requests",
        message: "Слишком много запросов. Пожалуйста, подождите минуту.",
      }),
    });

    await app.register(websocket);

    await app.register(authPlugin);

    await app.register(adminPlugin);

    await app.register(authRoutes, { prefix: "/api/auth" });

    await app.register(wsRoutes, { prefix: "/api" });

    await app.register(adminRoutes, { prefix: '/api/admin' });

    await app.register(postRoutes, { prefix: "/api/posts" });

    await app.register(userRoutes, { prefix: "/api/users" });

    await app.register(messageRoutes, { prefix: "/api/messages" });

    await app.register(notificationRoutes, { prefix: "/api/notifications" });

    await app.register(followRoutes, { prefix: "/api/users" });

    await app.register(uploadRoutes, { prefix: "/api" });

    app.get("/", async () => ({ message: "Привет от karbyd API!" }));

    await app.listen({
      port: Number(process.env.PORT) || 4000,
      host: "0.0.0.0",
    });
    console.log("🚀 Сервер запущен: http://localhost:4000");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
