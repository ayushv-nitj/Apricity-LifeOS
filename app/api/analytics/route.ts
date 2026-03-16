/**
 * app/api/analytics/route.ts — Analytics Data Endpoint
 *
 * HTTP Method: GET
 * URL: /api/analytics
 * Protected: Yes
 *
 * Returns four datasets used by the Analytics page and dashboard widgets:
 *
 * 1. weeklyData   — tasks completed, habits done, and XP earned per day (last 7 days)
 * 2. categoryData — count of tasks per category (for the pie chart)
 * 3. monthlyXP    — XP earned per day over the last 30 days (for the area chart)
 * 4. radarData    — life balance scores (0-100) for 6 life dimensions
 *
 * Life Radar scoring methodology:
 *  Each of the 6 axes is computed from its own relevant data sources.
 *  Scores use a weighted formula: score = Σ(metric / target) * weight * 100
 *  The `clamp()` function ensures scores stay within 0-100.
 *  The `score()` helper converts a raw value to a 0-100 percentage of a target.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";
import Workout from "@/models/Workout";
import Mood from "@/models/Mood";
import Goal from "@/models/Goal";
import Academic from "@/models/Academic";
import Meal from "@/models/Meal";
import Contact from "@/models/Contact";
import Note from "@/models/Note";

/** Clamp a value between 0 and 100 */
function clamp(v: number) { return Math.min(100, Math.max(0, Math.round(v))); }

/**
 * Score a dimension 0-100 based on actual data.
 * Uses a soft-cap curve so early activity gives good scores
 * but you need consistent effort to reach 100.
 */
function score(value: number, target: number): number {
  if (target === 0) return 0;
  return clamp((value / target) * 100);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();

  const userId = session.user.id;
  const now = new Date();
  const week = new Date(now.getTime() - 7 * 86400000);
  const month = new Date(now.getTime() - 30 * 86400000);

  // ── Weekly productivity data ─────────────────────────────────────────────
  const days: { day: string; date: Date }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({ day: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()], date: d });
  }

  const weeklyData = await Promise.all(
    days.map(async ({ day, date }) => {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end = new Date(date); end.setHours(23, 59, 59, 999);
      const tasks = await Task.find({ userId, createdAt: { $gte: start, $lte: end } });
      const completed = tasks.filter(t => t.status === "completed");
      const xp = completed.reduce((s, t) => s + t.xpReward, 0);
      const habits = tasks.filter(t => t.isHabit && t.status === "completed").length;
      return { day, tasks: completed.length, habits, xp };
    })
  );

  // ── Category breakdown ───────────────────────────────────────────────────
  const allTasks = await Task.find({ userId });
  const catMap: Record<string, number> = {};
  allTasks.forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + 1; });
  const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

  // ── 30-day XP timeline ───────────────────────────────────────────────────
  const monthlyXP = await Promise.all(
    Array.from({ length: 30 }, async (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const start = new Date(d); start.setHours(0, 0, 0, 0);
      const end = new Date(d); end.setHours(23, 59, 59, 999);
      const tasks = await Task.find({ userId, status: "completed", completedAt: { $gte: start, $lte: end } });
      const xp = tasks.reduce((s, t) => s + t.xpReward, 0);
      return { day: i + 1, xp };
    })
  );

  // ── Life Radar — each axis computed from its own real data ───────────────

  // 1. HEALTH — workouts this week + diet tracking + energy from mood
  const workoutsThisWeek = await Workout.countDocuments({ userId, date: { $gte: week } });
  const mealsThisWeek = await Meal.countDocuments({ userId, date: { $gte: week } });
  const moodDocs = await Mood.find({ userId }).sort({ date: -1 }).limit(14);
  const avgEnergy = moodDocs.length
    ? moodDocs.reduce((s, m) => s + m.energy, 0) / moodDocs.length  // 1-10 scale
    : 5;
  // Target: 4 workouts/week (50pts), 14 meals/week (30pts), energy avg 7/10 (20pts)
  const healthScore = clamp(
    score(workoutsThisWeek, 4) * 0.5 +
    score(mealsThisWeek, 14) * 0.3 +
    (avgEnergy / 10) * 100 * 0.2
  );

  // 2. CAREER — completed work tasks (all time) + active work goals progress
  const workTasksDone = allTasks.filter(t => t.category === "work" && t.status === "completed").length;
  const workGoals = await Goal.find({ userId, category: "career" });
  const avgWorkGoalProgress = workGoals.length
    ? workGoals.reduce((s, g) => s + g.progress, 0) / workGoals.length
    : 0;
  // Target: 20 completed work tasks (60pts) + goal progress (40pts)
  const careerScore = clamp(
    score(workTasksDone, 20) * 0.6 +
    avgWorkGoalProgress * 0.4
  );

  // 3. LEARNING — academic progress + study hours + learning goals
  const academics = await Academic.find({ userId });
  const avgAcademicProgress = academics.length
    ? academics.reduce((s, a) => s + a.progress, 0) / academics.length
    : 0;
  const totalStudyHours = academics.reduce((s, a) => s + a.hoursStudied, 0);
  const learningGoals = await Goal.find({ userId, category: "learning" });
  const avgLearningGoalProgress = learningGoals.length
    ? learningGoals.reduce((s, g) => s + g.progress, 0) / learningGoals.length
    : 0;
  const noteCount = await Note.countDocuments({ userId });
  // Target: avg 70% academic progress (40pts) + 20 study hours (30pts) + goal progress (20pts) + notes (10pts)
  const learningScore = clamp(
    (avgAcademicProgress / 100) * 100 * 0.4 +
    score(totalStudyHours, 20) * 0.3 +
    avgLearningGoalProgress * 0.2 +
    score(noteCount, 10) * 0.1
  );

  // 4. RELATIONSHIPS — contacts tracked + avg affinity + relationship goals
  const contacts = await Contact.find({ userId });
  const relationshipContacts = contacts.filter(c => c.type === "relationship");
  const familyContacts = contacts.filter(c => c.type === "family");
  const avgAffinity = contacts.length
    ? contacts.reduce((s, c) => s + c.affinity, 0) / contacts.length
    : 0;
  const avgBond = familyContacts.length
    ? familyContacts.reduce((s, c) => s + (c.bondLevel || 80), 0) / familyContacts.length
    : 0;
  const relGoals = await Goal.find({ userId, category: "relationships" });
  const avgRelGoalProgress = relGoals.length
    ? relGoals.reduce((s, g) => s + g.progress, 0) / relGoals.length
    : 0;
  // Target: 5 relationship contacts (30pts) + avg affinity (40pts) + family bond (20pts) + goals (10pts)
  const relationScore = clamp(
    score(relationshipContacts.length, 5) * 0.3 +
    avgAffinity * 0.4 +
    avgBond * 0.2 +
    avgRelGoalProgress * 0.1
  );

  // 5. MENTAL — mood score + journaling (notes) + personal goals + habit streaks
  const avgMood = moodDocs.length
    ? moodDocs.reduce((s, m) => s + m.mood, 0) / moodDocs.length  // 1-10 scale
    : 5;
  const personalGoals = await Goal.find({ userId, category: "personal" });
  const avgPersonalGoalProgress = personalGoals.length
    ? personalGoals.reduce((s, g) => s + g.progress, 0) / personalGoals.length
    : 0;
  const habitStreak = allTasks.filter(t => t.isHabit && t.streak > 0).length;
  // Target: mood avg 7/10 (40pts) + notes (20pts) + personal goals (30pts) + habits (10pts)
  const mentalScore = clamp(
    (avgMood / 10) * 100 * 0.4 +
    score(noteCount, 10) * 0.2 +
    avgPersonalGoalProgress * 0.3 +
    score(habitStreak, 5) * 0.1
  );

  // 6. FINANCE — goals in finance/travel category + task completion rate overall
  const financeGoals = await Goal.find({ userId, category: "travel" }); // closest proxy
  const avgFinanceGoalProgress = financeGoals.length
    ? financeGoals.reduce((s, g) => s + g.progress, 0) / financeGoals.length
    : 0;
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.status === "completed").length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  // Target: goal progress (50pts) + overall task completion rate (50pts)
  const financeScore = clamp(
    avgFinanceGoalProgress * 0.5 +
    completionRate * 0.5
  );

  const radarData = [
    { subject: "Health",        value: healthScore,   color: "#34d399" },
    { subject: "Career",        value: careerScore,   color: "#00f5ff" },
    { subject: "Learning",      value: learningScore, color: "#a78bfa" },
    { subject: "Relationships", value: relationScore, color: "#f472b6" },
    { subject: "Mental",        value: mentalScore,   color: "#60a5fa" },
    { subject: "Finance",       value: financeScore,  color: "#fbbf24" },
  ];

  return NextResponse.json({ weeklyData, categoryData, monthlyXP, radarData });
}
