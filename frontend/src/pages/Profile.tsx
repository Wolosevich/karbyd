import { useParams } from 'react-router-dom';
import {
    Container,
    Stack,
    Group,
    Avatar,
    Title,
    Text,
    Loader,
    Center,
    Alert,
    Divider,
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import PostCard from '../components/PostCard';
import { useProfile } from '../hooks/useProfile';

export default function Profile() {
    const { username } = useParams<{ username: string }>();
    const { data, isLoading, isError } = useProfile(username || '');

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
                <Alert
                    color="red"
                    icon={<IconInfoCircle size={16} />}
                    title="Ошибка"
                >
                    Пользователь не найден
                </Alert>
            </Container>
        );
    }

    const { user, posts } = data;

    return (
        <Container size="sm" py="xl">
            <Stack gap="md">
                <Group>
                    <Avatar src={user.avatar} size={80} radius="xl">
                        {user.username[0].toUpperCase()}
                    </Avatar>
                    <div>
                        <Title order={2}>{user.username}</Title>
                        {user.bio && (
                            <Text c="dimmed" size="sm">
                                {user.bio}
                            </Text>
                        )}
                        <Text c="dimmed" size="xs" mt={4}>
                            {posts.length} {posts.length === 1 ? 'пост' : 'постов'}
                        </Text>
                    </div>
                </Group>

                <Divider />

                {posts.length === 0 ? (
                    <Alert
                        color="blue"
                        icon={<IconInfoCircle size={16} />}
                        title="Пока пусто"
                    >
                        У этого пользователя ещё нет постов.
                    </Alert>
                ) : (
                    posts.map((post) => <PostCard key={post.id} post={post} />)
                )}
            </Stack>
        </Container>
    );
}