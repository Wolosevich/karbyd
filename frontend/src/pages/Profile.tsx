import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Stack,
  Group,
  Avatar,
  Title,
  Text,
  Loader,
  Center,
  Alert,
  Divider,
  Button,
} from "@mantine/core";
import { IconInfoCircle, IconEdit } from "@tabler/icons-react";
import PostCard from "../components/PostCard";
import EditProfileModal from "../components/EditProfileModal";
import { useProfile } from "../hooks/useProfile";
import { useAuth } from "../hooks/useAuth";

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const { data, isLoading, isError } = useProfile(username || "");
  const { user: currentUser } = useAuth();
  const [editOpened, setEditOpened] = useState(false);

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
          Пользователь не найден
        </Alert>
      </Container>
    );
  }

  const { user, posts } = data;
  const isOwnProfile = currentUser?.username === user.username;

  return (
    <Container size="sm" py="xl">
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Avatar src={user.avatar} size={80} radius="xl">
              {user.username[0].toUpperCase()}
            </Avatar>
            <div>
              <Title order={2}>{user.username}</Title>
              {user.bio && (
                <Text c="dimmed" size="sm">
                  {user.bio}
                </Text>
              )}
              <Text c="dimmed" size="xs" mt={4}>
                {posts.length} {posts.length === 1 ? "пост" : "постов"}
              </Text>
            </div>
          </Group>

          {isOwnProfile && (
            <Button
              variant="default"
              leftSection={<IconEdit size={16} />}
              onClick={() => setEditOpened(true)}
            >
              Редактировать
            </Button>
          )}
        </Group>

        <Divider />

        {posts.length === 0 ? (
          <Alert
            color="blue"
            icon={<IconInfoCircle size={16} />}
            title="Пока пусто"
          >
            У этого пользователя ещё нет постов.
          </Alert>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </Stack>

      {isOwnProfile && (
        <EditProfileModal
          opened={editOpened}
          onClose={() => setEditOpened(false)}
          user={user}
        />
      )}
    </Container>
  );
}
