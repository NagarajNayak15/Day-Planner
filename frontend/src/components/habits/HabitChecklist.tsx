import { useMemo } from 'react';
import { useHabits, useCompletions, useCompleteHabit } from '@/hooks/useHabits';
import { Checkbox, Skeleton, EmptyState } from '@/components/ui/Feedback';
import { cn } from '@/lib/cn';

export function HabitChecklist({ date }: { date: string }) {
  const { data: habits, isLoading } = useHabits();
  const { data: completions } = useCompletions(date);
  const complete = useCompleteHabit();

  const completedMap = useMemo(() => {
    const m = new Map<string, boolean>();
    (completions?.completions ?? []).forEach((c) => m.set(c.habitId, c.completed));
    return m;
  }, [completions]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  const active = habits?.filter((h) => h.isActive) ?? [];
  const inactive = habits?.filter((h) => !h.isActive) ?? [];

  if (active.length === 0) {
    return (
      <EmptyState
        title="No active habits"
        description="Add recurring habits in Settings to start building your streak."
        icon="⚙️"
      />
    );
  }

  const allDone = active.every((h) => completedMap.get(h.id));

  return (
    <div className="space-y-2">
      {allDone && (
        <div className="mb-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          🎉 All habits done for this day — streak secured!
        </div>
      )}
      {active.map((h) => {
        const done = !!completedMap.get(h.id);
        return (
          <div
            key={h.id}
            className={cn(
              'flex items-center gap-3 rounded-lg border px-3 py-2.5',
              done
                ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-900/20'
                : 'border-slate-200 dark:border-slate-800'
            )}
          >
            <Checkbox
              checked={done}
              onChange={(v) => complete.mutate({ id: h.id, date, completed: v })}
            />
            <div className="min-w-0 flex-1">
              <p className={cn('truncate text-sm font-medium', done && 'line-through opacity-70')}>
                {h.title}
              </p>
              {h.description && (
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {h.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
      {inactive.length > 0 && (
        <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-800">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Paused
          </p>
          {inactive.map((h) => (
            <div
              key={h.id}
              className="flex items-center gap-3 rounded-lg px-3 py-2 opacity-60"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md border-2 border-slate-300 dark:border-slate-600">
                ⏸
              </span>
              <p className="truncate text-sm font-medium">{h.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
