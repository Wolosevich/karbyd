import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Stack,
  Group,
  Avatar,
  Title,
  Text,
  Alert,
  Divider,
  Button,
  Skeleton,
} from "@mantine/core";
import {
  IconInfoCircle,
  IconEdit,
  IconUserPlus,
  IconUserMinus,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { IconMessage } from "@tabler/icons-react";
import PostCard from "../components/PostCard";
import EditProfileModal from "../components/EditProfileModal";
import SEO from "../components/SEO";
import { useProfile } from "../hooks/useProfile";
import { useAuth } from "../hooks/useAuth";
import { useToggleFollow } from "../hooks/useFollow";

function ProfileSkeleton() {
  return (
    <Container
      size="sm"
      py={{ base: "sm", sm: "xl" }}
      px={{ base: "xs", sm: "md" }}
    >
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Skeleton height={80} circle />
            <div>
              <Skeleton height={24} width={150} radius="xl" mb={8} />
              <Skeleton height={14} width={200} radius="xl" mb={8} />
              <Group gap="md">
                <Skeleton height={12} width={60} radius="xl" />
                <Skeleton height={12} width={80} radius="xl" />
                <Skeleton height={12} width={60} radius="xl" />
              </Group>
            </div>
          </Group>
          <Skeleton height={36} width={120} radius="md" />
        </Group>
        <Divider />
        {/* Скелетоны для постов */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              border: "1px solid var(--mantine-color-default-border)",
              borderRadius: 8,
              padding: 16,
            }}
          >
            <Group>
              <Skeleton height={40} circle />
              <div>
                <Skeleton height={14} width={100} radius="xl" mb={6} />
                <Skeleton height={10} width={60} radius="xl" />
              </div>
            </Group>
            <Skeleton height={12} mt="md" radius="xl" />
            <Skeleton height={12} mt={8} width="70%" radius="xl" />
          </div>
        ))}
      </Stack>
    </Container>
  );
}

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const { data, isLoading, isError } = useProfile(username || "");
  const { user: currentUser } = useAuth();
  const [editOpened, setEditOpened] = useState(false);

  const toggleFollow = useToggleFollow(username || "");

  if (isLoading) {
    return <ProfileSkeleton />;
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

  const { user, posts, isFollowing } = data;
  const isOwnProfile = currentUser?.username === user.username;

  return (
    <Container size="sm" py="xl">
      <SEO
        title={`${user.username} — karbyd`}
        description={
          user.bio || `Профиль пользователя ${user.username} в karbyd`
        }
        url={`https://karbyd.vercel.app/profile/${user.username}`}
        image={user.avatar || undefined}
      />

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
              <Group gap="md" mt={4}>
                <Text c="dimmed" size="xs">
                  <strong>{posts.length}</strong>{" "}
                  {posts.length === 1 ? "пост" : "постов"}
                </Text>
                <Text c="dimmed" size="xs">
                  <strong>{user._count?.followers ?? 0}</strong> подписчиков
                </Text>
                <Text c="dimmed" size="xs">
                  <strong>{user._count?.following ?? 0}</strong> подписок
                </Text>
              </Group>
            </div>
          </Group>

          {isOwnProfile ? (
            <Button
              variant="default"
              leftSection={<IconEdit size={16} />}
              onClick={() => setEditOpened(true)}
            >
              Редактировать
            </Button>
          ) : (
            <Group>
              <Button
                component={Link}
                to={`/chat/${user.username}`}
                variant="default"
                leftSection={<IconMessage size={16} />}
              >
                Написать
              </Button>
              <Button
                variant={isFollowing ? "default" : "filled"}
                leftSection={
                  isFollowing ? (
                    <IconUserMinus size={16} />
                  ) : (
                    <IconUserPlus size={16} />
                  )
                }
                onClick={() => toggleFollow.mutate()}
                loading={toggleFollow.isPending}
              >
                {isFollowing ? "Отписаться" : "Подписаться"}
              </Button>
            </Group>
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
