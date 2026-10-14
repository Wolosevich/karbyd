const BASE = 'http://localhost:4000';
let cookie = '';

const request = async (method: string, path: string, body?: unknown) => {
    const headers: Record<string, string> = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (cookie) headers['Cookie'] = cookie;

    const res = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const setCookie = res.headers.get('set-cookie');
    if (setCookie) cookie = setCookie.split(';')[0];

    const text = await res.text();
    try {
        return { status: res.status, data: JSON.parse(text) };
    } catch {
        return { status: res.status, data: text };
    }
};

const main = async () => {
    console.log('=== 1. Логин ===');
    const login = await request('POST', '/api/auth/login', {
        email: 'test@karbyd.dev',
        password: '123456',
    });
    console.log('Статус:', login.status);

    console.log('\n=== 2. Обновление профиля ===');
    const update = await request('PATCH', '/api/users/me', {
        bio: 'Привет! Я тестирую karbyd 🚀',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=tester',
    });
    console.log('Статус:', update.status);
    console.log('Данные:', update.data);

    console.log('\n=== 3. Проверка — читаем профиль ===');
    const profile = await request('GET', '/api/users/tester');
    console.log('Статус:', profile.status);
    console.log('Данные:', JSON.stringify(profile.data, null, 2));
};

main().catch((err) => {
    console.error('Ошибка:', err);
    process.exit(1);
});