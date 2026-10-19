import { Textarea, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useAddComment } from '../hooks/usePosts';

interface CommentFormProps {
    postId: string;
    parentId?: string; // Если передан — это ответ на комментарий
    onCancel?: () => void; // Функция для закрытия формы ответа
}

export default function CommentForm({ postId, parentId, onCancel }: CommentFormProps) {
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
            // Передаем объект, как теперь ждет наш хук
            await addComment.mutateAsync({
                text: values.text.trim(),
                parentId
            });
            form.reset();
            if (onCancel) onCancel(); // Закрываем форму ответа, если она была открыта
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
                placeholder={parentId ? 'Написать ответ...' : 'Написать комментарий...'}
                minRows={1}
                autosize
                maxRows={4}
                {...form.getInputProps('text')}
            />
            <Group justify="flex-end" mt="xs">
                {onCancel && (
                    <Button variant="default" size="xs" onClick={onCancel}>
                        Отмена
                    </Button>
                )}
                <Button
                    type="submit"
                    size="xs"
                    loading={addComment.isPending}
                    disabled={form.values.text.trim().length === 0}
                >
                    {parentId ? 'Ответить' : 'Отправить'}
                </Button>
            </Group>
        </form>
    );
}