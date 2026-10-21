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
    xs: "0.85rem", // было 0.75rem (мелкий текст, подписи)
    sm: "0.95rem", // было 0.875rem (текст в постах, диалогах)
    md: "1.1rem", // было 1rem (базовый текст)
    lg: "1.25rem", // было 1.125rem (крупный текст)
    xl: "1.4rem", // было 1.25rem (заголовки)
  },
  colors: {
    dark: [
      "#C1C2C5", // dark-0 (текст)
      "#A6A7AB", // dark-1
      "#909296", // dark-2
      "#5c5f66", // dark-3
      "#37414B", // dark-4 (границы, разделители) - добавили синевы
      "#2C3644", // dark-5 (hover-эффекты) - глубокий синий
      "#1E2732", // dark-6 (фон карточек, полей ввода)
      "#15202B", // dark-7 (основной фон страницы) - как в Twitter
      "#101923", // dark-8 (очень тёмный фон)
      "#0B131C", // dark-9 (самый тёмный)
    ],
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
