import {
    Container,
    Stack,
    Title,
    Text,
    Loader,
    Center,
    Alert,
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import { useFeed } from '../hooks/usePosts';

export default function Feed() {
    const { data, isLoading, isError } = useFeed();

    return (
        <Container size="sm" py="xl">
            <Stack gap="md">
                <Title order={2}>Лента</Title>

                <PostForm />

                {isLoading && (
                    <Center py="xl">
                        <Loader />
                    </Center>
                )}

                {isError && (
                    <Alert
                        color="red"
                        icon={<IconInfoCircle size={16} />}
                        title="Ошибка загрузки"
                    >
                        Не удалось загрузить посты. Попробуйте обновить страницу.
                    </Alert>
                )}

                {data && data.items.length === 0 && (
                    <Alert
                        color="blue"
                        icon={<IconInfoCircle size={16} />}
                        title="Пока пусто"
                    >
                        Ещё никто не публиковал посты. Будьте первым!
                    </Alert>
                )}

                {data?.items.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))}

                {data && data.items.length > 0 && !data.nextCursor && (
                    <Text c="dimmed" ta="center" size="sm">
                        Это все посты на данный момент
                    </Text>
                )}
            </Stack>
        </Container>
    );
}