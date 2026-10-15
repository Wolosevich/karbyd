import "@fastify/multipart";
import type { FastifyInstance } from "fastify";
import { supabase } from "../lib/supabase.js";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 МБ

export async function uploadRoutes(app: FastifyInstance) {
  // POST /api/upload — загрузка картинки
  app.post(
    "/upload",
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      const data = await req.file();

      if (!data) {
        return reply.code(400).send({ error: "Файл не передан" });
      }

      if (!ALLOWED_TYPES.includes(data.mimetype)) {
        return reply.code(400).send({
          error: "Недопустимый тип файла. Разрешены: JPEG, PNG, WEBP, GIF",
        });
      }

      const buffer = await data.toBuffer();

      if (buffer.length > MAX_SIZE) {
        return reply.code(400).send({
          error: "Файл слишком большой (максимум 5 МБ)",
        });
      }

      // Генерируем уникальное имя: userId/таймстамп-рандом.расширение
      const ext = data.mimetype.split("/")[1];
      const random = Math.random().toString(36).slice(2, 8);
      const filename = `${req.user.userId}/${Date.now()}-${random}.${ext}`;

      const { error } = await supabase.storage
        .from("post-images")
        .upload(filename, buffer, {
          contentType: data.mimetype,
          upsert: false,
        });

      if (error) {
        req.log.error(error);
        return reply.code(500).send({ error: "Не удалось загрузить файл" });
      }

      // Получаем публичный URL
      const { data: publicData } = supabase.storage
        .from("post-images")
        .getPublicUrl(filename);

      return { url: publicData.publicUrl };
    },
  );
}
