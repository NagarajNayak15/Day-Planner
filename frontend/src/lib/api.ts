import type {
  User,
  Habit,
  HabitCompletion,
  HabitHistory,
  Task,
  Stats,
} from '@/types';

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

// Base URL for the API. In dev this is the relative "/api" path (served via the
// Vite proxy). For separate hosting set VITE_API_URL to the absolute backend URL
// including the "/api" prefix, e.g. https://api.example.com/api
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '/api';

export function setAccessToken(token: string | null) {
  accessToken = token;
}
export function getAccessToken() {
  return accessToken;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    this.name = 'ApiError';
  }
}

async function refreshToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (!res.ok) return null;
        const data = (await res.json()) as { accessToken: string };
        accessToken = data.accessToken;
        return data.accessToken;
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

interface RequestOptions {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  isForm?: boolean;
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const base = API_BASE + path;
  if (!params) return base;
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') search.append(k, String(v));
  });
  const qs = search.toString();
  return qs ? `${base}?${qs}` : base;
}

async function request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
  const url = buildUrl(path, opts.params);
  const headers: Record<string, string> = {};
  if (!opts.isForm) headers['Content-Type'] = 'application/json';
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const doFetch = (auth: string | null) =>
    fetch(url, {
      method,
      credentials: 'include',
      headers: auth ? { ...headers, Authorization: `Bearer ${auth}` } : headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });

  let res = await doFetch(accessToken);
  const isAuthPath = path.startsWith('/auth/');

  if (res.status === 401 && !isAuthPath) {
    const newToken = await refreshToken();
    if (newToken) res = await doFetch(newToken);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      body?.error?.message ?? `Request failed (${res.status})`,
      res.status,
      body?.error?.code,
      body?.error?.details
    );
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const api = {
  get: <T>(path: string, params?: RequestOptions['params']) => request<T>('GET', path, { params }),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, { body }),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, { body }),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, { body }),
  del: <T>(path: string) => request<T>('DELETE', path),
};

// ---- Auth ----
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<{ user: User; accessToken: string }>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<{ user: User; accessToken: string }>('/auth/login', data),
  refresh: () => api.post<{ accessToken: string }>('/auth/refresh'),
  logout: () => api.post<{ success: boolean }>('/auth/logout'),
  me: () => api.get<{ user: User }>('/auth/me'),
  updateProfile: (data: { name: string }) =>
    api.patch<{ user: User }>('/auth/me', data),
};

// ---- Habits ----
export const habitApi = {
  list: () => api.get<{ habits: Habit[] }>('/habits'),
  create: (data: Partial<Habit> & { title: string }) =>
    api.post<{ habit: Habit }>('/habits', data),
  update: (id: string, data: Partial<Habit>) =>
    api.put<{ habit: Habit }>(`/habits/${id}`, data),
  toggle: (id: string) => api.patch<{ habit: Habit }>(`/habits/${id}/toggle`),
  remove: (id: string) => api.del<{ id: string }>(`/habits/${id}`),
  complete: (id: string, data: { date?: string; completed?: boolean }) =>
    api.post<{ completion: HabitCompletion }>(`/habits/${id}/complete`, data),
  completions: (date: string) =>
    api.get<{
      date: string;
      completions: { habitId: string; completed: boolean; completedAt: string | null }[];
    }>('/habits/completions', { date }),
  history: (params: { from?: string; to?: string }) =>
    api.get<HabitHistory>('/habits/history', params),
};

// ---- Tasks ----
export const taskApi = {
  list: (params?: Record<string, string>) =>
    api.get<{ tasks: Task[] }>('/tasks', params),
  create: (data: {
    title: string;
    description?: string;
    date: string;
    time?: string | null;
    priority?: Priority;
    notes?: string;
  }) => api.post<{ task: Task }>('/tasks', data),
  update: (id: string, data: Partial<Task>) =>
    api.put<{ task: Task }>(`/tasks/${id}`, data),
  remove: (id: string) => api.del<{ id: string }>(`/tasks/${id}`),
  complete: (id: string, completed: boolean) =>
    api.patch<{ task: Task }>(`/tasks/${id}/complete`, { completed }),
};

// ---- Stats ----
export const statsApi = {
  get: () => api.get<{ stats: Stats }>('/stats'),
};

import type { Priority } from '@/types';
