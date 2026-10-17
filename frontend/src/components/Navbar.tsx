import { Link, useNavigate } from "react-router-dom";
import classes from "./Navbar.module.css";
import { Avatar, Menu, ActionIcon, Button } from "@mantine/core";
import {
  IconLogout,
  IconUser,
  IconHome,
  IconSearch,
  IconUsers,
} from "@tabler/icons-react";
import { useAuth } from "../hooks/useAuth";
import { Indicator } from "@mantine/core"; // добавь Indicator в импорт из @mantine/core
import { IconBell } from "@tabler/icons-react"; // добавь IconBell в импорт иконок
import { useNotifications } from "../hooks/useNotifications"; // новый импорт

export default function Navbar() {
  const { user, logout } = useAuth();
  const { data: notifData } = useNotifications();
  const unreadCount = notifData?.unreadCount || 0;
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout.mutateAsync();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className={classes.navbar}>
      <Link to="/" className={classes.logo}>
        karbyd
      </Link>

      <div className={classes.rightSide}>
        {/* Кнопки для десктопа */}
        <div className={classes.desktopOnly}>
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
            Пользователи
          </Button>
        </div>

        {/* Иконки для мобилок */}
        <div className={classes.mobileOnly}>
          <ActionIcon
            component={Link}
            to="/"
            variant="subtle"
            color="gray"
            size="lg"
          >
            <IconHome size={20} />
          </ActionIcon>
          <ActionIcon
            component={Link}
            to="/search"
            variant="subtle"
            color="gray"
            size="lg"
          >
            <IconSearch size={20} />
          </ActionIcon>
          <ActionIcon
            component={Link}
            to="/users"
            variant="subtle"
            color="gray"
            size="lg"
          >
            <IconUsers size={20} />
          </ActionIcon>
        </div>
        {/* Колокольчик уведомлений */}
        <Indicator
          inline
          label={unreadCount > 0 ? unreadCount : undefined}
          size={16}
          color="red"
          offset={5}
          disabled={unreadCount === 0}
        >
          <ActionIcon
            component={Link}
            to="/notifications"
            variant="subtle"
            color="gray"
            size="lg"
            aria-label="Уведомления"
          >
            <IconBell size={20} />
          </ActionIcon>
        </Indicator>
        {/* Аватарка с выпадающим меню */}
        <Menu shadow="md" width={200} position="bottom-end">
          <Menu.Target>
            <Avatar src={user.avatar} radius="xl" style={{ cursor: "pointer" }}>
              {user.username[0]?.toUpperCase() || "?"}
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
      </div>
    </div>
  );
}
