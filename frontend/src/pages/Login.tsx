import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Box,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const navigate = useNavigate();
  const { login, register } = useAuth();

  // Получаем текущую тему
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  const form = useForm({
    initialValues: { email: "", username: "", password: "" },
    validate: {
      email: (v) => (/^\S+@\S+$/.test(v) ? null : "Некорректный email"),
      password: (v) => (v.length >= 6 ? null : "Минимум 6 символов"),
      username: (v) =>
        mode === "register" && v.length < 3 ? "Минимум 3 символа" : null,
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      if (mode === "login") {
        await login.mutateAsync({
          email: values.email,
          password: values.password,
        });
      } else {
        await register.mutateAsync(values);
      }
      notifications.show({
        message: mode === "login" ? "Успешный вход!" : "Регистрация успешна!",
        color: "green",
      });
      navigate("/");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      notifications.show({
        title: "Ошибка",
        message: error.response?.data?.error || "Что-то пошло не так",
        color: "red",
      });
    }
  });

  const isLoading = login.isPending || register.isPending;

  return (
    // Фон с красивым градиентом, который меняется в зависимости от темы
    <Box
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <Container size="xs" w="100%">
        <Paper
          p="xl"
          radius="lg"
          // Стили для эффекта матового стекла
          style={{
            background: isDark
              ? "rgba(30, 39, 50, 0.6)"
              : "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(16px)", // Размытие фона
            WebkitBackdropFilter: "blur(16px)", // Для Safari
            border: isDark
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(255, 255, 255, 0.5)",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.2)",
          }}
        >
          <Title order={2} mb="md" ta="center" fw={800}>
            {mode === "login" ? "Вход в karbyd" : "Регистрация"}
          </Title>

          <form onSubmit={handleSubmit}>
            <Stack>
              <TextInput
                label="Email"
                placeholder="you@example.com"
                required
                variant="default"
                {...form.getInputProps("email")}
              />

              {mode === "register" && (
                <TextInput
                  label="Username"
                  placeholder="username"
                  required
                  variant="default"
                  {...form.getInputProps("username")}
                />
              )}

              <PasswordInput
                label="Пароль"
                placeholder="••••••"
                required
                variant="default"
                {...form.getInputProps("password")}
              />

              <Button
                type="submit"
                loading={isLoading}
                fullWidth
                size="md"
                mt="sm"
              >
                {mode === "login" ? "Войти" : "Зарегистрироваться"}
              </Button>
            </Stack>
          </form>

          <Text ta="center" mt="lg" size="sm">
            {mode === "login" ? "Нет аккаунта? " : "Уже есть аккаунт? "}
            <Anchor
              component="button"
              fw={600}
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? "Зарегистрироваться" : "Войти"}
            </Anchor>
          </Text>
        </Paper>
      </Container>
    </Box>
  );
}
