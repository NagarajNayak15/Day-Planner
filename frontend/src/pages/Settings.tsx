import { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useHabits, useToggleHabit, useDeleteHabit, useUpdateHabit } from '@/hooks/useHabits';
import { HabitForm } from '@/components/habits/HabitForm';
import { Card, CardHeader, Badge, Skeleton, EmptyState } from '@/components/ui/Feedback';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { cn } from '@/lib/cn';
import { toast } from '@/store/useToast';
import type { Habit } from '@/types';

function SortableHabitRow({
  habit,
  onEdit,
  onToggle,
  onRequestDelete,
}: {
  habit: Habit;
  onEdit: (h: Habit) => void;
  onToggle: (h: Habit) => void;
  onRequestDelete: (h: Habit) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: habit.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 dark:border-slate-800',
        isDragging && 'opacity-60 shadow-lg'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none rounded p-1 text-slate-400 hover:text-slate-600 active:cursor-grabbing dark:hover:text-slate-200"
        aria-label="Drag to reorder"
      >
        ⠿
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{habit.title}</p>
          <Badge variant={habit.isActive ? 'success' : 'default'}>
            {habit.isActive ? 'Active' : 'Paused'}
          </Badge>
        </div>
        {habit.description && (
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{habit.description}</p>
        )}
      </div>
      <button
        onClick={() => onToggle(habit)}
        className="rounded-md px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
      >
        {habit.isActive ? 'Pause' : 'Activate'}
      </button>
      <button
        onClick={() => onEdit(habit)}
        className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
        aria-label="Edit habit"
      >
        ✏️
      </button>
      <button
        onClick={() => onRequestDelete(habit)}
        className="rounded-md p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
        aria-label="Delete habit"
      >
        🗑
      </button>
    </div>
  );
}

export function Settings() {
  const { data: habits, isLoading } = useHabits();
  const toggle = useToggleHabit();
  const del = useDeleteHabit();
  const update = useUpdateHabit();

  const [order, setOrder] = useState<Habit[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [toDelete, setToDelete] = useState<Habit | null>(null);

  useEffect(() => {
    if (habits) setOrder([...habits].sort((a, b) => a.sortOrder - b.sortOrder));
  }, [habits]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = order.findIndex((h) => h.id === active.id);
    const newIndex = order.findIndex((h) => h.id === over.id);
    const next = arrayMove(order, oldIndex, newIndex);
    setOrder(next);
    next.forEach((h, idx) => {
      if (h.sortOrder !== idx) update.mutate({ id: h.id, data: { sortOrder: idx } });
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage your recurring habits (used for streaks).
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          + Add Habit
        </Button>
      </div>

      <Card>
        <CardHeader title="Habits" subtitle="Drag to reorder. Toggle to pause/resume." />
        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : order.length === 0 ? (
          <EmptyState
            title="No habits yet"
            description="Add your first recurring habit to start building a streak."
            icon="⚙️"
            action={
              <Button
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                + Add Habit
              </Button>
            }
          />
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={order.map((h) => h.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {order.map((h) => (
                  <SortableHabitRow
                    key={h.id}
                    habit={h}
                    onEdit={(habit) => {
                      setEditing(habit);
                      setFormOpen(true);
                    }}
                    onToggle={(habit) => toggle.mutate(habit.id)}
                    onRequestDelete={(habit) => setToDelete(habit)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </Card>

      <HabitForm open={formOpen} onClose={() => setFormOpen(false)} habit={editing} />

      <ConfirmDialog
        open={!!toDelete}
        title="Delete habit?"
        message={toDelete ? `"${toDelete.title}" and its history will be removed.` : ''}
        confirmLabel="Delete"
        loading={del.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          del.mutate(toDelete.id, {
            onSuccess: () => {
              toast.success('Habit deleted');
              setToDelete(null);
            },
          });
        }}
      />
    </div>
  );
}
