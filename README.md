# karbyd

Мини-социальная сеть — fullstack-проект с real-time чатом, админ-панелью и PWA.

🌐 **Живая версия:** [karbyd.vercel.app](https://karbyd.vercel.app)

## ✨ Возможности

### 👤 Пользователи

- 🔐 Регистрация и вход (JWT в httpOnly cookie)
- 👤 Профиль с редактированием (bio, аватар, загрузка файла)
- 🖼️ Сжатие картинок на клиенте перед загрузкой
- 🔔 Мгновенные уведомления (WebSocket)
- 🌗 Светлая и тёмная темы
- 📱 PWA (устанавливается на телефон)
- 🔍 Поиск пользователей и постов

### 📝 Контент

- 📝 Создание, редактирование и удаление постов
- ❤️ Лайки и комментарии (с вложенными ответами)
- 🔖 Закладки (сохранённые посты)
- 🔗 Кликабельные ссылки и @упоминания
- 📸 Загрузка картинок через Supabase Storage
- 📜 Пагинация с бесконечной прокруткой

### 💬 Социальные связи

- 👥 Подписки (фолловинг)
- 📰 Лента «Все посты» и «Подписки»
- 💬 Личные сообщения (с эмодзи и файлами)
- ⚡ Мгновенный чат и уведомления через WebSocket

### 🛡️ Админ-панель

- 🚫 Бан и разбан пользователей
- 🗑️ Удаление любых постов и комментариев
- ❌ Полное удаление пользователей
- 🔒 Блокировка входа для забаненных

## 🛠 Стек

**Frontend:**

- React 18 + TypeScript
- Vite
- Mantine UI
- React Router
- TanStack Query
- Axios
- Browser Image Compression
- Vite PWA Plugin

**Backend:**

- Node.js + Fastify
- Prisma ORM
- PostgreSQL (Supabase)
- JWT + bcrypt
- Zod
- WebSocket (`@fastify/websocket`)
- Rate Limiting (`@fastify/rate-limit`)
- Helmet (security headers)

**Деплой:**

- Frontend → Vercel
- Backend → Railway
- База данных → Supabase
- Хранилище файлов → Supabase Storage

## 🚀 Запуск локально

### Требования

- Node.js 20+
- PostgreSQL (или аккаунт Supabase)

### 1. Клонировать репозиторий

```bash
git clone https://github.com/Wolosevich/karbyd.git
cd karbyd
```
