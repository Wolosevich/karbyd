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
  Tabs,
} from "@mantine/core";
import {
  IconSearch,
  IconInfoCircle,
  IconUser,
  IconFileText,
} from "@tabler/icons-react";
import { useSearchUsers } from "../hooks/useSearchUsers";
import { useSearchPosts } from "../hooks/usePosts";
import { useDebouncedValue } from "@mantine/hooks";
import PostCard from "../components/PostCard";

export default function Search() {
  const [query, setQuery] = useState("");
  const [debounced] = useDebouncedValue(query, 300);

  const {
    data: usersData,
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
  } = useSearchUsers(debounced);
  const {
    data: postsData,
    isLoading: isLoadingPosts,
    isError: isErrorPosts,
  } = useSearchPosts(debounced);

  const users = usersData?.items ?? [];
  const posts = postsData?.items ?? [];

  return (
    <Container size="sm" py="xl">
      <Stack gap="md">
        <Title order={2}>Поиск</Title>

        <TextInput
          placeholder="Введите текст или username..."
          leftSection={<IconSearch size={16} />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          size="md"
        />

        {debounced && (
          <Tabs defaultValue="users">
            <Tabs.List mb="md">
              <Tabs.Tab value="users" leftSection={<IconUser size={16} />}>
                Пользователи
              </Tabs.Tab>
              <Tabs.Tab value="posts" leftSection={<IconFileText size={16} />}>
                Посты
              </Tabs.Tab>
            </Tabs.List>

            {/* Вкладка с пользователями */}
            <Tabs.Panel value="users">
              <Stack gap="md">
                {isLoadingUsers && (
                  <Center py="xl">
                    <Loader />
                  </Center>
                )}
                {isErrorUsers && (
                  <Alert
                    color="red"
                    icon={<IconInfoCircle size={16} />}
                    title="Ошибка"
                  >
                    Не удалось выполнить поиск
                  </Alert>
                )}
                {!isLoadingUsers && !isErrorUsers && users.length === 0 && (
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
            </Tabs.Panel>

            {/* Вкладка с постами */}
            <Tabs.Panel value="posts">
              <Stack gap="md">
                {isLoadingPosts && (
                  <Center py="xl">
                    <Loader />
                  </Center>
                )}
                {isErrorPosts && (
                  <Alert
                    color="red"
                    icon={<IconInfoCircle size={16} />}
                    title="Ошибка"
                  >
                    Не удалось выполнить поиск
                  </Alert>
                )}
                {!isLoadingPosts && !isErrorPosts && posts.length === 0 && (
                  <Alert
                    color="blue"
                    icon={<IconInfoCircle size={16} />}
                    title="Ничего не найдено"
                  >
                    Попробуйте другой запрос
                  </Alert>
                )}
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </Stack>
            </Tabs.Panel>
          </Tabs>
        )}
      </Stack>
    </Container>
  );
}
