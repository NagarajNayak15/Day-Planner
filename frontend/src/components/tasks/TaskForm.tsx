import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select, Label, FieldError } from '@/components/ui/Input';
import { useCreateTask, useUpdateTask } from '@/hooks/useTasks';
import { toast } from '@/store/useToast';
import { todayKey } from '@/lib/date';
import type { Task, Priority } from '@/types';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional().default(''),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date required'),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid time')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  priority: z.enum(['Low', 'Medium', 'High']).default('Medium'),
  notes: z.string().max(2000).optional().default(''),
});

type FormValues = z.infer<typeof schema>;

export function TaskForm({
  open,
  onClose,
  task,
  defaultDate,
}: {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
  defaultDate?: string;
}) {
  const create = useCreateTask();
  const update = useUpdateTask();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      date: defaultDate ?? todayKey(),
      time: '',
      priority: 'Medium',
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: task?.title ?? '',
        description: task?.description ?? '',
        date: task?.date ?? defaultDate ?? todayKey(),
        time: task?.time ?? '',
        priority: (task?.priority ?? 'Medium') as Priority,
        notes: task?.notes ?? '',
      });
    }
  }, [open, task, defaultDate, reset]);

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      time: values.time || null,
    };
    if (task) {
      update.mutate(
        { id: task.id, data: payload },
        {
          onSuccess: () => {
            toast.success('Task updated');
            onClose();
          },
          onError: (e) => toast.error((e as Error).message),
        }
      );
    } else {
      create.mutate(payload, {
        onSuccess: () => {
          toast.success('Task created');
          onClose();
        },
        onError: (e) => toast.error((e as Error).message),
      });
    }
  };

  const loading = create.isPending || update.isPending;

  return (
    <Modal open={open} onClose={onClose} title={task ? 'Edit Task' : 'New Task'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="t-title">Title</Label>
          <Input id="t-title" placeholder="e.g. Doctor Appointment" {...register('title')} />
          <FieldError message={errors.title?.message} />
        </div>
        <div>
          <Label htmlFor="t-desc">Description</Label>
          <Textarea id="t-desc" placeholder="Optional details" {...register('description')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="t-date">Date</Label>
            <Input id="t-date" type="date" {...register('date')} />
            <FieldError message={errors.date?.message} />
          </div>
          <div>
            <Label htmlFor="t-time">Time (optional)</Label>
            <Input id="t-time" type="time" {...register('time')} />
            <FieldError message={errors.time?.message} />
          </div>
        </div>
        <div>
          <Label htmlFor="t-priority">Priority</Label>
          <Select id="t-priority" {...register('priority')}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="t-notes">Notes</Label>
          <Textarea id="t-notes" placeholder="Optional notes" {...register('notes')} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {task ? 'Save' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
