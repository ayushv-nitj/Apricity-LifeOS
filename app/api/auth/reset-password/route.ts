/**
 * POST /api/auth/reset-password
 *
 * Accepts { userId, token, password }, validates the token,
 * hashes the new password, updates the user, and deletes the token.
 *
 * Validation steps:
 *  1. Find a token document for this userId
 *  2. Check it hasn't expired (belt-and-suspenders — TTL index also cleans up)
 *  3. bcrypt.compare the plain token against the stored hash
 *  4. Enforce minimum password length
 */
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import PasswordResetToken from "@/models/PasswordResetToken";

export async function POST(req: NextRequest) {
  const { userId, token, password } = await req.json();

  if (!userId || !token || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  await connectDB();

  const record = await PasswordResetToken.findOne({ userId });

  if (!record) {
    return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
  }

  // Belt-and-suspenders expiry check (TTL index handles cleanup, but race conditions exist)
  if (record.expires < new Date()) {
    await record.deleteOne();
    return NextResponse.json({ error: "Reset link has expired" }, { status: 400 });
  }

  // Compare the plain token from the URL against the stored hash
  const valid = await bcrypt.compare(token, record.token);
  if (!valid) {
    return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
  }

  // Hash the new password and update the user
  const hashed = await bcrypt.hash(password, 12);
  await User.findByIdAndUpdate(userId, { password: hashed });

  // Delete the token so it can't be reused
  await record.deleteOne();

  return NextResponse.json({ message: "Password updated successfully" });
}
