import mongoose, { Schema, Document, Model } from 'mongoose';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'working' | 'review' | 'done';

export interface ITask extends Document {
  title: string;
  description?: string;
  assignedTo?: string;
  projectRef?: string;
  dueDate?: Date;
  priority: TaskPriority;
  status: TaskStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    assignedTo: {
      type: String,
      trim: true,
    },
    projectRef: {
      type: String,
      trim: true,
    },
    dueDate: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['todo', 'working', 'review', 'done'],
      default: 'todo',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

TaskSchema.index({ createdAt: -1 });
TaskSchema.index({ status: 1, priority: -1 });

const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

export default Task;
