import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";
import Goal from "@/models/Goal";
import Mood from "@/models/Mood";
import Workout from "@/models/Workout";
import Academic from "@/models/Academic";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { messages } = await req.json();
    if (!messages?.length) return NextResponse.json({ error: "No messages" }, { status: 400 });

    await connectDB();
    const userId = session.user.id;
    const week = new Date(Date.now() - 7 * 86400000);

    const [tasks, goals, moods, workouts, academics] = await Promise.all([
      Task.find({ userId }).sort({ createdAt: -1 }).limit(20),
      Goal.find({ userId }).sort({ createdAt: -1 }).limit(10),
      Mood.find({ userId }).sort({ date: -1 }).limit(7),
      Workout.find({ userId, date: { $gte: week } }),
      Academic.find({ userId }),
    ]);

    const pendingTasks = tasks.filter(t => t.status !== "completed");
    const completedTasks = tasks.filter(t => t.status === "completed");
    const avgMood = moods.length ? (moods.reduce((s, m) => s + m.mood, 0) / moods.length).toFixed(1) : "N/A";
    const avgEnergy = moods.length ? (moods.reduce((s, m) => s + m.energy, 0) / moods.length).toFixed(1) : "N/A";
    const activeGoals = goals.filter(g => g.status !== "completed");

    const systemPrompt = `You are an AI life advisor for Apricity, a personal life OS dashboard with a cyber/RPG theme.
You have access to the user's real data. Be concise, warm, and actionable.
Use the RPG theme — refer to tasks as "quests", goals as "missions", the user as "operative".
Keep responses short (2-4 sentences max unless asked for detail). Use bullet points for lists.

USER DATA SNAPSHOT:
- Name: ${session.user.name}
- Pending quests: ${pendingTasks.length} (${pendingTasks.slice(0, 5).map(t => `"${t.title}" [${t.priority}]`).join(", ") || "none"})
- Completed quests this week: ${completedTasks.length}
- Active missions: ${activeGoals.length} (${activeGoals.slice(0, 3).map(g => `"${g.title}" ${g.progress}%`).join(", ") || "none"})
- Workouts this week: ${workouts.length}
- Avg mood (last 7 days): ${avgMood}/10
- Avg energy (last 7 days): ${avgEnergy}/10
- Academic subjects: ${academics.map(a => `${a.name} (${a.progress}%, ${a.hoursStudied}h studied)`).join(", ") || "none"}`;

    // Gemini requires history to alternate user/model starting with user.
    // Filter to only real user/assistant pairs (exclude the client-side greeting).
    const allButLast = messages.slice(0, -1).filter(
      (m: { role: string }) => m.role === "user" || m.role === "assistant"
    );
    // Drop any leading assistant messages
    let startIdx = 0;
    while (startIdx < allButLast.length && allButLast[startIdx].role !== "user") startIdx++;
    const history = allButLast.slice(startIdx).map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat({ history });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const reply = result.response.text();

    return NextResponse.json({ reply });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[chat/route]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
