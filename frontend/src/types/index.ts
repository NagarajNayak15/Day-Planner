export interface User {
  id: string;
  name: string;
  email: string;
  currentStreak: number;
  longestStreak: number;
  lastStreakDate: string | null;
  createdAt: string;
}

export interface Habit {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  completedAt: string | null;
}

export type Priority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string | null;
  priority: Priority;
  completed: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface DayStat {
  date: string;
  totalActive: number;
  completedActive: number;
  allComplete: boolean;
}

export interface HabitHistory {
  habits: { id: string; title: string; isActive: boolean }[];
  from: string;
  to: string;
  days: Record<string, DayStat>;
}

export interface Stats {
  streak: {
    current: number;
    longest: number;
    lastStreakDate: string | null;
  };
  today: {
    habits: { total: number; completed: number; progress: number };
    tasks: { total: number; completed: number; pending: number };
  };
  weekly: {
    days: DayStat[];
    completedDays: number;
    percentage: number;
  };
  monthly: {
    completedDays: number;
    elapsedDays: number;
    totalDaysInMonth: number;
    percentage: number;
  };
  tasks: { total: number; completed: number; pending: number };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
