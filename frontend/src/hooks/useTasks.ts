import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '@/lib/api';
import type { Task, Priority } from '@/types';

export const taskKeys = {
  all: ['tasks'] as const,
  list: (params: Record<string, string>) => ['tasks', params] as const,
};

export function useTasks(params: Record<string, string> = {}) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: async () => (await taskApi.list(params)).tasks,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      date: string;
      time?: string | null;
      priority?: Priority;
      notes?: string;
    }) => taskApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) =>
      taskApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taskApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

export function useCompleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      taskApi.complete(id, completed),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.all });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
