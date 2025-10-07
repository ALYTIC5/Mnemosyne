// src/types.ts
export type HabitType = "binary" | "counter" | "duration" | "quantity";

export type Category =
  | "Alcohol"
  | "Sleep"
  | "Primers"
  | "ProAI"
  | "Supplements"
  | "Fitness"
  | "NBack"
  | "MemoryPalace"
  | "Social"
  | "Reflection"
  | "LongTerm";

export interface Habit {
  id: string;
  title: string;
  icon?: string;         // emoji or short code
  type: HabitType;
  unit?: string;         // "min", "ml", "problems"
  target?: number;       // e.g. 30 min, 3000 ml, 10 problems
  color?: "purple" | "cyan" | "pink" | "amber" | "gray";
  category: Category;
  frequency:
    | { mode: "daily" }
    | { mode: "weekly"; daysOfWeek: number[] } // 1=Mon..7=Sun
    | { mode: "custom"; note?: string };
  active: boolean;       // whether shown on Home
  createdAt: string;     // ISO timestamp
  archived?: boolean;
}

export interface Entry {
  id: string;
  habitId: string;
  date: string;          // YYYY-MM-DD in local time
  amount?: number;       // used for counter/quantity/duration
  memo?: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  habitId: string;
  type: "time" | "location";
  time?: string;         // "HH:mm"
  location?: { lat: number; lng: number; radiusM: number };
  enabled: boolean;
  createdAt: string;
}

export interface Prompt {
  id: string;
  habitId: string;
  lines: string[];       // bullets to show when logging
}
