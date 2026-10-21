import { useState } from "react";
import {
  Textarea,
  Button,
  Paper,
  Group,
  Text,
  Image,
  FileButton,
  ActionIcon,
  Loader,
  Popover,
} from "@mantine/core";
import { IconPhoto, IconX, IconMoodSmile } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import EmojiPicker from "emoji-picker-react";
import { useCreatePost } from "../hooks/usePosts";
import { useUpload } from "../hooks/useUpload";

export default function PostForm() {
  const createPost = useCreatePost();
  const { uploadImage, isUploading } = useUpload();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Состояние для открытия панели эмодзи
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const form = useForm({
    initialValues: { text: "" },
    validate: {
      text: (v) =>
        v.trim().length === 0
          ? "Пост не может быть пустым"
          : v.length > 1000
            ? "Максимум 1000 символов"
            : null,
    },
  });

  const handleFileSelect = async (file: File | null) => {
    if (!file) return;
    const url = await uploadImage(file);
    if (url) {
      setImageUrl(url);
      notifications.show({
        message: "Картинка загружена!",
        color: "green",
      });
    }
  };

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await createPost.mutateAsync({
        text: values.text.trim(),
        image: imageUrl || undefined,
      });
      form.reset();
      setImageUrl(null);
      notifications.show({ message: "Пост опубликован!", color: "green" });
    } catch {
      notifications.show({
        title: "Ошибка",
        message: "Не удалось создать пост",
        color: "red",
      });
    }
  });

  const isLoading = createPost.isPending || isUploading;

  return (
    <Paper withBorder p="md" radius="md">
      <form onSubmit={handleSubmit}>
        <Textarea
          placeholder="Что нового?"
          minRows={2}
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

        <Group justify="space-between" mt="sm">
          <Group gap="xs">
            {/* Пикер эмодзи для поста */}
            <Popover
              opened={emojiPickerOpen}
              onChange={setEmojiPickerOpen}
              position="top-start"
              shadow="md"
            >
              <Popover.Target>
                <ActionIcon
                  variant="subtle"
                  size="lg"
                  onClick={() => setEmojiPickerOpen((o) => !o)}
                >
                  <IconMoodSmile size={20} />
                </ActionIcon>
              </Popover.Target>
              <Popover.Dropdown p={0}>
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    // Добавляем эмодзи в конец текста формы
                    form.setFieldValue(
                      "text",
                      form.values.text + emojiData.emoji,
                    );
                    setEmojiPickerOpen(false);
                  }}
                />
              </Popover.Dropdown>
            </Popover>

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

            <Text size="xs" c="dimmed">
              {form.values.text.length} / 1000
            </Text>
          </Group>

          <Button
            type="submit"
            loading={createPost.isPending}
            disabled={isLoading}
          >
            Опубликовать
          </Button>
        </Group>
      </form>
    </Paper>
  );
}
