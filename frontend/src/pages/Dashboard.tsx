import { useStats } from '@/hooks/useStats';
import { useTasks } from '@/hooks/useTasks';
import { HabitChecklist } from '@/components/habits/HabitChecklist';
import { TaskList } from '@/components/tasks/TaskList';
import { Card, CardHeader, ProgressBar, Skeleton } from '@/components/ui/Feedback';
import { SwipeView } from '@/components/ui/SwipeView';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { todayKey, formatLong } from '@/lib/date';
import { useState } from 'react';
import { TaskForm } from '@/components/tasks/TaskForm';
import type { Task } from '@/types';

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <Card className="flex flex-col gap-1">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </Card>
  );
}

export function Dashboard() {
  const { data: stats, isLoading } = useStats();
  const { data: tasks } = useTasks({ date: todayKey() });
  const navigate = useNavigate();
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const tKey = todayKey();

  const habitsCard = (
    <Card>
      <CardHeader
        title="Recurring Habits"
        subtitle="Complete all to keep your streak alive"
        action={
          <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
            Manage
          </Button>
        }
      />
      <HabitChecklist date={tKey} />
    </Card>
  );

  const tasksCard = (
    <Card>
      <CardHeader
        title="Planned Tasks"
        subtitle="Scheduled for today"
        action={
          <Button variant="outline" size="sm" onClick={() => navigate('/tasks')}>
            View all
          </Button>
        }
      />
      <TaskList
        tasks={tasks ?? []}
        onEdit={(t) => {
          setEditing(t);
          setTaskFormOpen(true);
        }}
      />
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Today</h1>
          <p className="text-slate-500 dark:text-slate-400">{formatLong(tKey)}</p>
        </div>
        <Button onClick={() => { setEditing(null); setTaskFormOpen(true); }}>
          + New Task
        </Button>
      </div>

      {/* Mobile: Tasks & Habits in a single swipeable window, shown first */}
      <div className="lg:hidden">
        <SwipeView
          tabs={[
            { id: 'habits', label: 'Habits', content: habitsCard },
            { id: 'tasks', label: 'Tasks', content: tasksCard },
          ]}
        />
      </div>

      {isLoading || !stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Current Streak"
            value={
              <span className="flex items-center gap-1">
                🔥 {stats.streak.current}{' '}
                <span className="text-base font-medium text-slate-400">days</span>
              </span>
            }
          />
          <StatCard label="Longest Streak" value={`${stats.streak.longest} days`} />
          <StatCard
            label="Habits Today"
            value={`${stats.today.habits.completed}/${stats.today.habits.total}`}
            hint={`${stats.today.habits.progress}% complete`}
          />
          <StatCard
            label="Tasks Today"
            value={`${stats.today.tasks.completed}/${stats.today.tasks.total}`}
            hint={`${stats.today.tasks.pending} pending`}
          />
        </div>
      )}

      {!isLoading && stats && (
        <ProgressBar value={stats.today.habits.progress} />
      )}

      {/* Desktop: side-by-side grid */}
      <div className="hidden gap-6 lg:grid lg:grid-cols-2">
        {habitsCard}
        {tasksCard}
      </div>

      <TaskForm
        open={taskFormOpen}
        onClose={() => setTaskFormOpen(false)}
        task={editing}
        defaultDate={tKey}
      />
    </div>
  );
}
