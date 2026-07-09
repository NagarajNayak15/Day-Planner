# Day Planner

A modern, full-stack **Day Planner** web application that helps you plan your day by combining **scheduled tasks** with **recurring daily habits**. Your streak is driven **only by recurring habits** — planned tasks don't affect it.

![stack](https://img.shields.io/badge/React%2019-61dafb) ![stack](https://img.shields.io/badge/Express%20%2B%20MongoDB-4ea94b) ![stack](https://img.shields.io/badge/TypeScript-3178c6)

---

## Features

- **JWT Authentication** — access + refresh tokens (httpOnly cookie), bcrypt password hashing, rate-limited auth endpoints, protected API routes.
- **Dashboard** — today's date, recurring habits, planned tasks, completion progress, current & longest streaks.
- **Two task types**
  - *Recurring daily habits* (Exercise, Drink Water, Read…) — created once, appear every day, drive the streak.
  - *Planned tasks* (appointments, meetings…) — scheduled for a specific date with optional time & priority.
- **Streak system** based solely on habits: a day counts only when **every active habit is completed**.
- **Calendar** — month view, navigate months, select a day, mark habits & tasks complete, see successful days (★).
- **Settings** — add / edit / delete / pause habits with **drag-and-drop** reordering.
- **Tasks** — full CRUD, search, filter by priority & status, priorities (Low/Medium/High), notes.
- **Statistics** — current/longest streak, today's habit progress, weekly & monthly completion, completed tasks.
- **Profile** — account info + **export your data** (JSON).
- **Responsive UI** with **light/dark theme**, loading skeletons, empty states, toasts, and confirmation dialogs.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, React Router, TanStack Query, React Hook Form, Zod, Zustand, dnd-kit |
| Backend | Node.js, Express, TypeScript, Mongoose |
| Database | MongoDB |
| Auth | JWT (access + refresh), bcrypt |

---

## Project Structure

```
day_planer/
├── backend/            # Express + MongoDB + Mongoose API
│   ├── src/
│   │   ├── config/    # env, db
│   │   ├── models/     # User, Habit, Task, HabitCompletion
│   │   ├── middleware/ # auth, validate (Zod), errorHandler, rateLimit
│   │   ├── services/   # auth, habit, task, streak, stats
│   │   ├── controllers/ # request handlers
│   │   ├── routes/     # express routers
│   │   ├── utils/      # jwt, ApiError, date, asyncHandler
│   │   ├── validations/# Zod schemas
│   │   ├── seed.ts      # sample data
│   │   └── index.ts    # entry
│   ├── scripts/smoke.ts# in-memory integration test
├── frontend/           # React SPA
│   └── src/
│       ├── components/  # ui/, layout/, habits/, tasks/
│       ├── context/     # AuthContext
│       ├── hooks/       # useHabits, useTasks, useStats
│       ├── lib/         # api client, queryClient, date, cn
│       ├── pages/       # Login, Register, Dashboard, Calendar, Tasks, Statistics, Settings, Profile
│       ├── store/       # theme, toast (Zustand)
│       └── types/
└── README.md
```

---

## Getting Started (Local, no Docker)

### Prerequisites
- Node.js 18+
- A running MongoDB instance (local `mongod` or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Backend
```bash
cd backend
cp .env.example .env        # edit MONGO_URI + JWT secrets
npm install
npm run dev                 # http://localhost:5000
```
Seed sample data (creates `demo@example.com` / `password123` with a 5-day streak):
```bash
npm run seed
```

### 2. Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```
The Vite dev server proxies `/api` → `http://localhost:5000`, so cookies & CORS work on `localhost`.

> Since the backend and frontend are hosted **separately**, point the frontend at your backend with `VITE_API_URL` (defaults to `/api` in dev via the Vite proxy). Set the backend's `CLIENT_ORIGIN` to your deployed frontend URL so credentialed CORS works in production.

---

## REST API

All responses are JSON. Protected routes require `Authorization: Bearer <accessToken>`. Refresh uses an httpOnly cookie.

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | – | Register |
| POST | `/api/auth/login` | – | Login (sets refresh cookie) |
| POST | `/api/auth/refresh` | cookie | Issue new access token |
| POST | `/api/auth/logout` | cookie | Revoke refresh token |
| GET  | `/api/auth/me` | ✓ | Current user |

### Habits
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/habits` | List habits (sorted) |
| POST | `/api/habits` | Create |
| PUT  | `/api/habits/:id` | Update |
| PATCH| `/api/habits/:id/toggle` | Enable/disable |
| DELETE| `/api/habits/:id` | Delete (+ history) |
| POST | `/api/habits/:id/complete` | Mark complete/incomplete for a date |
| GET  | `/api/habits/completions?date=` | Per-habit completions for a date |
| GET  | `/api/habits/history?from=&to=` | Daily completion summary |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/tasks?date=&priority=&completed=&search=` | List/filter |
| POST | `/api/tasks` | Create |
| PUT  | `/api/tasks/:id` | Update |
| DELETE| `/api/tasks/:id` | Delete |
| PATCH| `/api/tasks/:id/complete` | Toggle complete |

### Statistics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/stats` | Dashboard statistics |

---

## Streak Algorithm

A day is **successful** only when **every active recurring habit** is completed (planned tasks are ignored).

When the last active habit for a day is completed:

1. Check that all active habits are completed for that day.
2. If yes:
   - If **no previous successful day** → `currentStreak = 1`
   - If the previous successful day was **yesterday** → `currentStreak += 1`
   - Otherwise (a gap) → `currentStreak = 1`
3. Update `longestStreak` if exceeded.
4. Set `lastStreakDate = today`.
5. **Never increments twice for the same day** (guarded by `lastStreakDate`).

---

## Testing

A smoke test boots an in-memory MongoDB and exercises auth, habits, tasks, validation, and the streak rules end-to-end:

```bash
cd backend
npm test
```

---

## Deployment (Backend & Frontend hosted separately)

### Backend
```bash
cd backend
npm install
npm run build          # compiles src/ -> dist/
cp .env.example .env   # set MONGO_URI, JWT secrets, CLIENT_ORIGIN
NODE_ENV=production node dist/index.js
```
- Set `CLIENT_ORIGIN` to your deployed frontend URL (comma-separated for multiple).
- The API listens on `PORT` (default `5000`).
- Host anywhere that runs Node (Railway, Render, Fly.io, a VM, …). Use a process manager (PM2) or the platform's runner.

### Frontend
```bash
cd frontend
npm install
VITE_API_URL=https://your-backend.example.com/api npm run build
# Serve the generated dist/ with any static host (Vercel, Netlify, GitHub Pages, S3, …)
```
- `VITE_API_URL` is read at build time. If omitted, requests use the same origin (set it to the absolute backend URL when hosted separately).
- For client-side routing on static hosts, add an SPA fallback (rewrite all paths to `index.html`).

---

## Environment Variables (backend)

| Name | Description | Default |
|------|-------------|---------|
| `PORT` | API port | `5000` |
| `NODE_ENV` | `development` / `production` | `development` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/dayplanner` |
| `JWT_ACCESS_SECRET` | Access token secret | – |
| `JWT_REFRESH_SECRET` | Refresh token secret | – |
| `JWT_ACCESS_EXPIRES_IN` | Access token TTL | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL | `7d` |
| `CLIENT_ORIGIN` | CORS allowed origin(s), comma-separated | `http://localhost:5173` |
| `AUTH_RATE_LIMIT_MAX` | Max auth attempts / window | `10` |
| `AUTH_RATE_LIMIT_WINDOW_MS` | Rate-limit window | `600000` |
| `FRONTEND_DIST` | Built SPA dir (prod static serving) | `../../frontend/dist` |

---

## Security

- Passwords hashed with **bcrypt** (cost 12).
- **JWT** access (short-lived) + refresh (httpOnly, `secure` in prod, rotating).
- **Helmet**, **CORS** (credentialed), **rate limiting** on auth endpoints.
- All request bodies validated with **Zod** on the server — never trust the client.
