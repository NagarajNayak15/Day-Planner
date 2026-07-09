import mongoose, { Schema, Document } from 'mongoose';

export interface IHabitCompletion extends Document {
  habitId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: string;
  completed: boolean;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const habitCompletionSchema = new Schema<IHabitCompletion>(
  {
    habitId: { type: Schema.Types.ObjectId, ref: 'Habit', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true, index: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

habitCompletionSchema.index({ userId: 1, date: 1, habitId: 1 }, { unique: true });

export const HabitCompletion = mongoose.model<IHabitCompletion>(
  'HabitCompletion',
  habitCompletionSchema
);
