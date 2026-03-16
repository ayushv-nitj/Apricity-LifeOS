import mongoose, { Schema, Document } from "mongoose";

export interface ISharedHabit extends Document {
  title: string;
  createdBy: string;
  memberIds: string[];
  // Map of userId -> array of ISO date strings when they completed it
  completions: Map<string, string[]>;
  createdAt: Date;
}

const SharedHabitSchema = new Schema<ISharedHabit>(
  {
    title:       { type: String, required: true },
    createdBy:   { type: String, required: true },
    memberIds:   [{ type: String }],
    completions: { type: Map, of: [String], default: {} },
  },
  { timestamps: true }
);

export default mongoose.models.SharedHabit ||
  mongoose.model<ISharedHabit>("SharedHabit", SharedHabitSchema);
