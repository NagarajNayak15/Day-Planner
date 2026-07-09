import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from './config/db';
import { User } from './models/User';
import { Habit } from './models/Habit';
import { Task } from './models/Task';
import { HabitCompletion } from './models/HabitCompletion';
import { todayKey, addDays } from './utils/date';

async function run() {
  await connectDB();

  const email = 'demo@example.com';
  const password = 'password123';

  await User.deleteOne({ email });
  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({
    name: 'Demo User',
    email,
    password: hashed,
    currentStreak: 0,
    longestStreak: 0,
    lastStreakDate: null,
  });

  // --- Habits ---
  const habitDefs = [
    { title: 'Exercise', description: '30 minutes of movement', isActive: true },
    { title: 'Drink Water', description: '8 glasses', isActive: true },
    { title: 'Read Book', description: '10 pages', isActive: true },
    { title: 'Meditation', description: '5 minutes', isActive: true },
    { title: 'Journal', description: 'Write one line', isActive: false },
  ];
  const habits = [];
  for (let i = 0; i < habitDefs.length; i++) {
    habits.push(
      await Habit.create({
        userId: user._id,
        title: habitDefs[i].title,
        description: habitDefs[i].description,
        isActive: habitDefs[i].isActive,
        sortOrder: i,
      })
    );
  }
  const activeHabits = habits.filter((h) => h.isActive);

  // --- Seed a 5-day streak ending today ---
  const streakDays = 5;
  for (let d = streakDays - 1; d >= 0; d--) {
    const date = addDays(todayKey(), -d);
    for (const h of activeHabits) {
      await HabitCompletion.create({
        userId: user._id,
        habitId: h._id,
        date,
        completed: true,
        completedAt: new Date(),
      });
    }
  }
  user.currentStreak = streakDays;
  user.longestStreak = streakDays;
  user.lastStreakDate = todayKey();
  await user.save();

  // --- Planned tasks ---
  const today = todayKey();
  const taskDefs = [
    {
      title: 'Doctor Appointment',
      description: 'Annual checkup',
      date: today,
      time: '09:30',
      priority: 'High' as const,
      completed: false,
    },
    {
      title: 'Team Meeting',
      description: 'Sprint planning',
      date: today,
      time: '14:00',
      priority: 'Medium' as const,
      completed: true,
    },
    {
      title: 'Grocery Shopping',
      description: 'Buy vegetables and milk',
      date: addDays(today, 1),
      time: null,
      priority: 'Low' as const,
      completed: false,
    },
    {
      title: 'Assignment Due',
      description: 'Submit final project',
      date: addDays(today, 2),
      time: '23:59',
      priority: 'High' as const,
      completed: false,
    },
  ];
  for (const t of taskDefs) {
    await Task.create({ userId: user._id, ...t });
  }

  console.log('Seed complete.');
  console.log(`  Login: ${email} / ${password}`);
  console.log(`  Streak: ${streakDays} days`);

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('Seed failed:', err);
  await mongoose.disconnect();
  process.exit(1);
});
