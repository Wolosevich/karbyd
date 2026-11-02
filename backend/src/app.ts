import "dotenv/config";
import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import websocket from "@fastify/websocket";
import rateLimit from "@fastify/rate-limit";
import helmet from "@fastify/helmet";

import authPlugin from "./plugins/auth.js";
import adminPlugin from "./plugins/admin.js";

import { authRoutes } from "./routes/auth.js";
import { postRoutes } from "./routes/posts.js";
import { userRoutes } from "./routes/users.js";
import { uploadRoutes } from "./routes/upload.js";
import { messageRoutes } from "./routes/messages.js";
import { notificationRoutes } from "./routes/notifications.js";
import { wsRoutes } from "./routes/ws.js";
import { adminRoutes } from "./routes/admin.js";

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  await app.register(cookie);
  await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });
  await app.register(websocket);

  await app.register(authPlugin);
  await app.register(adminPlugin);

  await app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: "1 minute",
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: "Too Many Requests",
      message: "Слишком много запросов. Пожалуйста, подождите минуту.",
    }),
  });

  await app.register(helmet, {
    global: true,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
      },
    },
  });

  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(postRoutes, { prefix: "/api/posts" });
  await app.register(userRoutes, { prefix: "/api/users" });
  await app.register(uploadRoutes, { prefix: "/api" });
  await app.register(messageRoutes, { prefix: "/api/messages" });
  await app.register(notificationRoutes, { prefix: "/api/notifications" });
  await app.register(wsRoutes, { prefix: "/api" });
  await app.register(adminRoutes, { prefix: "/api/admin" });

  app.get("/", async () => ({ message: "Привет от karbyd API!" }));

  return app;
}
