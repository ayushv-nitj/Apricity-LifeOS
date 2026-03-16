/**
 * POST /api/auth/forgot-password
 *
 * Accepts { email }, looks up the user, generates a secure random token,
 * stores a hashed copy in MongoDB (expires in 1 hour), then emails the
 * plain token as part of a reset link to the user.
 *
 * Security notes:
 *  - Always returns 200 even if the email isn't found — prevents user enumeration
 *    (an attacker can't tell whether an account exists by the response)
 *  - The token stored in DB is a bcrypt hash; the plain token only exists in the email
 *  - crypto.randomBytes(32) gives 256 bits of entropy — practically unguessable
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import PasswordResetToken from "@/models/PasswordResetToken";
import { sendPasswordResetEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  // Always return 200 to prevent email enumeration
  if (!email) return NextResponse.json({ message: "If that email exists, a reset link has been sent." });

  await connectDB();
  const user = await User.findOne({ email });

  if (user) {
    // Delete any existing tokens for this user (only one active reset at a time)
    await PasswordResetToken.deleteMany({ userId: user._id.toString() });

    // Generate a cryptographically secure random token
    const plainToken = crypto.randomBytes(32).toString("hex");

    // Store only the hash — if the DB is compromised, tokens can't be used
    const hashedToken = await bcrypt.hash(plainToken, 10);

    await PasswordResetToken.create({
      userId: user._id.toString(),
      token: hashedToken,
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${plainToken}&userId=${user._id}`;

    try {
      console.log("Attempting to send reset email to:", email);
      console.log("EMAIL_FROM:", process.env.EMAIL_FROM);
      console.log("EMAIL_PASSWORD set:", !!process.env.EMAIL_PASSWORD);
      await sendPasswordResetEmail(email, resetUrl);
      console.log("Reset email sent successfully");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Failed to send reset email:", message);
      return NextResponse.json(
        { error: `Failed to send email: ${message}` },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ message: "If that email exists, a reset link has been sent." });
}
