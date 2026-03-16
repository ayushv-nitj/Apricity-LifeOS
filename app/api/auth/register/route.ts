/**
 * app/api/auth/register/route.ts — User Registration Endpoint
 *
 * HTTP Method: POST
 * URL: /api/auth/register
 * Public: Yes (no auth required — this is how new users are created)
 *
 * Request body: { username, email, password }
 * Response:
 *   201 — { message, userId }  — success
 *   400 — { error }            — missing fields
 *   409 — { error }            — username or email already taken
 *   500 — { error }            — unexpected server error
 *
 * Security:
 *  - Passwords are NEVER stored in plain text.
 *  - bcrypt.hash(password, 12) runs 2^12 = 4096 hashing rounds,
 *    making brute-force attacks computationally expensive.
 *  - We check for existing users BEFORE hashing to avoid wasting CPU.
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    /* ── 1. Parse and validate request body ──────────────────────────────── */
    const { username, email, password } = await req.json();

    // Return 400 Bad Request if any required field is missing.
    if (!username || !email || !password)
      return NextResponse.json({ error: "All fields required" }, { status: 400 });

    /* ── 2. Connect to database ───────────────────────────────────────────── */
    await connectDB();

    /* ── 3. Check for duplicate username or email ─────────────────────────
     * `$or` is a MongoDB operator meaning "match if EITHER condition is true".
     * This single query checks both fields at once instead of two queries.
     */
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists)
      return NextResponse.json({ error: "User already exists" }, { status: 409 });

    /* ── 4. Hash the password ─────────────────────────────────────────────
     * The salt rounds (12) control how slow the hash is.
     * Higher = more secure but slower. 12 is a good balance for 2024.
     * bcrypt automatically generates and embeds a random salt in the hash.
     */
    const hashed = await bcrypt.hash(password, 12);

    /* ── 5. Create the user document in MongoDB ───────────────────────────
     * All other fields (level, xp, theme, bio) use their schema defaults.
     */
    const user = await User.create({ username, email, password: hashed });

    // 201 Created — standard HTTP status for successful resource creation.
    return NextResponse.json(
      { message: "Operative registered", userId: user._id },
      { status: 201 }
    );
  } catch {
    // Catch-all for unexpected errors (DB down, schema validation failure, etc.)
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
