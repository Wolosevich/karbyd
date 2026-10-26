import { Link } from "react-router-dom";
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  SimpleGrid,
  Paper,
  Stack,
  Box,
  Center,
  useMantineColorScheme,
} from "@mantine/core";
import { IconPhoto, IconUsers, IconBell, IconHeart } from "@tabler/icons-react";
import classes from "./Landing.module.css";

export default function Landing() {
  // Получаем текущую тему, чтобы адаптировать цвета
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  const features = [
    {
      icon: <IconPhoto size={32} color="var(--mantine-color-blue-4)" />,
      title: "Посты с картинками",
      description:
        "Делись фотографиями и мыслями. Загружай изображения прямо с устройства.",
    },
    {
      icon: <IconUsers size={32} color="var(--mantine-color-teal-4)" />,
      title: "Подписки",
      description:
        "Следи за интересными людьми. Настраивай ленту так, как удобно тебе.",
    },
    {
      icon: <IconHeart size={32} color="var(--mantine-color-red-4)" />,
      title: "Лайки и комментарии",
      description: "Поддерживай авторов и общайся в комментариях под постами.",
    },
    {
      icon: <IconBell size={32} color="var(--mantine-color-yellow-4)" />,
      title: "Уведомления",
      description:
        "Узнавай первым, когда кто-то лайкнул тебя или подписался на твой профиль.",
    },
  ];

  // Общие стили для стеклянных карточек
  const glassStyle = {
    background: isDark ? "rgba(30, 39, 50, 0.5)" : "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: isDark
      ? "1px solid rgba(255, 255, 255, 0.1)"
      : "1px solid rgba(255, 255, 255, 0.5)",
  };

  return (
    // Общий градиентный фон для всей страницы (как на логине)
    <Box
      style={{
        minHeight: "100vh",
        background: isDark
          ? "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)"
          : "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
      }}
    >
      {/* Верхняя часть (Hero) */}
      <Box py={100}>
        <Container size="md">
          <Stack align="center" gap="lg">
            <Title
              order={1}
              c="var(--mantine-color-text)" // Белый текст для тёмной темы
              style={{
                fontSize: "clamp(2.5rem, 8vw, 4.5rem)",
                fontWeight: 900,
                lineHeight: 1.1,
                textAlign: "center",
              }}
            >
              Добро пожаловать в{" "}
              <Text
                span
                variant="gradient"
                gradient={{ from: "blue.4", to: "teal.4", deg: 45 }}
                inherit
              >
                KaRByD
              </Text>
            </Title>

            <Text size="xl" c="var(--mantine-color-text)" ta="center" maw={600}>
              Мини-социальная сеть для общения, обмена фотографиями и новых
              знакомств. Присоединяйся к сообществу!
            </Text>

            <Group mt="xl">
              <Button
                component={Link}
                to="/login"
                size="lg"
                radius="md"
                variant="gradient"
                gradient={{ from: "blue", to: "teal" }}
              >
                Войти или зарегистрироваться
              </Button>
            </Group>
          </Stack>
        </Container>
      </Box>

      {/* Блок с фичами */}
      <Box py={80}>
        <Container size="md">
          <Title order={2} ta="center" mb={50} c="var(--mantine-color-text)">
            Всё, что нужно для общения
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
            {features.map((f, i) => (
              <Paper
                key={i}
                p="xl"
                radius="lg"
                className={classes.featureCard}
                style={glassStyle}
              >
                <Group mb="md">
                  {f.icon}
                  <Text c="dimmed">{f.description}</Text>
                </Group>
                <Text c="dimmed">{f.description}</Text>
              </Paper>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Подвал */}
      <Center
        py="xl"
        style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}
      >
        <Text c="dimmed" size="sm">
          © {new Date().getFullYear()} KaRByD. Сделано для друзей.
        </Text>
      </Center>
    </Box>
  );
}
