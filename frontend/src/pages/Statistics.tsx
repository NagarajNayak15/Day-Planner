import { useStats } from '@/hooks/useStats';
import { Card, CardHeader, ProgressBar, Skeleton, Badge } from '@/components/ui/Feedback';
import { formatShort } from '@/lib/date';

export function Statistics() {
  const { data: stats, isLoading } = useStats();

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Statistics</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const weekMax = Math.max(...stats.weekly.days.map((d) => d.totalActive), 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Statistics</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-400">Current Streak</p>
          <p className="mt-1 text-3xl font-bold">🔥 {stats.streak.current}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">consecutive days</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-400">Longest Streak</p>
          <p className="mt-1 text-3xl font-bold">🏆 {stats.streak.longest}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">best run</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-400">Monthly Completion</p>
          <p className="mt-1 text-3xl font-bold">{stats.monthly.percentage}%</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {stats.monthly.completedDays}/{stats.monthly.elapsedDays} days
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-400">Completed Tasks</p>
          <p className="mt-1 text-3xl font-bold">{stats.tasks.completed}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            of {stats.tasks.total} total
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Today's Progress"
          subtitle="Recurring habits"
          action={<Badge variant="indigo">{stats.today.habits.progress}%</Badge>}
        />
        <ProgressBar value={stats.today.habits.progress} />
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {stats.today.habits.completed} of {stats.today.habits.total} habits completed today ·{' '}
          {stats.today.tasks.completed} of {stats.today.tasks.total} tasks done
        </p>
      </Card>

      <Card>
        <CardHeader
          title="Weekly Habit Completion"
          subtitle={`${stats.weekly.completedDays}/7 successful days (${stats.weekly.percentage}%)`}
        />
        <div className="flex items-end justify-between gap-2 pt-2">
          {stats.weekly.days.map((d) => {
            const pct = d.totalActive === 0 ? 0 : (d.completedActive / d.totalActive) * 100;
            return (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-32 w-full items-end justify-center">
                  <div
                    className={
                      'w-full max-w-[28px] rounded-t-md transition-all ' +
                      (d.allComplete
                        ? 'bg-emerald-500'
                        : pct > 0
                        ? 'bg-indigo-400'
                        : 'bg-slate-200 dark:bg-slate-800')
                    }
                    style={{ height: `${Math.max(pct, 4)}%` }}
                    title={`${d.completedActive}/${d.totalActive} habits`}
                  />
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {formatShort(d.date)}
                </span>
                <span className="text-[10px] font-medium">{d.completedActive}/{d.totalActive}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-slate-400">Bar height scaled to {weekMax} active habits.</p>
      </Card>
    </div>
  );
}
