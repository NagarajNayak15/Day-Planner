import { User } from '../models/User';
import { Habit } from '../models/Habit';
import { HabitCompletion } from '../models/HabitCompletion';
import { addDays } from '../utils/date';

/**
 * Evaluates and (possibly) updates the user's streak based on habit
 * completions for a given day.
 *
 * A day is "successful" only if EVERY active recurring habit is completed.
 * Planned tasks never affect the streak.
 *
 * Rules:
 *  - If not already counted for `dateKey` and all active habits are complete:
 *      - no previous successful day -> streak = 1
 *      - previous successful day was yesterday -> streak += 1
 *      - otherwise (a gap) -> streak = 1
 *  - longestStreak is updated if exceeded.
 *  - lastStreakDate is set to `dateKey`.
 *  - If `lastStreakDate === dateKey` we skip, preventing double counting.
 */
export async function evaluateStreak(
  userId: string,
  dateKey: string
): Promise<void> {
  const user = await User.findById(userId);
  if (!user) return;

  const activeHabits = await Habit.find({ userId, isActive: true }).lean();
  if (activeHabits.length === 0) return;

  const completions = await HabitCompletion.find({
    userId,
    date: dateKey,
    habitId: { $in: activeHabits.map((h) => h._id) },
    completed: true,
  }).lean();

  const completedIds = new Set(completions.map((c) => c.habitId.toString()));
  const allComplete = activeHabits.every((h) => completedIds.has(h._id.toString()));

  if (!allComplete) return;
  if (user.lastStreakDate === dateKey) return;

  const yesterday = addDays(dateKey, -1);
  let newStreak: number;

  if (!user.lastStreakDate) {
    newStreak = 1;
  } else if (user.lastStreakDate === yesterday) {
    newStreak = user.currentStreak + 1;
  } else {
    newStreak = 1;
  }

  user.currentStreak = newStreak;
  if (newStreak > user.longestStreak) user.longestStreak = newStreak;
  user.lastStreakDate = dateKey;
  await user.save();
}
