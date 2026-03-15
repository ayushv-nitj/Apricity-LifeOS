import mongoose, { Schema, Document } from "mongoose";

export interface IMood extends Document {
  userId: string;
  mood: number; // 1-10
  energy: number; // 1-10
  note?: string;
  date: Date;
}

const MoodSchema = new Schema<IMood>(
  {
    userId: { type: String, required: true, index: true },
    mood: { type: Number, required: true, min: 1, max: 10 },
    energy: { type: Number, required: true, min: 1, max: 10 },
    note: String,
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Mood || mongoose.model<IMood>("Mood", MoodSchema);
