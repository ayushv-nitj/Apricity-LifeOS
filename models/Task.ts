import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  userId: string;
  title: string;
  description?: string;
  category: "work" | "academics" | "workout" | "diet" | "relationships" | "family" | "goals" | "personal";
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
  dueDate?: Date;
  xpReward: number;
  isHabit: boolean;
  streak: number;
  completedAt?: Date;
  createdAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: String,
    category: {
      type: String,
      enum: ["work", "academics", "workout", "diet", "relationships", "family", "goals", "personal"],
      default: "personal",
    },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: { type: String, enum: ["pending", "in-progress", "completed"], default: "pending" },
    dueDate: Date,
    xpReward: { type: Number, default: 50 },
    isHabit: { type: Boolean, default: false },
    streak: { type: Number, default: 0 },
    completedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
