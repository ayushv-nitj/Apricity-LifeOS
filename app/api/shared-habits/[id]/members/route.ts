/**
 * GET /api/shared-habits/[id]/members  — returns member user info for a habit
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import SharedHabit from "@/models/SharedHabit";
import User from "@/models/User";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();

  const { id } = await params;
  const habit = await SharedHabit.findOne({ _id: id, memberIds: session.user.id });
  if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const users = await User.find({ _id: { $in: habit.memberIds } }).select("_id username avatar");
  return NextResponse.json({ habit, members: users });
}
