/**
 * app/api/tasks/[id]/route.ts — Single Task API (PATCH & DELETE)
 *
 * Handles operations on a specific task identified by its MongoDB `_id`.
 * The `[id]` in the folder name is a Next.js dynamic route segment —
 * it captures whatever comes after /api/tasks/ in the URL.
 *
 * PATCH /api/tasks/:id
 *  - Updates any fields on the task (title, status, priority, etc.)
 *  - If status is set to "completed":
 *    1. Sets `completedAt` timestamp on the task
 *    2. Awards XP to the user (task.xpReward added to user.xp)
 *    3. Checks if the user leveled up (every 1000 XP = 1 level)
 *    4. Creates an Activity log entry for the SystemFeed
 *    5. If leveled up, creates a separate "level_up" Activity entry
 *
 * DELETE /api/tasks/:id
 *  - Permanently removes the task from MongoDB
 *  - Uses findOneAndDelete with userId check to prevent deleting other users' tasks
 *
 * Security: both routes check `session.user.id` and filter by userId in the
 * MongoDB query — a user can only modify/delete their own tasks.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";
import User from "@/models/User";
import Activity from "@/models/Activity";

// XP required to advance one level
const XP_PER_LEVEL = 1000;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verify the user is logged in
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  // In Next.js App Router, dynamic params are a Promise — must be awaited
  const { id } = await params;
  const body = await req.json();

  // Update the task — only if it belongs to the current user (userId check)
  // If status is "completed", also set the completedAt timestamp
  const task = await Task.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    { ...body, ...(body.status === "completed" ? { completedAt: new Date() } : {}) },
    { new: true } // Return the updated document, not the original
  );

  // XP and leveling logic — only runs when a task is marked complete
  if (body.status === "completed" && task) {
    const user = await User.findById(session.user.id);
    if (user) {
      // Calculate level BEFORE adding XP so we can detect a level-up
      const prevLevel = Math.floor(user.xp / XP_PER_LEVEL) + 1;

      // Award XP
      user.xp += task.xpReward;

      // Calculate level AFTER adding XP
      const newLevel = Math.floor(user.xp / XP_PER_LEVEL) + 1;

      // If the level increased, update the user's level and log a level-up event
      if (newLevel > prevLevel) {
        user.level = newLevel;
        await Activity.create({
          userId: session.user.id,
          type: "level_up",
          message: `LEVEL UP: Reached Level ${newLevel}`,
          xp: 0,
        });
      }

      // Save the updated XP (and possibly level) to MongoDB
      await user.save();
    }

    // Always log a task_complete activity entry for the SystemFeed
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

  // findOneAndDelete with userId ensures users can only delete their own tasks
  await Task.findOneAndDelete({ _id: id, userId: session.user.id });

  return NextResponse.json({ message: "Deleted" });
}
