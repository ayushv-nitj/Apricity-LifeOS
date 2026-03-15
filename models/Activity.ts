import mongoose, { Schema, Document } from "mongoose";

export interface IActivity extends Document {
  userId: string;
  type: "task_complete" | "goal_complete" | "level_up" | "streak" | "xp_gain" | "achievement";
  message: string;
  xp?: number;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["task_complete", "goal_complete", "level_up", "streak", "xp_gain", "achievement"],
      required: true,
    },
    message: { type: String, required: true },
    xp: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Activity || mongoose.model<IActivity>("Activity", ActivitySchema);
