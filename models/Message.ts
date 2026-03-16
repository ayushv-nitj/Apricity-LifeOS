import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    roomId:     { type: String, required: true, index: true },
    senderId:   { type: String, required: true },
    senderName: { type: String, required: true },
    content:    { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);
