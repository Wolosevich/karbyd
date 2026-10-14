import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Title,
    TextInput,
    PasswordInput,
    Button,
    Stack,
    Anchor,
    Text,
    Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const navigate = useNavigate();
    const { login, register } = useAuth();

    const form = useForm({
        initialValues: { email: '', username: '', password: '' },
        validate: {
            email: (v) => (/^\S+@\S+$/.test(v) ? null : 'Некорректный email'),
            password: (v) => (v.length >= 6 ? null : 'Минимум 6 символов'),
            username: (v) =>
                mode === 'register' && v.length < 3 ? 'Минимум 3 символа' : null,
        },
    });

    const handleSubmit = form.onSubmit(async (values) => {
        try {
            if (mode === 'login') {
                await login.mutateAsync({
                    email: values.email,
                    password: values.password,
                });
            } else {
                await register.mutateAsync(values);
            }
            notifications.show({
                message: mode === 'login' ? 'Успешный вход!' : 'Регистрация успешна!',
                color: 'green',
            });
            navigate('/');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            notifications.show({
                title: 'Ошибка',
                message: error.response?.data?.error || 'Что-то пошло не так',
                color: 'red',
            });
        }
    });

    const isLoading = login.isPending || register.isPending;

    return (
        <Container size="xs" py="xl">
            <Paper withBorder shadow="md" p="xl" radius="md" mt="xl">
                <Title order={2} mb="md" ta="center">
                    {mode === 'login' ? 'Вход в karbyd' : 'Регистрация в karbyd'}
                </Title>

                <form onSubmit={handleSubmit}>
                    <Stack>
                        <TextInput
                            label="Email"
                            placeholder="you@example.com"
                            required
                            {...form.getInputProps('email')}
                        />

                        {mode === 'register' && (
                            <TextInput
                                label="Username"
                                placeholder="username"
                                required
                                {...form.getInputProps('username')}
                            />
                        )}

                        <PasswordInput
                            label="Пароль"
                            placeholder="••••••"
                            required
                            {...form.getInputProps('password')}
                        />

                        {form.errors.error && (
                            <Alert color="red">{form.errors.error}</Alert>
                        )}

                        <Button type="submit" loading={isLoading} fullWidth>
                            {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
                        </Button>
                    </Stack>
                </form>

                <Text ta="center" mt="md" size="sm">
                    {mode === 'login' ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
                    <Anchor
                        component="button"
                        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                    >
                        {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
                    </Anchor>
                </Text>
            </Paper>
        </Container>
    );
}