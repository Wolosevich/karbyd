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
} from "@mantine/core";
import { IconPhoto, IconUsers, IconBell, IconHeart } from "@tabler/icons-react";

export default function Landing() {
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

  return (
    <Box>
      {/* Верхняя часть (Hero) */}
      <Box
        style={{
          backgroundColor: "var(--mantine-color-body)", // Адаптивный фон
          borderBottom: "1px solid var(--mantine-color-default-border)",
          paddingTop: "80px",
          paddingBottom: "80px",
        }}
      >
        <Container size="md">
          <Stack align="center" gap="lg">
            <Title
              order={1}
              c="var(--mantine-color-text)" // Адаптивный цвет текста
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
                gradient={{ from: "blue", to: "teal", deg: 45 }}
                inherit
              >
                karbyd
              </Text>
            </Title>

            <Text size="xl" c="dimmed" ta="center" maw={600}>
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
          <Title order={2} ta="center" mb="xl">
            Всё, что нужно для общения
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            {features.map((f, i) => (
              <Paper key={i} p="xl" radius="md">
                <Group mb="sm">
                  {f.icon}
                  <Text fw={600} size="lg">
                    {f.title}
                  </Text>
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
          © {new Date().getFullYear()} karbyd. Сделано с ❤️ для портфолио.
        </Text>
      </Center>
    </Box>
  );
}
