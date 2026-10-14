import { Textarea, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useAddComment } from '../hooks/usePosts';

export default function CommentForm({ postId }: { postId: string }) {
    const addComment = useAddComment(postId);

    const form = useForm({
        initialValues: { text: '' },
        validate: {
            text: (v) =>
                v.trim().length === 0
                    ? 'Комментарий не может быть пустым'
                    : v.length > 500
                        ? 'Максимум 500 символов'
                        : null,
        },
    });

    const handleSubmit = form.onSubmit(async (values) => {
        try {
            await addComment.mutateAsync(values.text.trim());
            form.reset();
        } catch {
            notifications.show({
                title: 'Ошибка',
                message: 'Не удалось отправить комментарий',
                color: 'red',
            });
        }
    });

    return (
        <form onSubmit={handleSubmit}>
            <Textarea
                placeholder="Написать комментарий..."
                minRows={1}
                autosize
                maxRows={4}
                {...form.getInputProps('text')}
            />
            <Group justify="flex-end" mt="xs">
                <Button
                    type="submit"
                    size="xs"
                    loading={addComment.isPending}
                    disabled={form.values.text.trim().length === 0}
                >
                    Отправить
                </Button>
            </Group>
        </form>
    );
}