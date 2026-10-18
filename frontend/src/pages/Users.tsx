import { Link } from 'react-router-dom';
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
} from '@mantine/core';
import { IconInfoCircle, IconUsers } from '@tabler/icons-react';
import { useAllUsers } from '../hooks/useAllUsers';

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
              // Жестко задаем ширину и блочный тип, чтобы карточка не растягивалась
              style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }}
            >
              <Group justify="space-between" wrap="nowrap" gap="sm">
                {/* Левая часть: Аватар и Имя */}
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
                    <Text fw={500} size="sm" truncate>
                      {user.username}
                    </Text>
                    {user.bio && (
                      <Text size="xs" c="dimmed" truncate>
                        {user.bio}
                      </Text>
                    )}
                  </div>
                </Group>

                {/* Правая часть: Счетчики */}
                <Group gap="sm" wrap="nowrap" style={{ flexShrink: 0 }}>
                  <div style={{ textAlign: 'center' }}>
                    <Text size="sm" fw={600}>
                      {user._count?.posts ?? 0}
                    </Text>
                    <Text size="10px" c="dimmed">
                      постов
                    </Text>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <Text size="sm" fw={600}>
                      {user._count?.followers ?? 0}
                    </Text>
                    <Text size="10px" c="dimmed">
                      подп.
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