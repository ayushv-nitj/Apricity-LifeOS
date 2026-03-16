/**
 * GET   /api/friends/requests  — incoming pending requests
 * PATCH /api/friends/requests  — accept or decline { requestId, action: "accept"|"decline" }
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

  const requests = await FriendRequest.find({
    toUserId: session.user.id,
    status: "pending",
  });

  // Attach sender info
  const withSenders = await Promise.all(
    requests.map(async (r) => {
      const sender = await User.findById(r.fromUserId).select("username email avatar");
      return { ...r.toObject(), sender };
    })
  );
  return NextResponse.json(withSenders);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();

  const { requestId, action } = await req.json();
  const request = await FriendRequest.findOne({ _id: requestId, toUserId: session.user.id });
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });

  request.status = action === "accept" ? "accepted" : "declined";
  await request.save();
  return NextResponse.json(request);
}
