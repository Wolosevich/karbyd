import { useParams } from "react-router-dom";
import { renderTextWithLinks } from "../utils/renderText";
import {
  Container,
  Stack,
  Paper,
  Group,
  Avatar,
  Text,
  Loader,
  Center,
  Alert,
  Divider,
  ActionIcon,
} from "@mantine/core";
import { IconInfoCircle, IconHeart, IconArrowLeft } from "@tabler/icons-react";
import { useNavigate, Link } from "react-router-dom";
import CommentForm from "../components/CommentForm";
import { usePost, useLikePost } from "../hooks/usePosts";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: post, isLoading, isError } = usePost(id || "");
  const likePost = useLikePost();

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (isError || !post) {
    return (
      <Container size="sm" py="xl">
        <Alert color="red" icon={<IconInfoCircle size={16} />} title="Ошибка">
          Пост не найден
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Stack gap="md">
        <ActionIcon variant="subtle" onClick={() => navigate(-1)}>
          <IconArrowLeft size={20} />
        </ActionIcon>

        <Paper withBorder p="md" radius="md">
          <Group mb="sm">
            <Avatar
              src={post.author.avatar}
              radius="xl"
              component={Link}
              to={`/profile/${post.author.username}`}
              style={{ cursor: "pointer" }}
            >
              {post.author.username[0].toUpperCase()}
            </Avatar>
            <div>
              <Text
                component={Link}
                to={`/profile/${post.author.username}`}
                fw={500}
                style={{ textDecoration: "none" }}
                c="inherit"
              >
                {post.author.username}
              </Text>
              <Text size="xs" c="dimmed">
                {formatDate(post.createdAt)}
              </Text>
            </div>
          </Group>

          <Text style={{ whiteSpace: "pre-wrap" }}>
            {renderTextWithLinks(post.text)}
          </Text>

          <Group mt="md" gap="lg">
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => likePost.mutate(post.id)}
              loading={likePost.isPending}
            >
              <IconHeart size={20} />
            </ActionIcon>
            <Text size="sm" c="dimmed">
              {post._count?.likes ?? 0}
            </Text>
          </Group>
        </Paper>

        <Divider label={`Комментарии (${post.comments?.length ?? 0})`} />

        <CommentForm postId={post.id} />

        {post.comments && post.comments.length > 0 ? (
          post.comments.map((comment) => (
            <Paper key={comment.id} withBorder p="md" radius="md">
              <Group mb="xs">
                <Avatar
                  src={comment.author.avatar}
                  radius="xl"
                  size="sm"
                  component={Link}
                  to={`/profile/${comment.author.username}`}
                  style={{ cursor: "pointer" }}
                >
                  {comment.author.username[0].toUpperCase()}
                </Avatar>
                <div>
                  <Text
                    component={Link}
                    to={`/profile/${comment.author.username}`}
                    fw={500}
                    size="sm"
                    style={{ textDecoration: "none" }}
                    c="inherit"
                  >
                    {comment.author.username}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {formatDate(comment.createdAt)}
                  </Text>
                </div>
              </Group>
              <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                {renderTextWithLinks(comment.text)}
              </Text>
            </Paper>
          ))
        ) : (
          <Text c="dimmed" size="sm" ta="center">
            Пока нет комментариев. Будьте первым!
          </Text>
        )}
      </Stack>
    </Container>
  );
}
