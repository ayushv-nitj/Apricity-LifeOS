/**
 * lib/mongodb.ts — Database Connection Utility
 *
 * This file handles connecting to MongoDB using Mongoose.
 * It uses a caching pattern to avoid creating a new connection
 * on every request — critical in Next.js because serverless
 * functions (API routes) can be called many times per second.
 *
 * Without caching, each API call would open a fresh DB connection,
 * quickly exhausting MongoDB's connection limit.
 */

import mongoose from "mongoose";

// Read the MongoDB connection string from environment variables.
// The "!" tells TypeScript "trust me, this won't be undefined".
const MONGODB_URI = process.env.MONGODB_URI!;

// Fail fast at startup if the env var is missing — better than a
// cryptic error later when a DB query is actually attempted.
if (!MONGODB_URI) throw new Error("Please define MONGODB_URI in .env.local");

/* ── Cache type definition ──────────────────────────────────────────────────
 * We store two things:
 *   conn    — the active Mongoose connection (or null if not yet connected)
 *   promise — the in-flight connection promise (so parallel requests don't
 *             each start their own connection attempt)
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend the Node.js global object so TypeScript knows about our cache.
// This is necessary because `global` is shared across hot-reloads in dev.
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

/* ── Why use `global`? ──────────────────────────────────────────────────────
 * In Next.js development mode, modules are re-evaluated on every hot reload.
 * A module-level variable would be reset each time, losing the cached connection.
 * Storing the cache on `global` persists it across reloads in the same process.
 */
const cached: MongooseCache = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

/**
 * connectDB — Establishes (or reuses) the MongoDB connection.
 *
 * Call this at the top of any API route that needs the database.
 * The function is idempotent: calling it multiple times is safe and cheap.
 *
 * Flow:
 *  1. If a connection already exists → return it immediately (fast path).
 *  2. If a connection is in progress → await the existing promise (no duplicate).
 *  3. Otherwise → start a new connection and cache the promise.
 */
export async function connectDB() {
  // Fast path: already connected, just return the existing connection.
  if (cached.conn) return cached.conn;

  // If no connection attempt is in progress, start one.
  // `bufferCommands: false` means Mongoose won't queue operations if
  // the connection drops — it will throw immediately instead.
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }

  // Await the connection (whether we just started it or it was already running).
  cached.conn = await cached.promise;
  return cached.conn;
}
