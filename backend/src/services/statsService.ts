import { Habit } from '../models/Habit';
import { HabitCompletion } from '../models/HabitCompletion';
import { Task } from '../models/Task';
import { User } from '../models/User';
import { todayKey, addDays, startOfMonth, daysInMonth, diffInDays } from '../utils/date';

export const statsService = {
  async getStats(userId: string) {
    const user = await User.findById(userId);
    if (!user) return null;

    const today = todayKey();

    // --- Today's habits ---
    const activeHabits = await Habit.find({ userId, isActive: true }).lean();
    const todayCompletions = await HabitCompletion.find({
      userId,
      date: today,
      habitId: { $in: activeHabits.map((h) => h._id) },
      completed: true,
    }).lean();
    const completedHabitIds = new Set(todayCompletions.map((c) => c.habitId.toString()));
    const habitsCompletedToday = activeHabits.filter((h) =>
      completedHabitIds.has(h._id.toString())
    ).length;
    const habitsTotal = activeHabits.length;
    const todayHabitProgress =
      habitsTotal === 0 ? 0 : Math.round((habitsCompletedToday / habitsTotal) * 100);

    // --- Today's tasks ---
    const todayTasks = await Task.find({ userId, date: today }).lean();
    const tasksCompletedToday = todayTasks.filter((t) => t.completed).length;
    const tasksTotalToday = todayTasks.length;

    // --- Weekly habit completion (last 7 days inclusive of today) ---
    const weekStart = addDays(today, -6);
    const weekCompletions = await HabitCompletion.find({
      userId,
      date: { $gte: weekStart, $lte: today },
      completed: true,
    }).lean();
    const completionsByDate = new Map<string, Set<string>>();
    for (const c of weekCompletions) {
      if (!completionsByDate.has(c.date)) completionsByDate.set(c.date, new Set());
      completionsByDate.get(c.date)!.add(c.habitId.toString());
    }
    const weeklyDays = [];
    let weeklyCompletedDays = 0;
    let cursor = weekStart;
    while (cursor <= today) {
      const completed = completionsByDate.get(cursor) ?? new Set();
      const completedCount = activeHabits.filter((h) =>
        completed.has(h._id.toString())
      ).length;
      const allComplete = habitsTotal > 0 && completedCount === habitsTotal;
      if (allComplete) weeklyCompletedDays += 1;
      weeklyDays.push({
        date: cursor,
        totalActive: habitsTotal,
        completedActive: completedCount,
        allComplete,
      });
      cursor = addDays(cursor, 1);
    }
    const weeklyPercentage = Math.round((weeklyCompletedDays / 7) * 100);

    // --- Monthly habit completion percentage (so far this month) ---
    const monthStart = startOfMonth(today);
    const elapsedDays = diffInDays(today, monthStart) + 1; // includes today
    const monthCompletions = await HabitCompletion.find({
      userId,
      date: { $gte: monthStart, $lte: today },
      completed: true,
    }).lean();
    const monthByDate = new Map<string, Set<string>>();
    for (const c of monthCompletions) {
      if (!monthByDate.has(c.date)) monthByDate.set(c.date, new Set());
      monthByDate.get(c.date)!.add(c.habitId.toString());
    }
    let monthlyCompletedDays = 0;
    let m = monthStart;
    while (m <= today) {
      const completed = monthByDate.get(m) ?? new Set();
      const completedCount = activeHabits.filter((h) =>
        completed.has(h._id.toString())
      ).length;
      if (habitsTotal > 0 && completedCount === habitsTotal) monthlyCompletedDays += 1;
      m = addDays(m, 1);
    }
    const totalDaysInMonth = daysInMonth(today);
    const monthlyPercentage = Math.round((monthlyCompletedDays / elapsedDays) * 100);

    // --- Overall planned tasks ---
    const allTasks = await Task.find({ userId }).lean();
    const tasksCompleted = allTasks.filter((t) => t.completed).length;

    return {
      streak: {
        current: user.currentStreak,
        longest: user.longestStreak,
        lastStreakDate: user.lastStreakDate,
      },
      today: {
        habits: {
          total: habitsTotal,
          completed: habitsCompletedToday,
          progress: todayHabitProgress,
        },
        tasks: {
          total: tasksTotalToday,
          completed: tasksCompletedToday,
          pending: tasksTotalToday - tasksCompletedToday,
        },
      },
      weekly: {
        days: weeklyDays,
        completedDays: weeklyCompletedDays,
        percentage: weeklyPercentage,
      },
      monthly: {
        completedDays: monthlyCompletedDays,
        elapsedDays,
        totalDaysInMonth,
        percentage: monthlyPercentage,
      },
      tasks: {
        total: allTasks.length,
        completed: tasksCompleted,
        pending: allTasks.length - tasksCompleted,
      },
    };
  },
};
