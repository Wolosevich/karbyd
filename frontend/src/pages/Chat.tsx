import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Container,
    Stack,
    Group,
    Avatar,
    Text,
    Paper,
    Loader,
    Center,
    Alert,
    ActionIcon,
    TextInput,
    Box,
    Title,
} from '@mantine/core';
import { IconInfoCircle, IconArrowLeft, IconSend } from '@tabler/icons-react';
import { useAuth } from '../hooks/useAuth';
import { useChat, useSendMessage } from '../hooks/useMessages';

export default function Chat() {
    const { username } = useParams<{ username: string }>();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const { data, isLoading, isError } = useChat(username || '');
    const sendMessage = useSendMessage(username || '');
    const [text, setText] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Автоскролл вниз при новых сообщениях
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [data?.messages.length]);

    const handleSend = async () => {
        const trimmed = text.trim();
        if (!trimmed) return;
        setText('');
        await sendMessage.mutateAsync(trimmed);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

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
                    Не удалось загрузить чат
                </Alert>
            </Container>
        );
    }

    const { user, messages } = data;

    return (
        <Container size="sm" py="md">
            <Stack gap="md" style={{ height: 'calc(100vh - 100px)' }}>
                {/* Шапка чата */}
                <Paper withBorder p="sm" radius="md">
                    <Group justify="space-between">
                        <Group>
                            <ActionIcon variant="subtle" onClick={() => navigate('/dialogs')}>
                                <IconArrowLeft size={20} />
                            </ActionIcon>
                            <Avatar
                                src={user.avatar}
                                radius="xl"
                                component={Link}
                                to={`/profile/${user.username}`}
                            >
                                {user.username[0].toUpperCase()}
                            </Avatar>
                            <Title order={4}>{user.username}</Title>
                        </Group>
                    </Group>
                </Paper>

                {/* Сообщения */}
                <Box
                    ref={scrollRef}
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                    }}
                >
                    {messages.length === 0 ? (
                        <Text c="dimmed" ta="center" mt="xl">
                            Начните разговор первым 👋
                        </Text>
                    ) : (
                        messages.map((msg) => {
                            const isMine = msg.senderId === currentUser?.id;
                            return (
                                <Paper
                                    key={msg.id}
                                    p="sm"
                                    radius="md"
                                    style={{
                                        maxWidth: '75%',
                                        alignSelf: isMine ? 'flex-end' : 'flex-start',
                                        backgroundColor: isMine
                                            ? 'var(--mantine-color-blue-6)'
                                            : 'var(--mantine-color-dark-6)',
                                    }}
                                >
                                    <Text size="sm" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                        {msg.text}
                                    </Text>
                                </Paper>
                            );
                        })
                    )}
                </Box>

                {/* Поле ввода */}
                <Group gap="xs" wrap="nowrap">
                    <TextInput
                        placeholder="Введите сообщение..."
                        style={{ flex: 1 }}
                        value={text}
                        onChange={(e) => setText(e.currentTarget.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <ActionIcon
                        size="lg"
                        variant="filled"
                        onClick={handleSend}
                        loading={sendMessage.isPending}
                        disabled={!text.trim()}
                    >
                        <IconSend size={18} />
                    </ActionIcon>
                </Group>
            </Stack>
        </Container>
    );
}