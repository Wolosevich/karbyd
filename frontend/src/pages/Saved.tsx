import {
  Container,
  Stack,
  Title,
  Loader,
  Center,
  Alert,
  Group,
} from "@mantine/core";
import { IconInfoCircle, IconBookmark } from "@tabler/icons-react";
import PostCard from "../components/PostCard";
import { useSavedPosts } from "../hooks/usePosts";

export default function Saved() {
  const { data, isLoading, isError } = useSavedPosts();

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (isError || !data) {
    return (
      <Container
        size="sm"
        py={{ base: "sm", sm: "xl" }}
        px={{ base: "xs", sm: "md" }}
      >
        <Alert color="red" icon={<IconInfoCircle size={16} />} title="Ошибка">
          Не удалось загрузить закладки
        </Alert>
      </Container>
    );
  }

  const posts = data.items;

  return (
    <Container size="sm" py="xl">
      <Stack gap="md">
        <Group gap="xs">
          <IconBookmark size={24} />
          <Title order={2}>Сохраненные посты</Title>
        </Group>

        {posts.length === 0 ? (
          <Alert
            color="blue"
            icon={<IconInfoCircle size={16} />}
            title="Пока пусто"
          >
            Здесь появятся посты, которые вы сохранили. Нажмите на иконку
            закладки под любым постом в ленте, чтобы сохранить его.
          </Alert>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </Stack>
    </Container>
  );
}
