/**
 * models/PasswordResetToken.ts
 *
 * Stores one-time tokens for password reset emails.
 * Each token is tied to a userId, expires after 1 hour,
 * and is deleted once used.
 *
 * `expires` is indexed with `expireAfterSeconds: 0` — MongoDB's TTL index
 * automatically deletes documents once their `expires` date has passed.
 * This means stale tokens clean themselves up without any cron job.
 */
import mongoose, { Schema, Document } from "mongoose";

export interface IPasswordResetToken extends Document {
  userId: string;
  token: string;   // random hex string, stored as bcrypt hash
  expires: Date;
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>({
  userId:  { type: String, required: true },
  token:   { type: String, required: true },
  // TTL index: MongoDB auto-deletes this document when `expires` is in the past
  expires: { type: Date,   required: true, index: { expireAfterSeconds: 0 } },
});

export default mongoose.models.PasswordResetToken ||
  mongoose.model<IPasswordResetToken>("PasswordResetToken", PasswordResetTokenSchema);
