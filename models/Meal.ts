import mongoose, { Schema, Document } from "mongoose";

export interface IMeal extends Document {
  userId: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  date: Date;
  createdAt: Date;
}

const MealSchema = new Schema<IMeal>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    time: { type: String, default: "12:00" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Meal || mongoose.model<IMeal>("Meal", MealSchema);
