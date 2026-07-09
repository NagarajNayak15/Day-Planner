import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Label, FieldError } from '@/components/ui/Input';
import { useCreateHabit, useUpdateHabit } from '@/hooks/useHabits';
import { toast } from '@/store/useToast';
import type { Habit } from '@/types';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(120),
  description: z.string().max(500).optional().default(''),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

export function HabitForm({
  open,
  onClose,
  habit,
}: {
  open: boolean;
  onClose: () => void;
  habit?: Habit | null;
}) {
  const create = useCreateHabit();
  const update = useUpdateHabit();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', isActive: true },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: habit?.title ?? '',
        description: habit?.description ?? '',
        isActive: habit?.isActive ?? true,
      });
    }
  }, [open, habit, reset]);

  const onSubmit = (values: FormValues) => {
    if (habit) {
      update.mutate(
        { id: habit.id, data: values },
        {
          onSuccess: () => {
            toast.success('Habit updated');
            onClose();
          },
          onError: (e) => toast.error((e as Error).message),
        }
      );
    } else {
      create.mutate(values, {
        onSuccess: () => {
          toast.success('Habit created');
          onClose();
        },
        onError: (e) => toast.error((e as Error).message),
      });
    }
  };

  const loading = create.isPending || update.isPending;

  return (
    <Modal open={open} onClose={onClose} title={habit ? 'Edit Habit' : 'New Habit'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" placeholder="e.g. Exercise" {...register('title')} />
          <FieldError message={errors.title?.message} />
        </div>
        <div>
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea id="description" placeholder="A short note" {...register('description')} />
          <FieldError message={errors.description?.message} />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input type="checkbox" {...register('isActive')} className="h-4 w-4 rounded" />
          Active (counts toward streak)
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {habit ? 'Save' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
