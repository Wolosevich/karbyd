import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
const theme = createTheme({
  fontSizes: {
    xs: "0.85rem",
    sm: "0.95rem",
    md: "1.1rem",
    lg: "1.25rem",
    xl: "1.4rem",
  },
  // Цвета темной темы (мы их настраивали ранее)
  colors: {
    dark: [
      "#C1C2C5",
      "#A6A7AB",
      "#909296",
      "#5c5f66",
      "#37414B",
      "#2C3644",
      "#1E2732",
      "#15202B",
      "#101923",
      "#0B131C",
    ],
  },
  primaryColor: "blue", // Задаем основной цвет для всего приложения
  defaultRadius: "md", // Все кнопки и поля ввода по умолчанию будут скруглены

  // Глобальные настройки для компонентов
  components: {
    // Карточки (посты, диалоги, формы) везде будут с рамкой и одинаковой тенью
    Paper: {
      defaultProps: {
        withBorder: true,
        shadow: "sm",
        radius: "md",
      },
    },
    // Все кнопки будут одинакового размера шрифта и скругления
    Button: {
      defaultProps: {
        radius: "md",
      },
    },
    // Поля ввода везде будут аккуратными
    TextInput: {
      defaultProps: {
        radius: "md",
      },
    },
    Textarea: {
      defaultProps: {
        radius: "md",
      },
    },
  },
});
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <MantineProvider defaultColorScheme="dark" theme={theme}>
        <Notifications position="top-right" />
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </MantineProvider>
    </HelmetProvider>
  </StrictMode>,
);
