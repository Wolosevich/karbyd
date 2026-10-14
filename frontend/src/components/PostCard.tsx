import { Link } from "react-router-dom";
import { renderTextWithLinks } from "../utils/renderText";
import {
  Paper,
  Group,
  Avatar,
  Text,
  ActionIcon,
  Image,
  Menu,
} from "@mantine/core";
import { IconHeart, IconMessageCircle, IconTrash } from "@tabler/icons-react";
import { useLikePost, useDeletePost } from "../hooks/usePosts";
import { useAuth } from "../hooks/useAuth";
import type { Post } from "../types";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "только что";
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  return date.toLocaleDateString("ru-RU");
}

export default function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const likePost = useLikePost();
  const deletePost = useDeletePost();

  const isOwner = user?.id === post.authorId;

  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between" mb="sm">
        <Group>
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
            <Text
              component={Link}
              to={`/post/${post.id}`}
              size="xs"
              c="dimmed"
              style={{ textDecoration: "none" }}
            >
              {formatDate(post.createdAt)}
            </Text>
          </div>
        </Group>

        {isOwner && (
          <Menu shadow="md" width={160}>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray">
                ⋯
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={() => deletePost.mutate(post.id)}
              >
                Удалить
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>

      <Text style={{ whiteSpace: "pre-wrap" }}>
        {renderTextWithLinks(post.text)}
      </Text>

      {post.image && <Image src={post.image} radius="md" mt="sm" alt="" />}

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

        <Group gap="xs">
          <IconMessageCircle size={20} color="gray" />
          <Text size="sm" c="dimmed">
            {post._count?.comments ?? 0}
          </Text>
        </Group>
      </Group>
    </Paper>
  );
}
