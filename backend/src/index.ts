import 'dotenv/config';
import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

async function start() {
  await connectDB();
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`Day Planner API listening on http://localhost:${env.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
