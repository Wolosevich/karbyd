import { useEffect, useState } from "react";
import {
  Modal,
  Textarea,
  Button,
  Group,
  Image,
  ActionIcon,
  FileButton,
  Loader,
} from "@mantine/core";
import { IconX, IconPhoto } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useUpdatePost } from "../hooks/usePosts";
import { useUpload } from "../hooks/useUpload";
import type { Post } from "../types";

interface Props {
  opened: boolean;
  onClose: () => void;
  post: Post;
}

export default function EditPostModal({ opened, onClose, post }: Props) {
  const updatePost = useUpdatePost();
  const { uploadImage, isUploading } = useUpload();
  const [imageUrl, setImageUrl] = useState<string | null>(post.image || null);

  const form = useForm({
    initialValues: {
      text: post.text,
    },
    validate: {
      text: (v) =>
        v.trim().length === 0
          ? "Пост не может быть пустым"
          : v.length > 1000
            ? "Максимум 1000 символов"
            : null,
    },
  });

  // Обновляем поля формы при открытии модалки
  useEffect(() => {
    if (opened) {
      form.setValues({ text: post.text });
      setImageUrl(post.image || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, post.text, post.image]);

  const handleFileSelect = async (file: File | null) => {
    if (!file) return;
    const url = await uploadImage(file);
    if (url) {
      setImageUrl(url);
      notifications.show({
        message: "Новая картинка загружена!",
        color: "green",
      });
    }
  };

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await updatePost.mutateAsync({
        id: post.id,
        text: values.text.trim(),
        image: imageUrl || undefined,
      });
      notifications.show({
        message: "Пост обновлён!",
        color: "green",
      });
      onClose();
    } catch {
      notifications.show({
        title: "Ошибка",
        message: "Не удалось обновить пост",
        color: "red",
      });
    }
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Редактировать пост">
      <form onSubmit={handleSubmit}>
        <Textarea
          placeholder="Текст поста..."
          minRows={3}
          autosize
          maxRows={6}
          {...form.getInputProps("text")}
        />

        {imageUrl && (
          <div style={{ position: "relative", marginTop: 12 }}>
            <Image src={imageUrl} radius="md" fit="cover" mah={300} alt="" />
            <ActionIcon
              variant="filled"
              color="red"
              size="sm"
              style={{ position: "absolute", top: 8, right: 8 }}
              onClick={() => setImageUrl(null)}
            >
              <IconX size={14} />
            </ActionIcon>
          </div>
        )}

        <Group justify="space-between" mt="md">
          <FileButton
            onChange={handleFileSelect}
            accept="image/png,image/jpeg,image/webp,image/gif"
          >
            {(props) => (
              <Button
                {...props}
                variant="subtle"
                size="sm"
                leftSection={
                  isUploading ? <Loader size={14} /> : <IconPhoto size={16} />
                }
                disabled={isUploading}
              >
                {isUploading ? "Загрузка..." : "Картинка"}
              </Button>
            )}
          </FileButton>

          <Group gap="xs">
            <Button variant="default" onClick={onClose}>
              Отмена
            </Button>
            <Button
              type="submit"
              loading={updatePost.isPending}
              disabled={isUploading}
            >
              Сохранить
            </Button>
          </Group>
        </Group>
      </form>
    </Modal>
  );
}
