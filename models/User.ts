/**
 * models/User.ts — User Database Model
 *
 * This file defines the shape of a User document in MongoDB using Mongoose.
 * Every registered user in the app has one document in the "users" collection.
 *
 * Two things are defined here:
 *  1. IUser interface — TypeScript type so the rest of the code knows what
 *     fields a user has (autocomplete, type checking, etc.)
 *  2. UserSchema — the actual MongoDB schema that enforces validation rules,
 *     default values, and unique constraints at the database level.
 *
 * The RPG system (level + xp) is stored here so it persists across sessions.
 */

import mongoose, { Schema, Document } from "mongoose";

/* ── TypeScript Interface ─────────────────────────────────────────────────────
 * `Document` is a Mongoose type that adds MongoDB-specific fields like `_id`,
 * `save()`, `toJSON()` etc. to our interface.
 * The `?` means the field is optional (may be undefined).
 */
export interface IUser extends Document {
  username: string;       // Unique display name chosen at signup
  email: string;          // Unique email used for login
  password: string;       // bcrypt hash — NEVER the plain-text password
  avatar?: string;        // URL to profile picture (optional)
  bio?: string;           // Short description shown on the profile panel
  level: number;          // RPG level — increases as XP accumulates
  xp: number;             // Experience points earned by completing tasks/goals
  theme: "dark" | "light"; // User's preferred UI theme, persisted to DB
  createdAt: Date;        // Auto-set by Mongoose `timestamps: true`
}

/* ── Mongoose Schema ──────────────────────────────────────────────────────────
 * The schema defines validation rules for each field.
 * `required: true` means MongoDB will reject documents missing that field.
 * `unique: true` creates a database index that prevents duplicate values.
 * `default` sets the value when the field is not provided on creation.
 */
const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar:   { type: String, default: "" },
    bio:      { type: String, default: "Operative. Life in progress." },
    level:    { type: Number, default: 1 },
    xp:       { type: Number, default: 0 },
    // `enum` restricts the value to only the listed options.
    theme:    { type: String, enum: ["dark", "light"], default: "dark" },
  },
  {
    // `timestamps: true` automatically adds `createdAt` and `updatedAt` fields
    // to every document. Mongoose manages these — you never set them manually.
    timestamps: true,
  }
);

/* ── Model export ─────────────────────────────────────────────────────────────
 * `mongoose.models.User` — reuse the model if it was already compiled.
 *   This is important in Next.js because modules are re-evaluated on hot reload.
 *   Without this check, Mongoose would throw "Cannot overwrite model once compiled".
 *
 * `mongoose.model<IUser>("User", UserSchema)` — compile the schema into a model
 *   the first time. The string "User" becomes the collection name "users" in MongoDB.
 */
export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
