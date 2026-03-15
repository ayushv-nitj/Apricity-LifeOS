import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Mood from "@/models/Mood";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const moods = await Mood.find({ userId: session.user.id }).sort({ date: -1 }).limit(30);
  return NextResponse.json(moods);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const mood = await Mood.create({ ...body, userId: session.user.id });
  return NextResponse.json(mood, { status: 201 });
}
