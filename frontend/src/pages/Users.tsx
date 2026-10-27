import { Link } from "react-router-dom";
import {
  Container,
  Stack,
  Title,
  Paper,
  Group,
  Avatar,
  Text,
  Alert,
  Badge,
  useMantineColorScheme,
  Skeleton,
} from "@mantine/core";
import { IconInfoCircle, IconUsers } from "@tabler/icons-react";
import { useAllUsers } from "../hooks/useAllUsers";
import classes from "./Users.module.css";

function UserCardSkeleton() {
  return (
    <Paper p="md" radius="md">
      <Group justify="space-between" wrap="nowrap" gap="sm">
        <Group wrap="nowrap" gap="sm" style={{ flex: 1, minWidth: 0 }}>
          <Skeleton height={40} circle style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Skeleton height={16} width="60%" radius="xl" mb={6} />
            <Skeleton height={12} width="40%" radius="xl" />
          </div>
        </Group>
        <Group gap="sm" wrap="nowrap" style={{ flexShrink: 0 }}>
          <div style={{ width: 40 }}>
            <Skeleton height={16} radius="xl" mb={4} />
            <Skeleton height={10} width={30} radius="xl" />
          </div>
          <div style={{ width: 40 }}>
            <Skeleton height={16} radius="xl" mb={4} />
            <Skeleton height={10} width={30} radius="xl" />
          </div>
        </Group>
      </Group>
    </Paper>
  );
}

export default function Users() {
  const { data, isLoading, isError } = useAllUsers();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  // Общие стили для градиента и стекла

  const glassStyle = {
    background: isDark ? "rgba(30, 39, 50, 0.5)" : "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: isDark
      ? "1px solid rgba(255, 255, 255, 0.1)"
      : "1px solid rgba(255, 255, 255, 0.5)",
  };

  return (
    <Container
      size="sm"
      py={{ base: "sm", sm: "xl" }}
      px={{ base: "xs", sm: "md" }}
    >
      <Stack gap="md">
        <Group gap="xs">
          <IconUsers size={28} color="var(--mantine-color-text)" />
          <Title order={2} c="var(--mantine-color-text)">
            Пользователи
          </Title>
          {!isLoading && (
            <Badge variant="filled">{data?.items.length || 0}</Badge>
          )}
        </Group>

        {isLoading && (
          <Stack gap="md">
            <UserCardSkeleton />
            <UserCardSkeleton />
            <UserCardSkeleton />
          </Stack>
        )}

        {isError && (
          <Alert color="red" icon={<IconInfoCircle size={16} />} title="Ошибка">
            Не удалось загрузить пользователей
          </Alert>
        )}

        {!isLoading && !isError && data?.items.length === 0 && (
          <Alert
            color="blue"
            icon={<IconInfoCircle size={16} />}
            title="Пока пусто"
          >
            Ещё никто не зарегистрировался.
          </Alert>
        )}

        {data?.items.map((user) => (
          <Paper
            key={user.id}
            component={Link}
            to={`/profile/${user.username}`}
            p="md"
            radius="md"
            className={classes.userCard}
            style={{
              ...glassStyle,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Group justify="space-between" wrap="nowrap" gap="sm">
              <Group wrap="nowrap" gap="sm" style={{ flex: 1, minWidth: 0 }}>
                <Avatar
                  src={user.avatar}
                  radius="xl"
                  size="md"
                  style={{ flexShrink: 0 }}
                >
                  {user.username[0].toUpperCase()}
                </Avatar>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text fw={600} truncate c="var(--mantine-color-text)">
                    {user.username}
                  </Text>
                  {user.bio && (
                    <Text size="sm" c="dimmed" truncate>
                      {user.bio}
                    </Text>
                  )}
                </div>
              </Group>

              <Group gap="md" wrap="nowrap" style={{ flexShrink: 0 }}>
                <div style={{ textAlign: "center" }}>
                  <Text size="sm" fw={700} c="var(--mantine-color-text)">
                    {user._count?.posts ?? 0}
                  </Text>
                  <Text size="10px" c="dimmed">
                    постов
                  </Text>
                </div>
                <div style={{ textAlign: "center" }}>
                  <Text size="sm" fw={700} c="var(--mantine-color-text)">
                    {user._count?.followers ?? 0}
                  </Text>
                  <Text size="10px" c="dimmed">
                    подп.
                  </Text>
                </div>
              </Group>
            </Group>
          </Paper>
        ))}
      </Stack>
    </Container>
  );
}
