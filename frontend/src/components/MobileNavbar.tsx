import { Link, useLocation } from 'react-router-dom';
import { ActionIcon } from '@mantine/core';
import {
    IconHome,
    IconSearch,
    IconUsers,
    IconMessage,
} from '@tabler/icons-react';
import classes from './MobileNavbar.module.css';

export default function MobileNavbar() {
    const location = useLocation();

    // Подсвечиваем иконку синим, если мы на её странице
    const isActive = (path: string) => location.pathname === path;

    return (
        <div className={classes.bottomNav}>
            <ActionIcon
                component={Link}
                to="/"
                variant={isActive('/') ? 'light' : 'subtle'}
                color={isActive('/') ? 'blue' : 'gray'}
                size="xl"
                aria-label="Лента"
            >
                <IconHome size={24} />
            </ActionIcon>

            <ActionIcon
                component={Link}
                to="/search"
                variant={isActive('/search') ? 'light' : 'subtle'}
                color={isActive('/search') ? 'blue' : 'gray'}
                size="xl"
                aria-label="Поиск"
            >
                <IconSearch size={24} />
            </ActionIcon>

            <ActionIcon
                component={Link}
                to="/users"
                variant={isActive('/users') ? 'light' : 'subtle'}
                color={isActive('/users') ? 'blue' : 'gray'}
                size="xl"
                aria-label="Пользователи"
            >
                <IconUsers size={24} />
            </ActionIcon>

            <ActionIcon
                component={Link}
                to="/dialogs"
                variant={isActive('/dialogs') ? 'light' : 'subtle'}
                color={isActive('/dialogs') ? 'blue' : 'gray'}
                size="xl"
                aria-label="Сообщения"
            >
                <IconMessage size={24} />
            </ActionIcon>
        </div>
    );
}