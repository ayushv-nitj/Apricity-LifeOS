/**
 * GET  /api/shared-habits  — list habits the user is part of
 * POST /api/shared-habits  — create a shared habit { title, memberEmails[] }
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import SharedHabit from "@/models/SharedHabit";
import User from "@/models/User";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();

  const habits = await SharedHabit.find({ memberIds: session.user.id }).sort({ createdAt: -1 });
  return NextResponse.json(habits);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();

  const { title, memberEmails = [] } = await req.json();
  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const members = await User.find({ email: { $in: memberEmails } }).select("_id");
  const memberIds = [
    session.user.id,
    ...members.map((m) => m._id.toString()).filter((id) => id !== session.user.id),
  ];

  const habit = await SharedHabit.create({ title, createdBy: session.user.id, memberIds, completions: {} });
  return NextResponse.json(habit, { status: 201 });
}
