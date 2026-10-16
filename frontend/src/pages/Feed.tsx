import { useState } from "react";
import {
  Container,
  Stack,
  Title,
  Text,
  Loader,
  Center,
  Alert,
  Button,
  SegmentedControl,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import PostForm from "../components/PostForm";
import PostCard from "../components/PostCard";
import { useFeed } from "../hooks/usePosts";

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
          <Center py="xl">
            <Loader />
          </Center>
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
    </Container>
  );
}
