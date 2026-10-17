import { useState } from "react";
import {
  Container,
  Stack,
  Title,
  Text,
  Center,
  Alert,
  Button,
  SegmentedControl,
  Skeleton,
  Paper,
  Group,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import PostForm from "../components/PostForm";
import PostCard from "../components/PostCard";
import { useFeed } from "../hooks/usePosts";
import ScrollToTop from "../components/ScrollToTop";

// Компонент, который рисует серую карточку-заглушку
function PostSkeleton() {
  return (
    <Paper withBorder p="md" radius="md">
      <Group>
        <Skeleton height={40} circle />
        <div style={{ flex: 1 }}>
          <Skeleton height={12} width="40%" radius="xl" />
          <Skeleton height={8} width="20%" mt={8} radius="xl" />
        </div>
      </Group>
      <Skeleton height={10} mt="md" radius="xl" />
      <Skeleton height={10} mt={8} width="80%" radius="xl" />
      <Skeleton height={200} mt="md" radius="md" />
      <Group mt="md">
        <Skeleton height={20} width={40} radius="xl" />
        <Skeleton height={20} width={40} radius="xl" />
      </Group>
    </Paper>
  );
}

export default function Feed() {
  const [feedType, setFeedType] = useState<"all" | "following">("all");
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed(feedType);

  const posts = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <Container size="sm" py="xl">
      <Stack gap="md">
        <Title order={2}>Лента</Title>

        <SegmentedControl
          value={feedType}
          onChange={(value) => setFeedType(value as "all" | "following")}
          data={[
            { label: "Все посты", value: "all" },
            { label: "Подписки", value: "following" },
          ]}
          fullWidth
        />

        {feedType === "all" && <PostForm />}

        {isLoading && (
          <Stack gap="md">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </Stack>
        )}

        {isError && (
          <Alert
            color="red"
            icon={<IconInfoCircle size={16} />}
            title="Ошибка загрузки"
          >
            Не удалось загрузить посты. Попробуйте обновить страницу.
          </Alert>
        )}

        {!isLoading && posts.length === 0 && feedType === "all" && (
          <Alert
            color="blue"
            icon={<IconInfoCircle size={16} />}
            title="Пока пусто"
          >
            Ещё никто не публиковал посты. Будьте первым!
          </Alert>
        )}

        {!isLoading && posts.length === 0 && feedType === "following" && (
          <Alert
            color="blue"
            icon={<IconInfoCircle size={16} />}
            title="Лента пуста"
          >
            Подпишитесь на кого-нибудь, чтобы видеть их посты здесь.
          </Alert>
        )}

        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {hasNextPage && (
          <Center>
            <Button
              variant="default"
              onClick={() => fetchNextPage()}
              loading={isFetchingNextPage}
            >
              Показать ещё
            </Button>
          </Center>
        )}

        {!hasNextPage && posts.length > 0 && (
          <Text c="dimmed" ta="center" size="sm">
            Это все посты на данный момент
          </Text>
        )}
      </Stack>
      {/* ...весь код... */}

      <ScrollToTop />
    </Container>
  );
}
