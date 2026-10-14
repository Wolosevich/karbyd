import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Stack,
  Title,
  TextInput,
  Paper,
  Group,
  Avatar,
  Text,
  Loader,
  Center,
  Alert,
} from "@mantine/core";
import { IconSearch, IconInfoCircle } from "@tabler/icons-react";
import { useSearchUsers } from "../hooks/useSearchUsers";
import { useDebouncedValue } from "@mantine/hooks";

export default function Search() {
  const [query, setQuery] = useState("");
  const [debounced] = useDebouncedValue(query, 300);
  const { data, isLoading, isError } = useSearchUsers(debounced);

  const users = data?.items ?? [];

  return (
    <Container size="sm" py="xl">
      <Stack gap="md">
        <Title order={2}>Поиск пользователей</Title>

        <TextInput
          placeholder="Введите username..."
          leftSection={<IconSearch size={16} />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          size="md"
        />

        {isLoading && (
          <Center py="xl">
            <Loader />
          </Center>
        )}

        {isError && (
          <Alert color="red" icon={<IconInfoCircle size={16} />} title="Ошибка">
            Не удалось выполнить поиск
          </Alert>
        )}

        {!isLoading && debounced && users.length === 0 && (
          <Alert
            color="blue"
            icon={<IconInfoCircle size={16} />}
            title="Ничего не найдено"
          >
            Попробуйте другой запрос
          </Alert>
        )}

        {users.map((user) => (
          <Paper
            key={user.id}
            component={Link}
            to={`/profile/${user.username}`}
            withBorder
            p="md"
            radius="md"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Group>
              <Avatar src={user.avatar} radius="xl" size="lg">
                {user.username[0].toUpperCase()}
              </Avatar>
              <div>
                <Text fw={500}>{user.username}</Text>
                {user.bio && (
                  <Text size="sm" c="dimmed">
                    {user.bio}
                  </Text>
                )}
              </div>
            </Group>
          </Paper>
        ))}
      </Stack>
    </Container>
  );
}
