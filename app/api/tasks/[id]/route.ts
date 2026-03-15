import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";
import User from "@/models/User";
import Activity from "@/models/Activity";

const XP_PER_LEVEL = 1000;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await params;
  const body = await req.json();

  const task = await Task.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    { ...body, ...(body.status === "completed" ? { completedAt: new Date() } : {}) },
    { new: true }
  );

  if (body.status === "completed" && task) {
    const user = await User.findById(session.user.id);
    if (user) {
      const prevLevel = Math.floor(user.xp / XP_PER_LEVEL) + 1;
      user.xp += task.xpReward;
      const newLevel = Math.floor(user.xp / XP_PER_LEVEL) + 1;
      if (newLevel > prevLevel) {
        user.level = newLevel;
        await Activity.create({
          userId: session.user.id,
          type: "level_up",
          message: `LEVEL UP: Reached Level ${newLevel}`,
          xp: 0,
        });
      }
      await user.save();
    }
    await Activity.create({
      userId: session.user.id,
      type: "task_complete",
      message: `QUEST COMPLETED: ${task.title} (+${task.xpReward} XP)`,
      xp: task.xpReward,
    });
  }

  return NextResponse.json(task);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await params;
  await Task.findOneAndDelete({ _id: id, userId: session.user.id });
  return NextResponse.json({ message: "Deleted" });
}
