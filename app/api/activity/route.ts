import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Activity from "@/models/Activity";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const feed = await Activity.find({ userId: session.user.id }).sort({ createdAt: -1 }).limit(20);
  return NextResponse.json(feed);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const activity = await Activity.create({ ...body, userId: session.user.id });
  return NextResponse.json(activity, { status: 201 });
}
