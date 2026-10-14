import { useEffect } from "react";
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Stack,
  Avatar,
  Group,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import type { User } from "../types";

interface Props {
  opened: boolean;
  onClose: () => void;
  user: User;
}

export default function EditProfileModal({ opened, onClose, user }: Props) {
  const updateProfile = useUpdateProfile();

  const form = useForm({
    initialValues: {
      bio: user.bio || "",
      avatar: user.avatar || "",
    },
    validate: {
      bio: (v) => (v.length > 200 ? "Максимум 200 символов" : null),
      avatar: (v) => {
        if (!v) return null;
        try {
          new URL(v);
          return null;
        } catch {
          return "Некорректная ссылка";
        }
      },
    },
  });

  // Обновляем поля формы, когда открывается модалка
  useEffect(() => {
    if (opened) {
      form.setValues({
        bio: user.bio || "",
        avatar: user.avatar || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, user.bio, user.avatar]);

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await updateProfile.mutateAsync({
        bio: values.bio,
        avatar: values.avatar,
      });
      notifications.show({
        message: "Профиль обновлён!",
        color: "green",
      });
      onClose();
    } catch {
      notifications.show({
        title: "Ошибка",
        message: "Не удалось обновить профиль",
        color: "red",
      });
    }
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Редактировать профиль">
      <form onSubmit={handleSubmit}>
        <Stack>
          <Group>
            <Avatar src={form.values.avatar} size={60} radius="xl">
              {user.username[0].toUpperCase()}
            </Avatar>
            <TextInput
              label="Аватар (URL)"
              placeholder="https://..."
              style={{ flex: 1 }}
              {...form.getInputProps("avatar")}
            />
          </Group>

          <Textarea
            label="О себе"
            placeholder="Расскажите о себе..."
            minRows={3}
            autosize
            maxRows={6}
            {...form.getInputProps("bio")}
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" loading={updateProfile.isPending}>
              Сохранить
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
