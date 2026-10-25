import { WebSocket } from "ws";

// Здесь мы будем хранить всех подключенных пользователей.
// Ключ — это ID пользователя, а значение — массив его открытых вкладок/устройств.
const clients = new Map<string, Set<WebSocket>>();

// Добавить новое соединение
export function addClient(userId: string, socket: WebSocket) {
  if (!clients.has(userId)) {
    clients.set(userId, new Set());
  }
  clients.get(userId)!.add(socket);
  console.log(
    `🟢 User ${userId} connected via WebSocket. Total devices: ${clients.get(userId)!.size}`,
  );
}

// Удалить соединение (когда пользователь закрывает вкладку)
export function removeClient(userId: string, socket: WebSocket) {
  const userSockets = clients.get(userId);
  if (userSockets) {
    userSockets.delete(socket);
    if (userSockets.size === 0) {
      clients.delete(userId);
    }
  }
  console.log(`🔴 User ${userId} disconnected.`);
}

// Отправить событие конкретному пользователю
export function sendToUser(userId: string, event: string, data: unknown) {
  const userSockets = clients.get(userId);
  if (userSockets) {
    const message = JSON.stringify({ event, data });
    userSockets.forEach((socket) => {
      // Проверяем, что сокет открыт, прежде чем отправлять
      if (socket.readyState === 1) {
        socket.send(message);
      }
    });
  }
}
