import { useState } from "react";
import imageCompression from "browser-image-compression";
import { notifications } from "@mantine/notifications";
import { uploadApi } from "../api/upload";

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file: File): Promise<string | null> => {
    // Проверки на фронте — чтобы не грузить сервер зря
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      notifications.show({
        title: "Ошибка",
        message: "Разрешены только JPEG, PNG, WEBP, GIF",
        color: "red",
      });
      return null;
    }

    // Разрешаем загружать оригиналы до 10 МБ (мы их все равно сожмем)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      notifications.show({
        title: "Ошибка",
        message: "Файл слишком большой (максимум 10 МБ)",
        color: "red",
      });
      return null;
    }

    setIsUploading(true);
    try {
      // --- ЛОГИКА СЖАТИЯ ---
      const options = {
        maxSizeMB: 1, // Сжимаем до 1 МБ
        maxWidthOrHeight: 1920, // Максимальная ширина/высота 1920px
        useWebWorker: true, // Используем Web Worker, чтобы интерфейс не зависал
      };

      let fileToUpload = file;

      // Сжимаем только картинки, GIF оставляем как есть (чтобы не сломать анимацию)
      if (file.type !== "image/gif") {
        try {
          fileToUpload = await imageCompression(file, options);
          console.log(
            `Сжатие: было ${(file.size / 1024 / 1024).toFixed(2)} МБ, стало ${(fileToUpload.size / 1024 / 1024).toFixed(2)} МБ`,
          );
        } catch (error) {
          console.error("Ошибка сжатия, отправляем оригинал:", error);
          // Если сжатие упало, отправляем оригинал
        }
      }
      // --- КОНЕЦ ЛОГИКИ СЖАТИЯ ---

      const { url } = await uploadApi.uploadImage(fileToUpload);
      return url;
    } catch {
      notifications.show({
        title: "Ошибка",
        message: "Не удалось загрузить картинку",
        color: "red",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadImage, isUploading };
}
