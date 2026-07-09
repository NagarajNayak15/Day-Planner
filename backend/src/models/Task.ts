import mongoose, { Schema, Document } from 'mongoose';

export type Priority = 'Low' | 'Medium' | 'High';

export interface ITask extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  date: string;
  time?: string;
  priority: Priority;
  completed: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 1000 },
    date: { type: String, required: true, index: true },
    time: { type: String, default: null },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    completed: { type: Boolean, default: false },
    notes: { type: String, default: '', maxlength: 2000 },
  },
  { timestamps: true }
);

taskSchema.index({ userId: 1, date: 1 });

export const Task = mongoose.model<ITask>('Task', taskSchema);
