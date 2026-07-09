import { Types } from 'mongoose';
import { Task, Priority } from '../models/Task';
import { ApiError } from '../utils/apiError';
import { toDateKey, todayKey } from '../utils/date';
import {
  TaskInput,
  TaskUpdateInput,
  TaskQueryInput,
} from '../validations/schemas';

function serialize(task: InstanceType<typeof Task>) {
  return {
    id: task._id.toString(),
    title: task.title,
    description: task.description,
    date: task.date,
    time: task.time,
    priority: task.priority,
    completed: task.completed,
    notes: task.notes,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

const priorityWeight: Record<Priority, number> = { High: 3, Medium: 2, Low: 1 };

export const taskService = {
  async list(userId: string, query: TaskQueryInput) {
    const filter: Record<string, unknown> = { userId };
    if (query.date) filter.date = toDateKey(query.date);
    if (query.priority) filter.priority = query.priority;
    if (query.completed !== undefined) filter.completed = query.completed;
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ];
    }

    const sort: Record<string, 1 | -1> = {};
    const dir = query.order === 'desc' ? -1 : 1;
    if (query.sort === 'priority') {
      sort.priority = dir;
      sort.date = 1;
    } else if (query.sort === 'createdAt') {
      sort.createdAt = dir;
    } else {
      sort.date = dir;
      sort.time = 1;
    }

    const tasks = await Task.find(filter).sort(sort);
    return tasks.map(serialize);
  },

  async create(userId: string, input: TaskInput) {
    const task = await Task.create({
      userId,
      title: input.title,
      description: input.description ?? '',
      date: toDateKey(input.date),
      time: input.time ?? null,
      priority: input.priority ?? 'Medium',
      notes: input.notes ?? '',
      completed: false,
    });
    return serialize(task);
  },

  async update(userId: string, id: string, input: TaskUpdateInput) {
    if (!Types.ObjectId.isValid(id)) throw ApiError.notFound('Task not found');
    const update: Record<string, unknown> = { ...input };
    if (input.date) update.date = toDateKey(input.date);
    if (input.time === null) update.time = null;
    const task = await Task.findOneAndUpdate({ _id: id, userId }, { $set: update }, { new: true });
    if (!task) throw ApiError.notFound('Task not found');
    return serialize(task);
  },

  async remove(userId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) throw ApiError.notFound('Task not found');
    const task = await Task.findOneAndDelete({ _id: id, userId });
    if (!task) throw ApiError.notFound('Task not found');
    return { id: task._id.toString() };
  },

  async complete(userId: string, id: string, completed: boolean) {
    if (!Types.ObjectId.isValid(id)) throw ApiError.notFound('Task not found');
    const task = await Task.findOneAndUpdate(
      { _id: id, userId },
      { $set: { completed } },
      { new: true }
    );
    if (!task) throw ApiError.notFound('Task not found');
    return serialize(task);
  },

  async today(userId: string) {
    const tasks = await Task.find({ userId, date: todayKey() }).sort({ time: 1 });
    return tasks.map(serialize);
  },
};

export { priorityWeight };
