// src/db.ts
import Dexie from "dexie";
import { format } from "date-fns";
import { nanoid } from "nanoid";
import type { Habit, Entry, Reminder, Prompt } from "./types";

// ------------------ Database ------------------

export class MnemoDB extends Dexie {
  habits!: Dexie.Table<Habit, string>;
  entries!: Dexie.Table<Entry, string>;
  reminders!: Dexie.Table<Reminder, string>;
  prompts!: Dexie.Table<Prompt, string>;

  constructor() {
    super("mnemo-db");
    this.version(1).stores({
      habits: "id, category, active, createdAt",
      entries: "id, habitId, date, createdAt",
      reminders: "id, habitId, enabled, createdAt",
      prompts: "id, habitId",
    });
  }
}

export const db = new MnemoDB();

export const todayISO = () => format(new Date(), "yyyy-MM-dd");

// ------------------ CRUD Helpers ------------------

export async function upsertHabit(h: Habit) {
  await db.habits.put(h);
}

export async function listActiveHabits(): Promise<Habit[]> {
  return db.habits.where("active").equals(1 as any).toArray();
}

export async function listAllHabits(): Promise<Habit[]> {
  return db.habits.toArray();
}

export async function logBinary(habitId: string) {
  const d = todayISO();
  const existing = await db.entries.where({ habitId, date: d }).first();
  if (existing) {
    await db.entries.delete(existing.id);
    return { removed: true };
  } else {
    await db.entries.add({
      id: nanoid(),
      habitId,
      date: d,
      createdAt: new Date().toISOString(),
    });
    return { added: true };
  }
}

export async function logAmount(
  habitId: string,
  amount: number,
  memo?: string
) {
  const d = todayISO();
  const existing = await db.entries.where({ habitId, date: d }).first();
  if (existing) {
    existing.amount = amount;
    existing.memo = memo;
    await db.entries.put(existing);
  } else {
    await db.entries.add({
      id: nanoid(),
      habitId,
      date: d,
      amount,
      memo,
      createdAt: new Date().toISOString(),
    });
  }
}

export async function entriesFor(habitId: string, dateISO: string) {
  return db.entries.where({ habitId, date: dateISO }).toArray();
}

// ------------------ Seed: Memory Plan ------------------

export async function seedIfEmpty() {
  const count = await db.habits.count();
  if (count > 0) return false;

  const now = new Date().toISOString();

  const H = (
    data: Omit<Habit, "id" | "createdAt" | "active"> & { active?: boolean }
  ): Habit => ({
    id: nanoid(),
    createdAt: now,
    active: data.active ?? true,
    ...data,
  });

  const habits: Habit[] = [
    // Alcohol Management
    H({ title: "Cap ≤4 drinks", icon: "🍺", type: "binary", category: "Alcohol", color: "purple", frequency: { mode: "custom", note: "Only on drinking nights" } }),
    H({ title: "Water after each drink", icon: "🚰", type: "counter", unit: "glasses", target: 4, category: "Alcohol", color: "purple", frequency: { mode: "custom" } }),
    H({ title: "Front-load social time", icon: "🕒", type: "binary", category: "Alcohol", color: "purple", frequency: { mode: "custom" } }),

    // Sleep Stabilization
    H({ title: "Magnesium glycinate 400mg", icon: "💊", type: "binary", category: "Sleep", color: "purple", frequency: { mode: "daily" } }),
    H({ title: "Blue-light cut 60m pre-bed", icon: "📵", type: "binary", category: "Sleep", color: "purple", frequency: { mode: "daily" } }),
    H({ title: "Consistent sleep/wake", icon: "⏰", type: "binary", category: "Sleep", color: "purple", frequency: { mode: "daily" } }),

    // Daily Memory Primers
    H({ title: "Yesterday recall (3 items)", icon: "📝", type: "binary", category: "Primers", color: "purple", frequency: { mode: "daily" } }),
    H({ title: "Mental math burst (10)", icon: "➗", type: "counter", unit: "problems", target: 10, category: "Primers", color: "purple", frequency: { mode: "daily" } }),
    H({ title: "Name & image link", icon: "🎯", type: "binary", category: "Primers", color: "purple", frequency: { mode: "custom", note: "When meeting someone new" } }),

    // Pro / AI
    H({ title: "Code tracing (5–10m)", icon: "💻", type: "duration", unit: "min", target: 10, category: "ProAI", color: "purple", frequency: { mode: "daily" } }),
    H({ title: "Mini-AI explainer (2–3 sent.)", icon: "🤖", type: "binary", category: "ProAI", color: "purple", frequency: { mode: "daily" } }),

    // Supplements
    H({ title: "Omega-3 (1–2g)", icon: "🧠", type: "binary", category: "Supplements", color: "purple", frequency: { mode: "daily" } }),
    H({ title: "B-complex", icon: "🧪", type: "binary", category: "Supplements", color: "purple", frequency: { mode: "daily" } }),

    // Fitness + blood flow
    H({ title: "Cardio (20–30m)", icon: "🏃‍♂️", type: "duration", unit: "min", target: 30, category: "Fitness", color: "purple", frequency: { mode: "custom", note: "4–5×/week" } }),

    // Structured brain training
    H({ title: "Dual N-back", icon: "🧩", type: "binary", category: "NBack", color: "purple", frequency: { mode: "custom", note: "3×/week" } }),
    H({ title: "Memory palace list", icon: "🏛️", type: "binary", category: "MemoryPalace", color: "purple", frequency: { mode: "custom", note: "2×/week" } }),

    // Social + memory overlap
    H({ title: "Remember 2 names + facts", icon: "🗣️", type: "binary", category: "Social", color: "purple", frequency: { mode: "custom", note: "On social nights" } }),

    // Weekly reflection
    H({ title: "Weekly reflection (3 prompts)", icon: "📒", type: "binary", category: "Reflection", color: "purple", frequency: { mode: "weekly", daysOfWeek: [7] }, active: true }),

    // Long-term: Alcohol reset
    H({ title: "Alcohol-free 2 weeks", icon: "🛑", type: "binary", category: "LongTerm", color: "purple", frequency: { mode: "custom", note: "Every 3 months" }, active: false }),
  ];

  const prompts: Prompt[] = [];
  const byTitle = (t: string) => habits.find(h => h.title === t)!;

  // Guided logging prompts
  prompts.push(
    { id: nanoid(), habitId: byTitle("Yesterday recall (3 items)").id, lines: [
      "What did you wear?",
      "What did you eat/drink?",
      "One conversation detail?"
    ]},
    { id: nanoid(), habitId: byTitle("Mini-AI explainer (2–3 sent.)").id, lines: [
      "Pick a concept (e.g., overfitting, embeddings, gradient descent).",
      "Explain in 2–3 sentences as if to a junior dev."
    ]},
    { id: nanoid(), habitId: byTitle("Weekly reflection (3 prompts)").id, lines: [
      "Best recall moment this week.",
      "Worst memory miss.",
      "One change to try next week."
    ]},
    { id: nanoid(), habitId: byTitle("Name & image link").id, lines: [
      "Repeat their name out loud.",
      "Link it to a mental image (mnemonic).",
      "Recall it later today."
    ]}
  );

  await db.transaction("rw", db.habits, db.prompts, async () => {
    await db.habits.bulkAdd(habits);
    await db.prompts.bulkAdd(prompts);
  });

  return true;
}

// ------------------ Debug Helpers ------------------

export function exposeDebug() {
  (globalThis as any).dbDump = async () => {
    const [habits, prompts, entries] = await Promise.all([
      db.habits.toArray(),
      db.prompts.toArray(),
      db.entries.toArray(),
    ]);
    console.log({ habits, prompts, entries });
    return { habits, prompts, entries };
  };

  (globalThis as any).dbReset = async () => {
    await db.delete();
    location.reload();
  };
}
