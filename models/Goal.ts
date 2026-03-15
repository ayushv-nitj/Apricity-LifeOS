import mongoose, { Schema, Document } from "mongoose";

export interface IGoal extends Document {
  userId: string;
  title: string;
  description?: string;
  category: "personal" | "career" | "health" | "travel" | "learning" | "relationships";
  status: "not-started" | "in-progress" | "completed";
  progress: number;
  targetDate?: Date;
  milestones: { title: string; completed: boolean }[];
  xpReward: number;
  createdAt: Date;
}

const GoalSchema = new Schema<IGoal>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: String,
    category: {
      type: String,
      enum: ["personal", "career", "health", "travel", "learning", "relationships"],
      default: "personal",
    },
    status: { type: String, enum: ["not-started", "in-progress", "completed"], default: "not-started" },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    targetDate: Date,
    milestones: [{ title: String, completed: { type: Boolean, default: false } }],
    xpReward: { type: Number, default: 200 },
  },
  { timestamps: true }
);

export default mongoose.models.Goal || mongoose.model<IGoal>("Goal", GoalSchema);
