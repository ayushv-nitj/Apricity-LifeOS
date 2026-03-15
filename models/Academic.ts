import mongoose, { Schema, Document } from "mongoose";

export interface IAcademic extends Document {
  userId: string;
  name: string;
  progress: number;
  hoursStudied: number;
  grade: string;
  color: string;
  createdAt: Date;
}

const AcademicSchema = new Schema<IAcademic>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    hoursStudied: { type: Number, default: 0 },
    grade: { type: String, default: "A" },
    color: { type: String, default: "bg-violet-400" },
  },
  { timestamps: true }
);

export default mongoose.models.Academic || mongoose.model<IAcademic>("Academic", AcademicSchema);
