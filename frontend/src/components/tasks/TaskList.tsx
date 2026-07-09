import { useState } from 'react';
import { useCompleteTask, useDeleteTask } from '@/hooks/useTasks';
import { Checkbox, Badge, EmptyState } from '@/components/ui/Feedback';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { cn } from '@/lib/cn';
import { formatShort } from '@/lib/date';
import type { Task, Priority } from '@/types';

const priorityVariant: Record<Priority, 'danger' | 'warning' | 'info'> = {
  High: 'danger',
  Medium: 'warning',
  Low: 'info',
};

export function TaskList({
  tasks,
  onEdit,
  showDate = false,
}: {
  tasks: Task[];
  onEdit: (task: Task) => void;
  showDate?: boolean;
}) {
  const complete = useCompleteTask();
  const del = useDeleteTask();
  const [toDelete, setToDelete] = useState<Task | null>(null);

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks"
        description="Plan something for the day using the button above."
        icon="📝"
      />
    );
  }

  return (
    <>
      <ul className="space-y-2">
        {tasks.map((t) => (
          <li
            key={t.id}
            className={cn(
              'flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 dark:border-slate-800',
              t.completed && 'opacity-60'
            )}
          >
            <Checkbox
              checked={t.completed}
              onChange={(v) => complete.mutate({ id: t.id, completed: v })}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className={cn('truncate text-sm font-medium', t.completed && 'line-through')}>
                  {t.title}
                </p>
                <Badge variant={priorityVariant[t.priority]}>{t.priority}</Badge>
                {showDate && (
                  <Badge variant="default">{formatShort(t.date)}</Badge>
                )}
                {t.time && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">⏰ {t.time}</span>
                )}
              </div>
              {t.description && (
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {t.description}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => onEdit(t)}
                className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                aria-label="Edit task"
              >
                ✏️
              </button>
              <button
                onClick={() => setToDelete(t)}
                className="rounded-md p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                aria-label="Delete task"
              >
                🗑
              </button>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete task?"
        message={toDelete ? `"${toDelete.title}" will be permanently removed.` : ''}
        confirmLabel="Delete"
        loading={del.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          del.mutate(toDelete.id, {
            onSuccess: () => {
              setToDelete(null);
            },
          });
        }}
      />
    </>
  );
}
