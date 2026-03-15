import mongoose, { Schema, Document } from "mongoose";

export interface IContact extends Document {
  userId: string;
  name: string;
  relation: string;
  lastContact: string;
  birthday?: string;
  notes: string;
  affinity: number;
  type: "relationship" | "family";
  bondLevel?: number;
  createdAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    relation: { type: String, required: true },
    lastContact: { type: String, default: "Today" },
    birthday: { type: String, default: "" },
    notes: { type: String, default: "" },
    affinity: { type: Number, default: 70, min: 0, max: 100 },
    type: { type: String, enum: ["relationship", "family"], default: "relationship" },
    bondLevel: { type: Number, default: 80, min: 0, max: 100 },
  },
  { timestamps: true }
);

export default mongoose.models.Contact || mongoose.model<IContact>("Contact", ContactSchema);
