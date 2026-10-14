import 'dotenv/config';
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import authPlugin from './plugins/auth.js';
import { authRoutes } from './routes/auth.js';
import { postRoutes } from './routes/posts.js';
import { userRoutes } from './routes/users.js';

const app = Fastify({ logger: true });

const start = async () => {
    try {
        await app.register(cors, {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            credentials: true,
        });

        await app.register(cookie);

        await app.register(authPlugin);

        await app.register(authRoutes, { prefix: '/api/auth' });

        await app.register(postRoutes, { prefix: '/api/posts' });

        await app.register(userRoutes, { prefix: '/api/users' });

        app.get('/', async () => ({ message: 'Привет от karbyd API!' }));

        await app.listen({ port: Number(process.env.PORT) || 4000, host: '0.0.0.0' });
        console.log('🚀 Сервер запущен: http://localhost:4000');
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();