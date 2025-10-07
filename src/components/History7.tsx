// src/components/History7.tsx
import { useEffect, useState } from "react";
import { db } from "../db";
import type { Habit, Entry } from "../types";
import { lastNDays, shortLabel } from "../utils";

type DayStat = { date: string; done: number; total: number; pct: number };

export default function History7() {
  const [stats, setStats] = useState<DayStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Get ALL habits, then filter active in JS (avoids Dexie boolean pitfalls)
      const allHabits: Habit[] = await db.habits.toArray();
      const activeHabits = allHabits.filter((h) => !!h.active);
      const total = activeHabits.length;

      const days = lastNDays(7);
      const results: DayStat[] = [];

      for (const d of days) {
        const entries: Entry[] = await db.entries.where("date").equals(d).toArray();
        const doneSet = new Set(entries.map((e) => e.habitId));
        const done = doneSet.size;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        results.push({ date: d, done, total, pct });
      }

      setStats(results);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="text-center text-gray-400 py-8">Loading history…</div>;

  // Render bars using pixel heights (more robust than % here)
  const CHART_HEIGHT = 160; // px
  const minPx = 6;

  const avg =
    Math.round(stats.reduce((a, b) => a + (Number.isFinite(b.pct) ? b.pct : 0), 0) / (stats.length || 1)) || 0;

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-primaryDark mb-2">Last 7 Days</h2>

      <div
        className="grid grid-cols-7 gap-3 items-end bg-surface border border-surface rounded-3xl p-4"
        style={{ height: CHART_HEIGHT + 40 }} // extra room for weekday labels
      >
        {stats.map((s) => {
          const px = Math.max(
            minPx,
            Math.round(((Number.isFinite(s.pct) ? s.pct : 0) / 100) * CHART_HEIGHT)
          );
          return (
            <div key={s.date} className="flex flex-col items-center justify-end gap-2">
              <div
                className="w-6 bg-primary rounded-full shadow-[0_0_10px_rgba(187,76,255,0.5)]"
                style={{ height: px }}
                title={`${shortLabel(s.date)}: ${s.pct}% (${s.done}/${s.total})`}
              />
              <div className="text-[10px] text-gray-400">{shortLabel(s.date)}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-sm text-gray-300">
        <p>
          Average completion:{" "}
          <span className="text-primary font-medium">{avg}%</span>
        </p>
      </div>
    </div>
  );
}
