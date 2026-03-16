/**
 * app/api/tasks/route.ts — Tasks Collection Endpoints
 *
 * Handles two HTTP methods on the /api/tasks URL:
 *
 * GET  /api/tasks              — fetch all tasks for the logged-in user
 * GET  /api/tasks?category=work — fetch tasks filtered by category
 * POST /api/tasks              — create a new task
 *
 * Both routes are protected — they check for a valid session first.
 * Users can only see and create their own tasks (userId is always set
 * from the session, never from the request body).
 *
 * The companion file app/api/tasks/[id]/route.ts handles PATCH and DELETE
 * for individual tasks (e.g. PATCH /api/tasks/abc123 to mark as complete).
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";

/* ── GET — Fetch tasks ────────────────────────────────────────────────────── */
export async function GET(req: NextRequest) {
  /* ── Auth check ───────────────────────────────────────────────────────────
   * `auth()` reads the JWT session cookie. If there's no valid session,
   * it returns null. We return 401 Unauthorized immediately.
   * `session.user.id` is the MongoDB _id of the logged-in user (set in auth.ts callbacks).
   */
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  /* ── Optional category filter ─────────────────────────────────────────────
   * URL query params are accessed via `new URL(req.url).searchParams`.
   * If ?category=work is in the URL, we add it to the MongoDB query.
   * If not provided, `category` is null and we skip the filter (return all).
   */
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  // Start with a base query that always filters by the current user's ID.
  // This ensures users NEVER see each other's tasks.
  const query: Record<string, unknown> = { userId: session.user.id };
  if (category) query.category = category;

  // `.sort({ createdAt: -1 })` returns newest tasks first (-1 = descending).
  const tasks = await Task.find(query).sort({ createdAt: -1 });
  return NextResponse.json(tasks);
}

/* ── POST — Create a task ─────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  /* ── Spread + override pattern ────────────────────────────────────────────
   * `...body` copies all fields from the request (title, category, priority, etc.)
   * `userId: session.user.id` OVERRIDES any userId the client might send.
   * This prevents a user from creating tasks owned by someone else.
   */
  const body = await req.json();
  const task = await Task.create({ ...body, userId: session.user.id });

  // 201 Created — the new task document is returned so the UI can add it
  // to the list without needing to refetch everything.
  return NextResponse.json(task, { status: 201 });
}
