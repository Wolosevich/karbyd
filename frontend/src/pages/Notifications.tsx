import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Stack,
  Title,
  Text,
  Group,
  Avatar,
  Paper,
  Loader,
  Center,
  Alert,
  Box,
} from "@mantine/core";
import {
  IconInfoCircle,
  IconHeart,
  IconMessageCircle,
  IconUserPlus,
  IconAt,
} from "@tabler/icons-react";
import {
  useNotifications,
  useMarkNotificationsAsRead,
} from "../hooks/useNotifications";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "только что";
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  return date.toLocaleDateString("ru-RU");
}

export default function Notifications() {
  const { data, isLoading, isError } = useNotifications();
  const markAsRead = useMarkNotificationsAsRead();
  const navigate = useNavigate();

  // Автоматически помечаем как прочитанные при открытии страницы
  useEffect(() => {
    if (data && data.unreadCount > 0) {
      markAsRead.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.unreadCount]);

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (isError || !data) {
    return (
      <Container size="sm" py="xl">
        <Alert color="red" icon={<IconInfoCircle size={16} />} title="Ошибка">
          Не удалось загрузить уведомления
        </Alert>
      </Container>
    );
  }

  const items = data.items;

  const getIcon = (type: string) => {
    if (type === "like") return <IconHeart size={16} color="red" />;
    if (type === "comment") return <IconMessageCircle size={16} color="blue" />;
    if (type === "mention") return <IconAt size={16} color="orange" />;
    return <IconUserPlus size={16} color="teal" />;
  };

  const getText = (type: string) => {
    if (type === "like") return "лайкнул(а) ваш пост";
    if (type === "comment") return "прокомментировал(а) ваш пост";
    if (type === "mention") return "упомянул(а) вас в посте";
    return "подписался(-ась) на вас";
  };

  return (
    <Container size="sm" py="xl">
      <Stack gap="md">
        <Group gap="xs">
          <Title order={2}>Уведомления</Title>
        </Group>

        {items.length === 0 ? (
          <Alert
            color="blue"
            icon={<IconInfoCircle size={16} />}
            title="Пока пусто"
          >
            Здесь появятся уведомления, когда кто-то лайкнет ваши посты, оставит
            комментарий или подпишется на вас.
          </Alert>
        ) : (
          items.map((n) => (
            <Paper
              key={n.id}
              withBorder
              p="md"
              radius="md"
              style={{
                cursor: "pointer",
                backgroundColor: n.read
                  ? undefined
                  : "var(--mantine-color-blue-light)",
              }}
              onClick={() =>
                n.type === "follow"
                  ? navigate(`/profile/${n.actor.username}`)
                  : n.post
                    ? navigate(`/post/${n.post.id}`)
                    : null
              }
            >
              <Group wrap="nowrap" align="flex-start">
                <Avatar
                  src={n.actor.avatar}
                  radius="xl"
                  size="md"
                  component={Link}
                  to={`/profile/${n.actor.username}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {n.actor.username[0].toUpperCase()}
                </Avatar>

                <Box style={{ flex: 1 }}>
                  <Group gap="xs" mb={4}>
                    {getIcon(n.type)}
                    <Text size="sm">
                      <Text
                        span
                        fw={500}
                        component={Link}
                        to={`/profile/${n.actor.username}`}
                        onClick={(e) => e.stopPropagation()}
                        c="inherit"
                      >
                        {n.actor.username}
                      </Text>{" "}
                      {getText(n.type)}
                    </Text>
                    <Text size="xs" c="dimmed" ml="auto">
                      {formatDate(n.createdAt)}
                    </Text>
                  </Group>

                  {n.post && (
                    <Text size="sm" c="dimmed" lineClamp={1} mt={4}>
                      «{n.post.text}»
                    </Text>
                  )}
                </Box>
              </Group>
            </Paper>
          ))
        )}
      </Stack>
    </Container>
  );
}
