import { useState } from "react";
import {
  Textarea,
  Button,
  Group,
  Drawer,
  ActionIcon,
  Popover,
} from "@mantine/core";
import { IconMoodSmile } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useMediaQuery } from "@mantine/hooks";
import { useMantineColorScheme } from "@mantine/core";
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
  const isMobile = useMediaQuery("(max-width: 48em)");
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

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
        {/* Кнопка открытия эмодзи */}
        <ActionIcon
          variant="subtle"
          onClick={() => setEmojiPickerOpen((o) => !o)}
        >
          <IconMoodSmile size={18} />
        </ActionIcon>

        {/* Для ПК: Popover */}
        {!isMobile && (
          <Popover
            opened={emojiPickerOpen}
            onChange={setEmojiPickerOpen}
            position="top-start"
            offset={8}
            shadow="md"
          >
            <Popover.Target>
              <div style={{ display: "none" }} />
            </Popover.Target>
            <Popover.Dropdown p={0}>
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  form.setFieldValue(
                    "text",
                    form.values.text + emojiData.emoji,
                  );
                  setEmojiPickerOpen(false);
                }}
                width={350}
                height={450}
                theme={isDark ? "dark" : "light"}
              />
            </Popover.Dropdown>
          </Popover>
        )}

        {/* Для мобилок: Drawer */}
        {isMobile && (
          <Drawer
            opened={emojiPickerOpen}
            onClose={() => setEmojiPickerOpen(false)}
            position="bottom"
            size={420}
            title="Выберите эмодзи"
            padding="md"
            styles={{
              content: {
                backgroundColor: isDark
                  ? "var(--mantine-color-dark-7)"
                  : "var(--mantine-color-white)",
              },
              body: { padding: 8 },
            }}
          >
            <EmojiPicker
              onEmojiClick={(emojiData) => {
                form.setFieldValue("text", form.values.text + emojiData.emoji);
                setEmojiPickerOpen(false);
              }}
              width="100%"
              height={350}
              theme={isDark ? "dark" : "light"}
            />
          </Drawer>
        )}

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
