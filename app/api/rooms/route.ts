/**
 * GET  /api/rooms  — list all rooms the current user is a member of
 * POST /api/rooms  — create a room { name, type, memberEmails[] }
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import ChatRoom from "@/models/ChatRoom";
import User from "@/models/User";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();

  const rooms = await ChatRoom.find({ memberIds: session.user.id }).sort({ updatedAt: -1 });
  return NextResponse.json(rooms);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();

  const { name, type = "group", memberEmails = [] } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  // Resolve emails to user IDs
  const members = await User.find({ email: { $in: memberEmails } }).select("_id");
  const memberIds = [
    session.user.id,
    ...members.map((m) => m._id.toString()).filter((id) => id !== session.user.id),
  ];

  const room = await ChatRoom.create({ name, type, memberIds, createdBy: session.user.id });
  return NextResponse.json(room, { status: 201 });
}
