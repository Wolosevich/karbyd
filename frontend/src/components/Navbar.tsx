import { Link, useNavigate } from "react-router-dom";
import classes from "./Navbar.module.css";
import { Avatar, Menu, ActionIcon, Button } from "@mantine/core";
import {
  IconLogout,
  IconUser,
  IconHome,
  IconSearch,
  IconUsers,
  IconMessage,
  IconBookmark,
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

      <div className={classes.rightSide} style={{ gap: '8px' }}>
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
          <Button component={Link} to="/dialogs" variant="subtle" leftSection={<IconMessage size={16} />}>
            Сообщения
          </Button>
        </div>

        {/* Иконки для мобилок */}

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
            size="md"
            aria-label="Уведомления"
          >
            <IconBell size={18} />
          </ActionIcon>
        </Indicator>
        {/* Аватарка с выпадающим меню */}
        <Menu shadow="md" width={200} position="bottom-end">
          <Menu.Target>
            <Avatar src={user.avatar} radius="xl" size="md" style={{ cursor: "pointer" }}>
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
              leftSection={<IconBookmark size={16} />}
              onClick={() => navigate('/saved')}
            >
              Закладки
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
