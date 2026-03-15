import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Meal from "@/models/Meal";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");
  const query: Record<string, unknown> = { userId: session.user.id };
  if (dateStr) {
    const start = new Date(dateStr);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateStr);
    end.setHours(23, 59, 59, 999);
    query.date = { $gte: start, $lte: end };
  }
  const meals = await Meal.find(query).sort({ date: -1 });
  return NextResponse.json(meals);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const meal = await Meal.create({ ...body, userId: session.user.id });
  return NextResponse.json(meal, { status: 201 });
}
