import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Workout from "@/models/Workout";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const workouts = await Workout.find({ userId: session.user.id }).sort({ date: -1 });
  return NextResponse.json(workouts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const workout = await Workout.create({ ...body, userId: session.user.id });
  return NextResponse.json(workout, { status: 201 });
}
