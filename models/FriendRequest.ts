import mongoose, { Schema, Document } from "mongoose";

export interface IFriendRequest extends Document {
  fromUserId: string;
  toUserId: string;
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
}

const FriendRequestSchema = new Schema<IFriendRequest>(
  {
    fromUserId: { type: String, required: true, index: true },
    toUserId:   { type: String, required: true, index: true },
    status:     { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.models.FriendRequest ||
  mongoose.model<IFriendRequest>("FriendRequest", FriendRequestSchema);
