# karbyd

Мини-социальная сеть — тренировочный fullstack-проект.

🌐 **Живая версия:** [karbyd.vercel.app](https://karbyd.vercel.app)

## ✨ Возможности

- 🔐 Регистрация и вход (JWT в httpOnly cookie)
- 📝 Создание и удаление постов с картинками
- ❤️ Лайки и комментарии
- 🔗 Кликабельные ссылки в тексте
- 👤 Профиль с редактированием (bio, аватар)
- 🔍 Поиск пользователей
- 📜 Пагинация ленты
- 🌙 Тёмная тема

## 🛠 Стек

**Frontend:**

- React 18 + TypeScript
- Vite
- Mantine UI
- React Router
- TanStack Query
- Axios

**Backend:**

- Node.js + Fastify
- Prisma ORM
- PostgreSQL (Supabase)
- JWT + bcrypt
- Zod

**Деплой:**

- Frontend → Vercel
- Backend → Railway
- База данных → Supabase

## 🚀 Запуск локально

### Требования

- Node.js 20+
- PostgreSQL (или аккаунт Supabase)

### 1. Клонировать репозиторий

```bash
git clone https://github.com/Wolosevich/karbyd.git
cd karbyd
```

### 2. Настроить бэкенд

```bash
cd backend
npm install
```

Создать файл `.env` в папке `backend`:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="your-secret-key"
PORT=4000
CLIENT_URL="http://localhost:5173"
```

Применить миграции и сгенерировать Prisma Client:

```bash
npx prisma migrate deploy
npx prisma generate
```

Запустить:

```bash
npm run dev
```

Бэкенд будет доступен на `http://localhost:4000`.

### 3. Настроить фронтенд

```bash
cd ../frontend
npm install
npm run dev
```

Фронтенд откроется на `http://localhost:5173`.

## 📁 Структура проекта

```
karbyd/
├── backend/
│   ├── prisma/          # Схема БД и миграции
│   └── src/
│       ├── routes/      # API-роуты
│       ├── plugins/     # JWT-плагин
│       ├── schemas/     # Zod-схемы
│       └── lib/         # Prisma Client
└── frontend/
    └── src/
        ├── api/         # HTTP-клиент
        ├── components/  # UI-компоненты
        ├── pages/       # Страницы
        ├── hooks/       # React-хуки
        └── types/       # TypeScript-типы
```

## 📄 Лицензия

MIT
