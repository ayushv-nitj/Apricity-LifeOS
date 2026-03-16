/**
 * models/Task.ts — Task / Quest Database Model
 *
 * Tasks are the core unit of productivity in Apricity.
 * They can be one-off tasks OR recurring habits (isHabit: true).
 *
 * The RPG gamification layer:
 *  - Each task has an `xpReward` — completing it awards XP to the user.
 *  - Habits track a `streak` counter (consecutive days completed).
 *  - The `category` field links tasks to life areas shown in the radar chart.
 *
 * When a task is completed (status → "completed"):
 *  - `completedAt` is set to the current timestamp
 *  - The API route awards `xpReward` XP to the user
 *  - An Activity log entry is created for the System Feed
 */

import mongoose, { Schema, Document } from "mongoose";

/* ── TypeScript Interface ─────────────────────────────────────────────────────
 * Union types (e.g. "work" | "academics") restrict the value to a fixed set.
 * This gives autocomplete in the editor and catches typos at compile time.
 */
export interface ITask extends Document {
  userId: string;       // References the User._id who owns this task (as string)
  title: string;
  description?: string;
  // Category maps to a life area — used for radar chart and analytics breakdown
  category: "work" | "academics" | "workout" | "diet" | "relationships" | "family" | "goals" | "personal";
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
  dueDate?: Date;
  xpReward: number;     // XP awarded when this task is completed
  isHabit: boolean;     // If true, this task resets daily and tracks a streak
  streak: number;       // Consecutive days this habit has been completed
  completedAt?: Date;   // Set when status changes to "completed" — used for XP timeline
  createdAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    // `index: true` creates a MongoDB index on userId for fast queries.
    // Without an index, finding all tasks for a user would scan the entire collection.
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: String,
    category: {
      type: String,
      enum: ["work", "academics", "workout", "diet", "relationships", "family", "goals", "personal"],
      default: "personal",
    },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status:   { type: String, enum: ["pending", "in-progress", "completed"], default: "pending" },
    dueDate:  Date,
    xpReward: { type: Number, default: 50 },
    isHabit:  { type: Boolean, default: false },
    streak:   { type: Number, default: 0 },
    completedAt: Date,
  },
  { timestamps: true }
);

// Reuse compiled model in development to avoid hot-reload errors.
export default mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
