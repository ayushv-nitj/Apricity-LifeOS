import mongoose, { Schema, Document } from "mongoose";

export interface IWorkout extends Document {
  userId: string;
  type: string;
  duration: number;
  calories: number;
  notes: string;
  date: Date;
  createdAt: Date;
}

const WorkoutSchema = new Schema<IWorkout>(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, required: true },
    duration: { type: Number, required: true },
    calories: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Workout || mongoose.model<IWorkout>("Workout", WorkoutSchema);
