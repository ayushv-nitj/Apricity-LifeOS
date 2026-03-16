/**
 * app/api/chat/route.ts — AI Advisor Chat Endpoint
 *
 * HTTP Method: POST
 * URL: /api/chat
 * Protected: Yes (requires login)
 *
 * This route powers the AI chatbot. On every message it:
 *  1. Fetches the user's real data from MongoDB (tasks, goals, mood, etc.)
 *  2. Builds a "system prompt" that gives Gemini context about the user's life
 *  3. Sends the conversation history + new message to Google Gemini
 *  4. Returns Gemini's reply to the frontend
 *
 * Why fetch data on every request?
 *  - The AI's advice is only useful if it reflects the user's current state.
 *  - Caching would mean stale data (e.g. completed tasks still showing as pending).
 *
 * Gemini chat history rules:
 *  - History must start with a "user" role message (not "model").
 *  - Roles must alternate: user → model → user → model...
 *  - We filter out the client-side greeting (which is an "assistant" message)
 *    before sending history to the API.
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";
import Goal from "@/models/Goal";
import Mood from "@/models/Mood";
import Workout from "@/models/Workout";
import Academic from "@/models/Academic";

// Initialize the Gemini client with the API key from environment variables.
// This runs once when the module is first loaded (not on every request).
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    /* ── 1. Auth check ──────────────────────────────────────────────────── */
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    /* ── 2. Parse request body ──────────────────────────────────────────── */
    // `messages` is the full conversation history from the frontend:
    // [{ role: "user", content: "..." }, { role: "assistant", content: "..." }, ...]
    const { messages } = await req.json();
    if (!messages?.length) return NextResponse.json({ error: "No messages" }, { status: 400 });

    /* ── 3. Fetch user's life data from MongoDB ─────────────────────────── */
    await connectDB();
    const userId = session.user.id;
    // "week" is a Date 7 days ago — used to filter recent workouts.
    const week = new Date(Date.now() - 7 * 86400000);

    // `Promise.all` runs all 5 DB queries in parallel instead of sequentially.
    // This is much faster — all queries run at the same time.
    const [tasks, goals, moods, workouts, academics] = await Promise.all([
      Task.find({ userId }).sort({ createdAt: -1 }).limit(20),
      Goal.find({ userId }).sort({ createdAt: -1 }).limit(10),
      Mood.find({ userId }).sort({ date: -1 }).limit(7),
      Workout.find({ userId, date: { $gte: week } }),
      Academic.find({ userId }),
    ]);

    /* ── 4. Compute summary stats for the AI context ────────────────────── */
    const pendingTasks   = tasks.filter(t => t.status !== "completed");
    const completedTasks = tasks.filter(t => t.status === "completed");
    const avgMood   = moods.length ? (moods.reduce((s, m) => s + m.mood,   0) / moods.length).toFixed(1) : "N/A";
    const avgEnergy = moods.length ? (moods.reduce((s, m) => s + m.energy, 0) / moods.length).toFixed(1) : "N/A";
    const activeGoals = goals.filter(g => g.status !== "completed");

    /* ── 5. Build the system prompt ─────────────────────────────────────────
     * The system prompt is a set of instructions + data given to the AI
     * before the conversation starts. It tells Gemini:
     *  - What role to play (life advisor with RPG theme)
     *  - How to respond (concise, bullet points, etc.)
     *  - The user's actual data snapshot
     *
     * Template literals (backtick strings) let us embed variables with ${}.
     */
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

    /* ── 6. Build Gemini-compatible chat history ────────────────────────────
     * Gemini's API requires:
     *  - History = all messages EXCEPT the latest one (that's sent separately)
     *  - History must start with role "user" (not "model")
     *  - Roles must alternate user/model
     *
     * We filter out the client-side greeting (an "assistant" message at index 0)
     * and any other leading assistant messages before sending to Gemini.
     */
    const allButLast = messages.slice(0, -1).filter(
      (m: { role: string }) => m.role === "user" || m.role === "assistant"
    );
    // Walk forward until we find the first user message.
    let startIdx = 0;
    while (startIdx < allButLast.length && allButLast[startIdx].role !== "user") startIdx++;

    // Map our "assistant" role name to Gemini's "model" role name.
    const history = allButLast.slice(startIdx).map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    /* ── 7. Call Gemini API ─────────────────────────────────────────────────
     * `systemInstruction` is the correct way to pass a system prompt in the
     * newer Gemini SDK — it's separate from the chat history.
     * `startChat({ history })` creates a stateful chat session.
     * `sendMessage(lastMessage)` sends the user's latest message and gets a reply.
     */
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
    // Log the full error on the server, return a safe message to the client.
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[chat/route]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
