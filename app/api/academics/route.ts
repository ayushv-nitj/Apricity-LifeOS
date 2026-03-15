import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Academic from "@/models/Academic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const subjects = await Academic.find({ userId: session.user.id }).sort({ createdAt: -1 });
  return NextResponse.json(subjects);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const subject = await Academic.create({ ...body, userId: session.user.id });
  return NextResponse.json(subject, { status: 201 });
}
