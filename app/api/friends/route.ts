/**
 * GET  /api/friends  — list accepted friends with their user info
 * POST /api/friends  — send a friend request by email { email }
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import FriendRequest from "@/models/FriendRequest";
import User from "@/models/User";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();

  const accepted = await FriendRequest.find({
    status: "accepted",
    $or: [{ fromUserId: session.user.id }, { toUserId: session.user.id }],
  });

  const friendIds = accepted.map((r) =>
    r.fromUserId === session.user.id ? r.toUserId : r.fromUserId
  );

  const friends = await User.find({ _id: { $in: friendIds } }).select("username email avatar level xp");
  return NextResponse.json(friends);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const target = await User.findOne({ email });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (target._id.toString() === session.user.id)
    return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 });

  const existing = await FriendRequest.findOne({
    $or: [
      { fromUserId: session.user.id, toUserId: target._id.toString() },
      { fromUserId: target._id.toString(), toUserId: session.user.id },
    ],
  });
  if (existing) return NextResponse.json({ error: "Request already exists" }, { status: 409 });

  const request = await FriendRequest.create({
    fromUserId: session.user.id,
    toUserId: target._id.toString(),
  });
  return NextResponse.json(request, { status: 201 });
}
