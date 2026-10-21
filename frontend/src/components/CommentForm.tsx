import { useState } from "react";
import { Textarea, Button, Group, ActionIcon, Popover } from "@mantine/core";
import { IconMoodSmile } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import EmojiPicker from "emoji-picker-react";
import { useAddComment } from "../hooks/usePosts";

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onCancel?: () => void;
}

export default function CommentForm({
  postId,
  parentId,
  onCancel,
}: CommentFormProps) {
  const addComment = useAddComment(postId);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const form = useForm({
    initialValues: { text: "" },
    validate: {
      text: (v) =>
        v.trim().length === 0
          ? "Комментарий не может быть пустым"
          : v.length > 500
            ? "Максимум 500 символов"
            : null,
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await addComment.mutateAsync({
        text: values.text.trim(),
        parentId,
      });
      form.reset();
      if (onCancel) onCancel();
    } catch {
      notifications.show({
        title: "Ошибка",
        message: "Не удалось отправить комментарий",
        color: "red",
      });
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      <Textarea
        placeholder={parentId ? "Написать ответ..." : "Написать комментарий..."}
        minRows={1}
        autosize
        maxRows={4}
        {...form.getInputProps("text")}
      />
      <Group justify="space-between" mt="xs">
        {/* Пикер эмодзи для комментария */}
        <Popover
          opened={emojiPickerOpen}
          onChange={setEmojiPickerOpen}
          position="top-start"
          shadow="md"
        >
          <Popover.Target>
            <ActionIcon
              variant="subtle"
              onClick={() => setEmojiPickerOpen((o) => !o)}
            >
              <IconMoodSmile size={18} />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown p={0}>
            <EmojiPicker
              onEmojiClick={(emojiData) => {
                form.setFieldValue("text", form.values.text + emojiData.emoji);
                setEmojiPickerOpen(false);
              }}
            />
          </Popover.Dropdown>
        </Popover>

        {/* Кнопки */}
        <Group gap="xs">
          {onCancel && (
            <Button variant="default" size="xs" onClick={onCancel}>
              Отмена
            </Button>
          )}
          <Button
            type="submit"
            size="xs"
            loading={addComment.isPending}
            disabled={form.values.text.trim().length === 0}
          >
            {parentId ? "Ответить" : "Отправить"}
          </Button>
        </Group>
      </Group>
    </form>
  );
}
