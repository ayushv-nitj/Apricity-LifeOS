import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";
import Workout from "@/models/Workout";
import Mood from "@/models/Mood";
import Goal from "@/models/Goal";
import Academic from "@/models/Academic";
import Meal from "@/models/Meal";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });

  await connectDB();
  const userId = session.user.id;
  const week = new Date(Date.now() - 7 * 86400000);

  // Gather weekly stats
  const [tasks, workouts, moods, goals, academics, meals] = await Promise.all([
    Task.find({ userId }),
    Workout.find({ userId, date: { $gte: week } }),
    Mood.find({ userId }).sort({ date: -1 }).limit(7),
    Goal.find({ userId }),
    Academic.find({ userId }),
    Meal.find({ userId, date: { $gte: week } }),
  ]);

  const completedTasks = tasks.filter(t => t.status === "completed");
  const pendingTasks = tasks.filter(t => t.status !== "completed");
  const activeHabits = tasks.filter(t => t.isHabit);
  const completedHabits = activeHabits.filter(t => t.status === "completed");
  const avgMood = moods.length ? (moods.reduce((s, m) => s + m.mood, 0) / moods.length).toFixed(1) : "N/A";
  const avgEnergy = moods.length ? (moods.reduce((s, m) => s + m.energy, 0) / moods.length).toFixed(1) : "N/A";
  const totalCalories = meals.reduce((s, m) => s + m.calories, 0);
  const avgStudyHours = academics.length ? (academics.reduce((s, a) => s + a.hoursStudied, 0) / academics.length).toFixed(1) : "0";
  const goalsInProgress = goals.filter(g => g.status === "in-progress");
  const completedGoals = goals.filter(g => g.status === "completed");

  const prompt = `You are an AI life coach for a personal life OS dashboard called Apricity. 
Analyze this user's weekly data and give concise, actionable advice.

WEEKLY STATS:
- Tasks completed: ${completedTasks.length} / ${tasks.length} total (${pendingTasks.length} pending)
- Habits tracked: ${completedHabits.length} / ${activeHabits.length} completed
- Workouts this week: ${workouts.length}
- Meals logged this week: ${meals.length} (${totalCalories} total calories)
- Average mood: ${avgMood}/10
- Average energy: ${avgEnergy}/10
- Goals in progress: ${goalsInProgress.length}, completed: ${completedGoals.length}
- Average study hours per subject: ${avgStudyHours}h
- Top habit streaks: ${activeHabits.slice(0, 3).map(h => `${h.title} (${h.streak} days)`).join(", ") || "none"}
- Pending tasks: ${pendingTasks.slice(0, 5).map(t => t.title).join(", ") || "none"}

Respond with a JSON object in this exact format (no markdown, no code blocks, raw JSON only):
{
  "greeting": "one short personalized greeting line (max 12 words)",
  "overallScore": <number 0-100 representing overall life balance this week>,
  "summary": "2-3 sentence honest summary of their week",
  "suggestions": [
    { "area": "Health", "icon": "💪", "tip": "specific actionable tip based on their data" },
    { "area": "Productivity", "icon": "⚡", "tip": "specific actionable tip based on their data" },
    { "area": "Mental", "icon": "🧠", "tip": "specific actionable tip based on their data" }
  ],
  "highlight": "one thing they did well this week (be specific)",
  "challenge": "one specific challenge for next week"
}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
        }),
      }
    );

    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Strip any accidental markdown fences
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const advice = JSON.parse(cleaned);

    return NextResponse.json(advice);
  } catch {
    return NextResponse.json({ error: "Failed to generate advice" }, { status: 500 });
  }
}
