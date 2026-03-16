/**
 * GET  /api/rooms/[id]/messages  — fetch messages (last 50)
 * POST /api/rooms/[id]/messages  — send a message { content }
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import ChatRoom from "@/models/ChatRoom";
import Message from "@/models/Message";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();

  const { id } = await params;
  const room = await ChatRoom.findOne({ _id: id, memberIds: session.user.id });
  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const messages = await Message.find({ roomId: id }).sort({ createdAt: -1 }).limit(50);
  return NextResponse.json(messages.reverse());
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();

  const { id } = await params;
  const room = await ChatRoom.findOne({ _id: id, memberIds: session.user.id });
  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

  const message = await Message.create({
    roomId: id,
    senderId: session.user.id,
    senderName: session.user.name ?? "Unknown",
    content: content.trim(),
  });

  // Bump room updatedAt for sorting
  await ChatRoom.findByIdAndUpdate(id, { updatedAt: new Date() });

  return NextResponse.json(message, { status: 201 });
}
