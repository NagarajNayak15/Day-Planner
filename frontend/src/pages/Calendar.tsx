import { useMemo, useState } from 'react';
import { useHabitHistory } from '@/hooks/useHabits';
import { useTasks } from '@/hooks/useTasks';
import { HabitChecklist } from '@/components/habits/HabitChecklist';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Card, CardHeader, Badge, Skeleton, EmptyState } from '@/components/ui/Feedback';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import {
  todayKey,
  monthMatrix,
  monthOf,
  formatMonthYear,
  WEEKDAYS,
  keyToDate,
  toKey,
} from '@/lib/date';

function addMonths(key: string, n: number): string {
  const d = keyToDate(monthOf(key));
  d.setUTCMonth(d.getUTCMonth() + n);
  return toKey(d);
}

export function Calendar() {
  const [viewKey, setViewKey] = useState(monthOf(todayKey()));
  const [selected, setSelected] = useState(todayKey());
  const [taskFormOpen, setTaskFormOpen] = useState(false);

  const cells = useMemo(() => monthMatrix(viewKey), [viewKey]);
  const from = cells[0].key;
  const to = cells[cells.length - 1].key;
  const { data: history } = useHabitHistory(from, to);
  const { data: tasks } = useTasks({ date: selected });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewKey(addMonths(viewKey, -1))}>
            ←
          </Button>
          <span className="w-40 text-center font-semibold">{formatMonthYear(viewKey)}</span>
          <Button variant="outline" size="sm" onClick={() => setViewKey(addMonths(viewKey, 1))}>
            →
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell) => {
              const stat = history?.days[cell.key];
              const active = selected === cell.key;
              return (
                <button
                  key={cell.key}
                  onClick={() => setSelected(cell.key)}
                  className={cn(
                    'flex aspect-square flex-col items-center justify-center rounded-lg border text-sm transition-colors',
                    !cell.inMonth && 'opacity-35',
                    active
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-slate-200 hover:border-indigo-300 dark:border-slate-800 dark:hover:border-indigo-700',
                    cell.isToday && !active && 'ring-2 ring-indigo-400'
                  )}
                >
                  <span>{Number(cell.key.slice(8, 10))}</span>
                  {stat?.allComplete && (
                    <span className={cn('mt-0.5 text-xs', active ? 'text-white' : 'text-emerald-500')}>
                      ★
                    </span>
                  )}
                  {stat && !stat.allComplete && stat.totalActive > 0 && (
                    <span className="mt-0.5 text-[10px] text-slate-400">
                      {stat.completedActive}/{stat.totalActive}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="text-emerald-500">★</span> All habits complete
            </span>
            <span>
              <span className="font-medium text-slate-700 dark:text-slate-200">{history?.days ? Object.keys(history.days).length : 0}</span> days shown
            </span>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Habits"
              subtitle={formatMonthYear(selected)}
              action={history?.days[selected]?.allComplete ? <Badge variant="success">Done</Badge> : undefined}
            />
            <HabitChecklist date={selected} />
          </Card>

          <Card>
            <CardHeader
              title="Tasks"
              subtitle={formatMonthYear(selected)}
              action={
                <Button size="sm" onClick={() => setTaskFormOpen(true)}>
                  + Add
                </Button>
              }
            />
            {!tasks ? (
              <Skeleton className="h-20" />
            ) : tasks.length === 0 ? (
              <EmptyState title="No tasks this day" icon="📝" />
            ) : (
              <TaskList
                tasks={tasks}
                onEdit={() => undefined}
                showDate={false}
              />
            )}
          </Card>
        </div>
      </div>

      <TaskForm
        open={taskFormOpen}
        onClose={() => setTaskFormOpen(false)}
        defaultDate={selected}
      />
    </div>
  );
}
