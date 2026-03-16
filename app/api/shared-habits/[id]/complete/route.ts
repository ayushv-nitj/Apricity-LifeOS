/**
 * POST /api/shared-habits/[id]/complete  — mark today as completed for current user
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import SharedHabit from "@/models/SharedHabit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();

  const { id } = await params;
  const habit = await SharedHabit.findOne({ _id: id, memberIds: session.user.id });
  if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const today = new Date().toISOString().split("T")[0];
  const existing: string[] = habit.completions.get(session.user.id) ?? [];

  if (!existing.includes(today)) {
    habit.completions.set(session.user.id, [...existing, today]);
    await habit.save();
  }

  return NextResponse.json(habit);
}
