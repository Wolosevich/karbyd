import { Link } from 'react-router-dom';
import {
    Container,
    Stack,
    Title,
    Paper,
    Group,
    Avatar,
    Text,
    Alert,
    Badge,
    Skeleton
} from '@mantine/core';
import { IconInfoCircle, IconMessageCircle } from '@tabler/icons-react';
import { useDialogs } from '../hooks/useMessages';

function DialogSkeleton() {
    return (
        <Paper withBorder p="md" radius="md">
            <Group justify="space-between" wrap="nowrap">
                <Group wrap="nowrap">
                    <Skeleton height={40} circle />
                    <div>
                        <Skeleton height={16} width={120} radius="xl" mb={6} />
                        <Skeleton height={12} width={180} radius="xl" />
                    </div>
                </Group>
            </Group>
        </Paper>
    );
}

export default function Dialogs() {
    const { data, isLoading, isError } = useDialogs();

    if (isLoading) {
        return (
            <Container size="sm" py="xl">
                <Stack gap="md">
                    <Group gap="xs" mb="md">
                        <Skeleton height={28} width={150} radius="xl" />
                    </Group>
                    <DialogSkeleton />
                    <DialogSkeleton />
                    <DialogSkeleton />
                    <DialogSkeleton />
                </Stack>
            </Container>
        );
    }

    if (isError || !data) {
        return (
            <Container size="sm" py="xl">
                <Alert color="red" icon={<IconInfoCircle size={16} />} title="Ошибка">
                    Не удалось загрузить диалоги
                </Alert>
            </Container>
        );
    }

    const dialogs = data.items;

    return (
        <Container size="sm" py="xl">
            <Stack gap="md">
                <Group gap="xs">
                    <IconMessageCircle size={24} />
                    <Title order={2}>Сообщения</Title>
                </Group>

                {dialogs.length === 0 ? (
                    <Alert
                        color="blue"
                        icon={<IconInfoCircle size={16} />}
                        title="Пока пусто"
                    >
                        Здесь появятся ваши диалоги. Найдите пользователя в разделе «Пользователи» и напишите ему.
                    </Alert>
                ) : (
                    dialogs.map((dialog) => (
                        <Paper
                            key={dialog.user.id}
                            component={Link}
                            to={`/chat/${dialog.user.username}`}
                            withBorder
                            p="md"
                            radius="md"
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <Group justify="space-between" wrap="nowrap">
                                <Group wrap="nowrap">
                                    <Avatar src={dialog.user.avatar} radius="xl" size="lg">
                                        {dialog.user.username[0].toUpperCase()}
                                    </Avatar>
                                    <div>
                                        <Text fw={500}>{dialog.user.username}</Text>
                                        <Text size="sm" c="dimmed" lineClamp={1}>
                                            {dialog.lastMessage.text}
                                        </Text>
                                    </div>
                                </Group>
                                {dialog.unreadCount > 0 && (
                                    <Badge color="blue" variant="filled" size="lg" circle>
                                        {dialog.unreadCount}
                                    </Badge>
                                )}
                            </Group>
                        </Paper>
                    ))
                )}
            </Stack>
        </Container>
    );
}