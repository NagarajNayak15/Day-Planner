import { z } from 'zod';

const dateKeyRegex = /^\d{4}-\d{2}-\d{2}$/;

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  email: z.string().trim().email('Invalid email').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
});

export const refreshSchema = z.object({}).optional();

export const habitSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120),
  description: z.string().trim().max(500).optional().default(''),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).optional(),
});

export const habitUpdateSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const habitCompleteSchema = z.object({
  date: z.string().regex(dateKeyRegex, 'Invalid date').optional(),
  completed: z.boolean().optional().default(true),
});

export const taskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(1000).optional().default(''),
  date: z.string().regex(dateKeyRegex, 'Invalid date format (YYYY-MM-DD)'),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid time (HH:MM)')
    .optional()
    .nullable(),
  priority: z.enum(['Low', 'Medium', 'High']).optional().default('Medium'),
  notes: z.string().trim().max(2000).optional().default(''),
});

export const taskUpdateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(1000).optional(),
  date: z.string().regex(dateKeyRegex, 'Invalid date format (YYYY-MM-DD)').optional(),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid time (HH:MM)')
    .optional()
    .nullable(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const taskQuerySchema = z.object({
  date: z.string().regex(dateKeyRegex, 'Invalid date').optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
  completed: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v ? v === 'true' : undefined)),
  search: z.string().trim().max(120).optional(),
  sort: z.enum(['date', 'priority', 'createdAt']).optional().default('date'),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
});

export const habitHistoryQuerySchema = z.object({
  from: z.string().regex(dateKeyRegex, 'Invalid date').optional(),
  to: z.string().regex(dateKeyRegex, 'Invalid date').optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type HabitInput = z.infer<typeof habitSchema>;
export type HabitUpdateInput = z.infer<typeof habitUpdateSchema>;
export type HabitCompleteInput = z.infer<typeof habitCompleteSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
export type HabitHistoryQueryInput = z.infer<typeof habitHistoryQuerySchema>;
