import {
    Container,
    Stack,
    Title,
    Table,
    Group,
    Avatar,
    Text,
    Badge,
    Button,
    ActionIcon,
    Alert,
    Loader,
    Center,
} from '@mantine/core';
import { IconInfoCircle, IconTrash, IconUserOff, IconUserCheck } from '@tabler/icons-react';
import { useAllUsers } from '../hooks/useAllUsers';
import { useAdminToggleBan, useAdminDeleteUser } from '../hooks/useAdmin';
import { useAuth } from '../hooks/useAuth';

export default function Admin() {
    const { user: currentUser } = useAuth();
    const { data, isLoading, isError } = useAllUsers();
    const toggleBan = useAdminToggleBan();
    const deleteUser = useAdminDeleteUser();

    // Проверка на фронте: если не админ — показываем заглушку
    if (currentUser?.role !== 'admin') {
        return (
            <Container size="sm" py="xl">
                <Alert color="red" icon={<IconInfoCircle size={16} />} title="Доступ запрещён">
                    Эта страница доступна только администраторам.
                </Alert>
            </Container>
        );
    }

    if (isLoading) {
        return (
            <Center py="xl">
                <Loader />
            </Center>
        );
    }

    if (isError || !data) {
        return (
            <Container size="sm" py="xl">
                <Alert color="red" icon={<IconInfoCircle size={16} />} title="Ошибка">
                    Не удалось загрузить список пользователей.
                </Alert>
            </Container>
        );
    }

    const users = data.items;

    return (
        <Container size="lg" py="xl">
            <Stack gap="md">
                <Title order={2}>Админ-панель</Title>
                <Text c="dimmed" size="sm">
                    Управление пользователями: бан, разбан и удаление аккаунтов.
                </Text>

                <Table striped highlightOnHover withTableBorder>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Пользователь</Table.Th>
                            <Table.Th>Роль</Table.Th>
                            <Table.Th>Статус</Table.Th>
                            <Table.Th>Действия</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {users.map((u) => {
                            const isAdmin = u.role === 'admin';
                            const isBanned = u.banned;

                            return (
                                <Table.Tr key={u.id}>
                                    <Table.Td>
                                        <Group gap="sm">
                                            <Avatar src={u.avatar} radius="xl" size="sm">
                                                {u.username[0].toUpperCase()}
                                            </Avatar>
                                            <Text fw={500}>{u.username}</Text>
                                        </Group>
                                    </Table.Td>
                                    <Table.Td>
                                        <Badge color={isAdmin ? 'blue' : 'gray'} variant="light">
                                            {isAdmin ? 'Админ' : 'Пользователь'}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Badge color={isBanned ? 'red' : 'green'} variant="light">
                                            {isBanned ? 'Забанен' : 'Активен'}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap="xs">
                                            {!isAdmin && (
                                                <>
                                                    <ActionIcon
                                                        variant="subtle"
                                                        color={isBanned ? 'green' : 'orange'}
                                                        onClick={() => {
                                                            if (window.confirm(isBanned ? `Разбанить ${u.username}?` : `Забанить ${u.username}?`)) {
                                                                toggleBan.mutate(u.id);
                                                            }
                                                        }}
                                                        loading={toggleBan.isPending && toggleBan.variables === u.id}
                                                    >
                                                        {isBanned ? <IconUserCheck size={18} /> : <IconUserOff size={18} />}
                                                    </ActionIcon>
                                                    <ActionIcon
                                                        variant="subtle"
                                                        color="red"
                                                        onClick={() => {
                                                            if (window.confirm(`Удалить пользователя ${u.username}? Все его данные будут удалены безвозвратно.`)) {
                                                                deleteUser.mutate(u.id);
                                                            }
                                                        }}
                                                        loading={deleteUser.isPending && deleteUser.variables === u.id}
                                                    >
                                                        <IconTrash size={18} />
                                                    </ActionIcon>
                                                </>
                                            )}
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            );
                        })}
                    </Table.Tbody>
                </Table>
            </Stack>
        </Container>
    );
}