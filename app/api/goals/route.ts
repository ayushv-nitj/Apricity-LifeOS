/**
 * app/api/goals/route.ts — Goals Collection API (GET & POST)
 *
 * Handles reading and creating goals for the authenticated user.
 *
 * GET /api/goals
 *  - Returns all goals belonging to the current user
 *  - Sorted by createdAt descending (newest first)
 *
 * POST /api/goals
 *  - Creates a new goal document in MongoDB
 *  - Automatically attaches the current user's ID (from session)
 *  - Returns the created goal with HTTP 201 (Created)
 *
 * Goal fields (defined in models/Goal.ts):
 *  - title: string — the goal description
 *  - category: string — e.g. "health", "career", "learning"
 *  - targetDate: Date — deadline for the goal
 *  - progress: number — 0-100 percentage
 *  - status: "active" | "completed" | "paused"
 *
 * Security: userId is always taken from the session, never from the
 * request body — this prevents users from creating goals for other users.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Goal from "@/models/Goal";

export async function GET() {
  // Check authentication — return 401 if not logged in
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  // Fetch only this user's goals, newest first
  const goals = await Goal.find({ userId: session.user.id }).sort({ createdAt: -1 });

  return NextResponse.json(goals);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const body = await req.json();

  // Spread the request body and inject the userId from the session
  // This ensures the goal is always linked to the correct user
  const goal = await Goal.create({ ...body, userId: session.user.id });

  // 201 Created is the correct HTTP status for a successful resource creation
  return NextResponse.json(goal, { status: 201 });
}
