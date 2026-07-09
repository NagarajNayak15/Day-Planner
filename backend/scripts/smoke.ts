import { MongoMemoryServer } from 'mongodb-memory-server';
import type { Server } from 'node:http';

let server: Server;
let base: string;

async function request(
  method: string,
  path: string,
  opts: { token?: string; cookie?: string; body?: unknown } = {}
) {
  const headers: Record<string, string> = {};
  if (opts.token) headers['Authorization'] = `Bearer ${opts.token}`;
  if (opts.cookie) headers['Cookie'] = opts.cookie;
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(base + path, {
    method,
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  const setCookie = res.headers.get('set-cookie');
  let data: any = null;
  const text = await res.text();
  if (text) data = JSON.parse(text);
  return { status: res.status, data, setCookie };
}

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error('❌ FAIL:', msg, JSON.stringify(data?.error ?? ''));
    process.exit(1);
  }
  console.log('✓', msg);
}

let data: any;

async function main() {
  process.env.JWT_ACCESS_SECRET = 'test-access';
  process.env.JWT_REFRESH_SECRET = 'test-refresh';
  process.env.NODE_ENV = 'test';

  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  console.log('Mongo URI:', uri);

  const { connectDB, disconnectDB } = await import('../src/config/db');
  const { createApp } = await import('../src/app');
  const { addDays, todayKey } = await import('../src/utils/date');

  await connectDB(uri);
  const app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(0, resolve);
  });
  base = `http://127.0.0.1:${(server.address() as any).port}/api`;

  // --- Register ---
  let r = await request('POST', '/auth/register', {
    body: { name: 'Tester', email: 'test@example.com', password: 'password123' },
  });
  assert(r.status === 201, 'register returns 201');
  const token = r.data.accessToken as string;
  assert(!!token, 'register returns access token');
  assert(!!r.setCookie, 'register sets refresh cookie');
  const registerCookie = r.setCookie!;

  // --- Me ---
  r = await request('GET', '/auth/me', { token });
  assert(r.status === 200 && r.data.user.email === 'test@example.com', 'me returns user');

  // --- Refresh ---
  r = await request('POST', '/auth/refresh', { cookie: registerCookie });
  assert(r.status === 200 && !!r.data.accessToken, 'refresh returns new access token');

  // --- Create 2 habits ---
  r = await request('POST', '/habits', { token, body: { title: 'Exercise' } });
  assert(r.status === 201, 'create habit 1');
  const h1 = r.data.habit.id;
  r = await request('POST', '/habits', { token, body: { title: 'Read', isActive: true } });
  assert(r.status === 201, 'create habit 2');
  const h2 = r.data.habit.id;

  // --- Complete both for YESTERDAY (first streak day) ---
  const y = addDays(todayKey(), -1);
  await request('POST', `/habits/${h1}/complete`, { token, body: { date: y } });
  r = await request('POST', `/habits/${h2}/complete`, { token, body: { date: y } });
  r = await request('GET', '/stats', { token });
  assert(r.data.stats.streak.current === 1, 'streak = 1 after first successful day');
  assert(r.data.stats.streak.lastStreakDate === y, 'lastStreakDate = yesterday');

  // --- Complete both for TODAY (should increment to 2) ---
  const t = todayKey();
  await request('POST', `/habits/${h1}/complete`, { token, body: { date: t } });
  await request('POST', `/habits/${h2}/complete`, { token, body: { date: t } });
  r = await request('GET', '/stats', { token });
  assert(r.data.stats.streak.current === 2, 'streak increments to 2 (consecutive)');
  assert(r.data.stats.streak.lastStreakDate === t, 'lastStreakDate = today');

  // --- Completing again same day does NOT double count ---
  await request('POST', `/habits/${h1}/complete`, { token, body: { date: t } });
  r = await request('GET', '/stats', { token });
  assert(r.data.stats.streak.current === 2, 'no double count for same day');

  // --- Pause one habit, day should still be completable? (toggle) ---
  r = await request('PATCH', `/habits/${h1}/toggle`, { token });
  assert(r.data.habit.isActive === false, 'habit toggled inactive');

  // --- Tasks ---
  r = await request('POST', '/tasks', {
    token,
    body: { title: 'Meeting', date: t, priority: 'High' },
  });
  assert(r.status === 201, 'create task');
  const taskId = r.data.task.id;
  r = await request('PATCH', `/tasks/${taskId}/complete`, { token, body: { completed: true } });
  assert(r.data.task.completed === true, 'complete task');
  r = await request('GET', '/tasks', { token, });
  assert(r.data.tasks.length === 1, 'list tasks');

  // --- Validation rejects bad input ---
  r = await request('POST', '/habits', { token, body: { title: '' } });
  assert(r.status === 400, 'validation rejects empty habit title');
  r = await request('POST', '/auth/register', { body: { email: 'bad' } });
  assert(r.status === 400, 'validation rejects bad register');

  // --- Cleanup ---
  await disconnectDB();
  await new Promise<void>((resolve) => server.close(() => resolve()));
  await mongod.stop();
  console.log('\n🎉 All smoke tests passed.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
