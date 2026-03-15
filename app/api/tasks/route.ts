import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const query: Record<string, unknown> = { userId: session.user.id };
  if (category) query.category = category;

  const tasks = await Task.find(query).sort({ createdAt: -1 });
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const task = await Task.create({ ...body, userId: session.user.id });
  return NextResponse.json(task, { status: 201 });
}
