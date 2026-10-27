import { useParams } from "react-router-dom";
import { useState } from "react";
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
  Button,
} from "@mantine/core";
import {
  IconInfoCircle,
  IconHeart,
  IconArrowLeft,
  IconCornerDownRight,
} from "@tabler/icons-react";
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
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (isError || !post) {
    return (
      <Container
        size="sm"
        py={{ base: "sm", sm: "xl" }}
        px={{ base: "xs", sm: "md" }}
      >
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

          <Text style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
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
          // 1. Сначала показываем ТОЛЬКО главные комментарии (без parentId)
          post.comments
            .filter((c) => !c.parentId)
            .map((comment) => {
              // 2. Ищем ответы, которые относятся именно к этому комментарию
              const replies =
                post.comments?.filter((c) => c.parentId === comment.id) || [];

              return (
                <div key={comment.id} style={{ marginBottom: 8 }}>
                  {/* Карточка самого комментария */}
                  <Paper withBorder p="md" radius="md">
                    <Group justify="space-between" mb="xs">
                      <Group>
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

                      {/* Кнопка Ответить */}
                      <Button
                        variant="subtle"
                        size="compact-xs"
                        leftSection={<IconCornerDownRight size={14} />}
                        onClick={() =>
                          setReplyingToId(
                            replyingToId === comment.id ? null : comment.id,
                          )
                        }
                      >
                        Ответить
                      </Button>
                    </Group>

                    <Text
                      size="sm"
                      style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {renderTextWithLinks(comment.text)}
                    </Text>
                  </Paper>

                  {/* Форма ответа (появляется при клике на "Ответить") */}
                  {replyingToId === comment.id && (
                    <div
                      style={{ marginLeft: 32, marginTop: 8, marginBottom: 16 }}
                    >
                      <CommentForm
                        postId={post.id}
                        parentId={comment.id}
                        onCancel={() => setReplyingToId(null)}
                      />
                    </div>
                  )}

                  {/* Сами ответы (сдвинутые вправо) */}
                  {replies.length > 0 && (
                    <div
                      style={{
                        marginLeft: 32,
                        marginTop: 8,
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {replies.map((reply) => (
                        <Paper key={reply.id} withBorder p="sm" radius="md">
                          <Group mb="xs">
                            <Avatar
                              src={reply.author.avatar}
                              radius="xl"
                              size="xs"
                              component={Link}
                              to={`/profile/${reply.author.username}`}
                              style={{ cursor: "pointer" }}
                            >
                              {reply.author.username[0].toUpperCase()}
                            </Avatar>
                            <Text
                              component={Link}
                              to={`/profile/${reply.author.username}`}
                              fw={500}
                              size="xs"
                              style={{ textDecoration: "none" }}
                              c="inherit"
                            >
                              {reply.author.username}
                            </Text>
                            <Text size="10px" c="dimmed">
                              {formatDate(reply.createdAt)}
                            </Text>
                          </Group>
                          <Text
                            size="sm"
                            style={{
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                            }}
                          >
                            {renderTextWithLinks(reply.text)}
                          </Text>
                        </Paper>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
        ) : (
          <Text c="dimmed" size="sm" ta="center">
            Пока нет комментариев. Будьте первым!
          </Text>
        )}
      </Stack>
    </Container>
  );
}
