import { Link } from "react-router-dom";
import {
  Container,
  Stack,
  Title,
  Paper,
  Group,
  Avatar,
  Text,
  Loader,
  Center,
  Alert,
  Badge,
} from "@mantine/core";
import { IconInfoCircle, IconUsers } from "@tabler/icons-react";
import { useAllUsers } from "../hooks/useAllUsers";

export default function Users() {
  const { data, isLoading, isError } = useAllUsers();

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
          Не удалось загрузить пользователей
        </Alert>
      </Container>
    );
  }

  const users = data.items;

  return (
    <Container size="sm" py="xl">
      <Stack gap="md">
        <Group gap="xs">
          <IconUsers size={24} />
          <Title order={2}>Пользователи</Title>
          <Badge variant="light">{users.length}</Badge>
        </Group>

        {users.length === 0 ? (
          <Alert
            color="blue"
            icon={<IconInfoCircle size={16} />}
            title="Пока пусто"
          >
            Ещё никто не зарегистрировался.
          </Alert>
        ) : (
          users.map((user) => (
            <Paper
              key={user.id}
              component={Link}
              to={`/profile/${user.username}`}
              withBorder
              p="md"
              radius="md"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Group justify="space-between" wrap="nowrap">
                <Group wrap="nowrap">
                  <Avatar src={user.avatar} radius="xl" size="lg">
                    {user.username[0].toUpperCase()}
                  </Avatar>
                  <div>
                    <Text fw={500}>{user.username}</Text>
                    {user.bio && (
                      <Text size="sm" c="dimmed" lineClamp={1}>
                        {user.bio}
                      </Text>
                    )}
                  </div>
                </Group>

                <Group gap="md">
                  <div style={{ textAlign: "center" }}>
                    <Text size="sm" fw={600}>
                      {user._count?.posts ?? 0}
                    </Text>
                    <Text size="xs" c="dimmed">
                      постов
                    </Text>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <Text size="sm" fw={600}>
                      {user._count?.followers ?? 0}
                    </Text>
                    <Text size="xs" c="dimmed">
                      подписчиков
                    </Text>
                  </div>
                </Group>
              </Group>
            </Paper>
          ))
        )}
      </Stack>
    </Container>
  );
}
