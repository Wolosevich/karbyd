import { useEffect, useRef } from "react";

// Получаем базовый URL API из переменной окружения (или localhost)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Преобразуем http://... в ws://...
const WS_URL = API_URL.replace(/^http/, "ws") + "/ws";

export function useWebSocket(
  token: string | undefined,
  onMessage: (data: any) => void,
) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!token) return;

    // Подключаемся к нашему WebSocket-серверу
    const ws = new WebSocket(`${WS_URL}?token=${token}`);

    ws.onopen = () => {
      console.log("🔌 WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        // Вызываем переданный колбэк с данными события
        onMessageRef.current(payload);
      } catch (e) {
        console.error("Failed to parse WebSocket message", e);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error", error);
    };

    // При размонтировании компонента закрываем соединение
    return () => {
      ws.close();
    };
  }, [token]);
}
