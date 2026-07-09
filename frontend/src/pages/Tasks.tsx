import { useMemo, useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Card } from '@/components/ui/Feedback';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { todayKey } from '@/lib/date';
import type { Task } from '@/types';

export function Tasks() {
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [completed, setCompleted] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (search.trim()) p.search = search.trim();
    if (priority) p.priority = priority;
    if (completed) p.completed = completed;
    return p;
  }, [search, priority, completed]);

  const { data: tasks, isLoading } = useTasks(params);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          + New Task
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs flex-1"
        />
        <Select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-36">
          <option value="">All priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </Select>
        <Select value={completed} onChange={(e) => setCompleted(e.target.value)} className="w-40">
          <option value="">All statuses</option>
          <option value="false">Pending</option>
          <option value="true">Completed</option>
        </Select>
      </div>

      <Card>
        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-12 w-full" />
            ))}
          </div>
        ) : (
          <TaskList
            tasks={tasks ?? []}
            showDate
            onEdit={(t) => {
              setEditing(t);
              setFormOpen(true);
            }}
          />
        )}
      </Card>

      <TaskForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        task={editing}
        defaultDate={todayKey()}
      />
    </div>
  );
}
