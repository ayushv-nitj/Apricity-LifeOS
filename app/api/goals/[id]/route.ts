import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Goal from "@/models/Goal";
import User from "@/models/User";
import Activity from "@/models/Activity";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { id } = await params;
  const body = await req.json();
  const prev = await Goal.findOne({ _id: id, userId: session.user.id });
  const goal = await Goal.findOneAndUpdate({ _id: id, userId: session.user.id }, body, { new: true });

  if (goal && body.status === "completed" && prev?.status !== "completed") {
    await User.findByIdAndUpdate(session.user.id, { $inc: { xp: goal.xpReward } });
    await Activity.create({
      userId: session.user.id,
      type: "goal_complete",
      message: `GOAL ACHIEVED: ${goal.title} (+${goal.xpReward} XP)`,
      xp: goal.xpReward,
    });
  }

  return NextResponse.json(goal);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { id } = await params;
  await Goal.findOneAndDelete({ _id: id, userId: session.user.id });
  return NextResponse.json({ message: "Deleted" });
}
