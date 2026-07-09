import { Types } from 'mongoose';
import { Habit } from '../models/Habit';
import { HabitCompletion } from '../models/HabitCompletion';
import { ApiError } from '../utils/apiError';
import { todayKey, toDateKey, addDays } from '../utils/date';
import {
  HabitInput,
  HabitUpdateInput,
  HabitCompleteInput,
  HabitHistoryQueryInput,
} from '../validations/schemas';
import { evaluateStreak } from './streakService';

function serialize(habit: InstanceType<typeof Habit>) {
  return {
    id: habit._id.toString(),
    title: habit.title,
    description: habit.description,
    isActive: habit.isActive,
    sortOrder: habit.sortOrder,
    createdAt: habit.createdAt,
    updatedAt: habit.updatedAt,
  };
}

export const habitService = {
  async list(userId: string) {
    const habits = await Habit.find({ userId }).sort({ sortOrder: 1, createdAt: 1 });
    return habits.map(serialize);
  },

  async create(userId: string, input: HabitInput) {
    const max = await Habit.find({ userId })
      .sort({ sortOrder: -1 })
      .limit(1)
      .lean();
    const sortOrder =
      input.sortOrder ?? (max.length ? (max[0].sortOrder as number) + 1 : 0);
    const habit = await Habit.create({
      userId,
      title: input.title,
      description: input.description ?? '',
      isActive: input.isActive ?? true,
      sortOrder,
    });
    return serialize(habit);
  },

  async update(userId: string, id: string, input: HabitUpdateInput) {
    if (!Types.ObjectId.isValid(id)) throw ApiError.notFound('Habit not found');
    const habit = await Habit.findOneAndUpdate(
      { _id: id, userId },
      { $set: input },
      { new: true }
    );
    if (!habit) throw ApiError.notFound('Habit not found');
    return serialize(habit);
  },

  async toggle(userId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) throw ApiError.notFound('Habit not found');
    const habit = await Habit.findOne({ _id: id, userId });
    if (!habit) throw ApiError.notFound('Habit not found');
    habit.isActive = !habit.isActive;
    await habit.save();
    // Toggling active status may change today's completion set.
    await evaluateStreak(userId, todayKey());
    return serialize(habit);
  },

  async remove(userId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) throw ApiError.notFound('Habit not found');
    const habit = await Habit.findOneAndDelete({ _id: id, userId });
    if (!habit) throw ApiError.notFound('Habit not found');
    await HabitCompletion.deleteMany({ habitId: habit._id, userId });
    return { id: habit._id.toString() };
  },

  async complete(userId: string, id: string, input: HabitCompleteInput) {
    if (!Types.ObjectId.isValid(id)) throw ApiError.notFound('Habit not found');
    const habit = await Habit.findOne({ _id: id, userId });
    if (!habit) throw ApiError.notFound('Habit not found');

    const date = input.date ? toDateKey(input.date) : todayKey();
    const completed = input.completed ?? true;

    const completion = await HabitCompletion.findOneAndUpdate(
      { userId, habitId: habit._id, date },
      {
        $set: { completed, completedAt: completed ? new Date() : null },
        $setOnInsert: { userId, habitId: habit._id, date },
      },
      { new: true, upsert: true }
    );

    await evaluateStreak(userId, date);

    return {
      id: completion._id.toString(),
      habitId: completion.habitId.toString(),
      date: completion.date,
      completed: completion.completed,
      completedAt: completion.completedAt,
    };
  },

  async getCompletions(userId: string, date: string) {
    const completions = await HabitCompletion.find({
      userId,
      date: toDateKey(date),
    }).lean();
    return {
      date: toDateKey(date),
      completions: completions.map((c) => ({
        habitId: c.habitId.toString(),
        completed: c.completed,
        completedAt: c.completedAt,
      })),
    };
  },

  async history(userId: string, query: HabitHistoryQueryInput) {
    const to = query.to ?? todayKey();
    const from = query.from ?? addDays(to, -30);

    const habits = await Habit.find({ userId }).sort({ sortOrder: 1 }).lean();
    const completions = await HabitCompletion.find({
      userId,
      date: { $gte: from, $lte: to },
      completed: true,
    }).lean();

    const byDate = new Map<string, Set<string>>();
    for (const c of completions) {
      if (!byDate.has(c.date)) byDate.set(c.date, new Set());
      byDate.get(c.date)!.add(c.habitId.toString());
    }

    const activeHabits = habits.filter((h) => h.isActive);
    const days: Record<
      string,
      { totalActive: number; completedActive: number; allComplete: boolean }
    > = {};

    let cursor = from;
    while (cursor <= to) {
      const completed = byDate.get(cursor) ?? new Set();
      const completedActive = activeHabits.filter((h) =>
        completed.has(h._id.toString())
      ).length;
      const totalActive = activeHabits.length;
      days[cursor] = {
        totalActive,
        completedActive,
        allComplete: totalActive > 0 && completedActive === totalActive,
      };
      cursor = addDays(cursor, 1);
    }

    return {
      habits: habits.map((h) => ({
        id: h._id.toString(),
        title: h.title,
        isActive: h.isActive,
      })),
      from,
      to,
      days,
    };
  },
};

export { serialize as serializeHabit };
