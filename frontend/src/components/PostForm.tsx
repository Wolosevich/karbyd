import { Textarea, TextInput, Button, Paper, Group, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useCreatePost } from "../hooks/usePosts";

export default function PostForm() {
  const createPost = useCreatePost();

  const form = useForm({
    initialValues: { text: "", image: "" },
    validate: {
      text: (v) =>
        v.trim().length === 0
          ? "Пост не может быть пустым"
          : v.length > 1000
            ? "Максимум 1000 символов"
            : null,
      image: (v) => {
        if (!v) return null;
        try {
          new URL(v);
          return null;
        } catch {
          return "Некорректная ссылка на картинку";
        }
      },
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await createPost.mutateAsync({
        text: values.text.trim(),
        image: values.image.trim() || undefined,
      });
      form.reset();
      notifications.show({ message: "Пост опубликован!", color: "green" });
    } catch {
      notifications.show({
        title: "Ошибка",
        message: "Не удалось создать пост",
        color: "red",
      });
    }
  });

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

        <TextInput
          placeholder="URL картинки (необязательно)"
          mt="sm"
          {...form.getInputProps("image")}
        />

        <Group justify="space-between" mt="sm">
          <Text size="xs" c="dimmed">
            {form.values.text.length} / 1000
          </Text>
          <Button type="submit" loading={createPost.isPending}>
            Опубликовать
          </Button>
        </Group>
      </form>
    </Paper>
  );
}
