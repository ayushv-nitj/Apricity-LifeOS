import mongoose, { Schema, Document } from "mongoose";

export interface IChatRoom extends Document {
  name: string;
  type: "dm" | "group" | "project";
  memberIds: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatRoomSchema = new Schema<IChatRoom>(
  {
    name:      { type: String, required: true },
    type:      { type: String, enum: ["dm", "group", "project"], default: "dm" },
    memberIds: [{ type: String }],
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.ChatRoom ||
  mongoose.model<IChatRoom>("ChatRoom", ChatRoomSchema);
