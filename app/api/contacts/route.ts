import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Contact from "@/models/Contact";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const query: Record<string, unknown> = { userId: session.user.id };
  if (type) query.type = type;
  const contacts = await Contact.find(query).sort({ createdAt: -1 });
  return NextResponse.json(contacts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const contact = await Contact.create({ ...body, userId: session.user.id });
  return NextResponse.json(contact, { status: 201 });
}
