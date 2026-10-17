import { Link, useNavigate } from "react-router-dom";
import { Group, Button, Text, Avatar, Menu, Container } from "@mantine/core";
import {
  IconLogout,
  IconUser,
  IconHome,
  IconSearch,
  IconUsers,
} from "@tabler/icons-react";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout.mutateAsync();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <Container size="md" py="md">
      <Group justify="space-between">
        <Text
          component={Link}
          to="/"
          size="xl"
          fw={700}
          style={{ textDecoration: "none" }}
          c="blue"
        >
          karbyd
        </Text>

        <Group>
          <Button
            component={Link}
            to="/"
            variant="subtle"
            leftSection={<IconHome size={16} />}
          >
            Лента
          </Button>

          <Button
            component={Link}
            to="/search"
            variant="subtle"
            leftSection={<IconSearch size={16} />}
          >
            Поиск
          </Button>

          <Button
            component={Link}
            to="/users"
            variant="subtle"
            leftSection={<IconUsers size={16} />}
          >
            Люди
          </Button>

          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Avatar
                src={user.avatar}
                radius="xl"
                style={{ cursor: "pointer" }}
              >
                {user.username[0].toUpperCase()}
              </Avatar>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>{user.username}</Menu.Label>
              <Menu.Item
                leftSection={<IconUser size={16} />}
                onClick={() => navigate(`/profile/${user.username}`)}
              >
                Профиль
              </Menu.Item>
              <Menu.Item
                leftSection={<IconLogout size={16} />}
                color="red"
                onClick={handleLogout}
              >
                Выйти
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </Container>
  );
}
