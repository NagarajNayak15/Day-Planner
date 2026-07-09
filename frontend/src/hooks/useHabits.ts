import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { habitApi } from '@/lib/api';
import type { Habit } from '@/types';

export const habitKeys = {
  all: ['habits'] as const,
  history: (from: string, to: string) => ['habit-history', from, to] as const,
};

export function useHabits() {
  return useQuery({
    queryKey: habitKeys.all,
    queryFn: async () => (await habitApi.list()).habits,
  });
}

export function useCompletions(date: string) {
  return useQuery({
    queryKey: ['habit-completions', date],
    queryFn: () => habitApi.completions(date),
    enabled: !!date,
  });
}

export function useHabitHistory(from: string, to: string) {
  return useQuery({
    queryKey: habitKeys.history(from, to),
    queryFn: () => habitApi.history({ from, to }),
    enabled: !!from && !!to,
  });
}

export function useCreateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Habit> & { title: string }) => habitApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: habitKeys.all }),
  });
}

export function useUpdateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Habit> }) =>
      habitApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: habitKeys.all }),
  });
}

export function useToggleHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => habitApi.toggle(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: habitKeys.all });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useDeleteHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => habitApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: habitKeys.all }),
  });
}

export function useCompleteHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date, completed }: { id: string; date?: string; completed?: boolean }) =>
      habitApi.complete(id, { date, completed }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: habitKeys.all });
      qc.invalidateQueries({ queryKey: ['stats'] });
      qc.invalidateQueries({ queryKey: ['habit-history'] });
      qc.invalidateQueries({ queryKey: ['habit-completions'] });
    },
  });
}
