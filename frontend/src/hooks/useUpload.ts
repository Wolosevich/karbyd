import { useState } from "react";
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

    const maxSize = 5 * 1024 * 1024; // 5 МБ
    if (file.size > maxSize) {
      notifications.show({
        title: "Ошибка",
        message: "Файл слишком большой (максимум 5 МБ)",
        color: "red",
      });
      return null;
    }

    setIsUploading(true);
    try {
      const { url } = await uploadApi.uploadImage(file);
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
