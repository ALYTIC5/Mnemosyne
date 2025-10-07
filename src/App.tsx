// src/App.tsx
import { useEffect, useState } from "react";
import { db, listAllHabits, logBinary, logAmount, entriesFor, todayISO } from "./db";
import type { Habit, Prompt } from "./types";
import { CheckCircle, Circle, History as HistoryIcon, ListChecks } from "lucide-react";
import clsx from "clsx";
import PromptModal from "./components/PromptModal";
import History7 from "./components/History7";

type Tab = "home" | "history";

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayEntries, setTodayEntries] = useState<Record<string, boolean>>({});
  const [prompts, setPrompts] = useState<Record<string, Prompt>>({});
  const [openPrompt, setOpenPrompt] = useState<Prompt | null>(null);

  useEffect(() => {
    async function load() {
      const all = await listAllHabits();
      const active = all.filter((h) => h.active);
      setHabits(active);

      const entries = await db.entries.where("date").equals(todayISO()).toArray();
      const map: Record<string, boolean> = {};
      for (const e of entries) map[e.habitId] = true;
      setTodayEntries(map);

      const allPrompts = await db.prompts.toArray();
      const pmap: Record<string, Prompt> = {};
      for (const p of allPrompts) pmap[p.habitId] = p;
      setPrompts(pmap);
    }
    load();
  }, []);

  async function toggleHabit(h: Habit) {
    // If this habit has a prompt, show the modal instead of toggling immediately
    if (prompts[h.id]) {
      setOpenPrompt(prompts[h.id]);
      return;
    }
    if (h.type === "binary") {
      const res = await logBinary(h.id);
      setTodayEntries((t) => ({ ...t, [h.id]: res.added ? true : false }));
    } else if (h.type === "counter" || h.type === "duration") {
      const existing = await entriesFor(h.id, todayISO());
      const current = existing[0]?.amount ?? 0;
      const next = Math.min((current || 0) + 1, h.target ?? 999);
      await logAmount(h.id, next);
      setTodayEntries((t) => ({ ...t, [h.id]: next >= (h.target ?? 1) }));
    }
  }

  const grouped = habits.reduce<Record<string, Habit[]>>((acc, h) => {
    (acc[h.category] = acc[h.category] || []).push(h);
    return acc;
  }, {});

  const total = habits.length;
  const done = Object.values(todayEntries).filter(Boolean).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-background text-text px-4 pb-24">
      {/* Title */}
      <header className="py-6 text-center">
        <h1 className="text-3xl font-bold text-primary">Mnemosyne</h1>
        <p className="text-sm text-gray-400 mt-1">Memory & Habit Tracker</p>

        {/* Tabs */}
        <div className="mt-4 inline-flex rounded-xl overflow-hidden border border-primary/40">
          <button
            className={clsx(
              "px-4 py-2 text-sm flex items-center gap-2",
              tab === "home" ? "bg-primary text-white" : "bg-surface text-gray-300"
            )}
            onClick={() => setTab("home")}
            title="Today"
          >
            <ListChecks className="w-4 h-4" /> Today
          </button>
          <button
            className={clsx(
              "px-4 py-2 text-sm flex items-center gap-2",
              tab === "history" ? "bg-primary text-white" : "bg-surface text-gray-300"
            )}
            onClick={() => setTab("history")}
            title="History"
          >
            <HistoryIcon className="w-4 h-4" /> History
          </button>
        </div>

        {/* Notifications quick actions (local test) */}
        {tab === "home" && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              className="px-3 py-1 rounded-lg bg-surface border border-primary/40 text-xs text-gray-300 hover:bg-primary/20"
              onClick={async () => {
                const { requestNotificationPermission, showLocalNotification } = await import("./notifications");
                const perm = await requestNotificationPermission();
                if (perm === "granted") {
                  showLocalNotification("Mnemosyne", "Notifications enabled ✅");
                } else {
                  alert("Permission not granted.");
                }
              }}
            >
              Enable notifications
            </button>
            <button
              className="px-3 py-1 rounded-lg bg-surface border border-primary/40 text-xs text-gray-300 hover:bg-primary/20"
              onClick={async () => {
                const { showLocalNotification } = await import("./notifications");
                showLocalNotification("Test reminder", "This is a local test.");
              }}
            >
              Test notification
            </button>
          </div>
        )}

        {/* Progress bar for Today */}
        {tab === "home" && (
          <>
            <div className="mt-4 w-full max-w-md mx-auto bg-surface rounded-full h-3 overflow-hidden border border-primary/40">
              <div
                className="bg-primary h-full transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-400">
              {done}/{total} habits completed ({percent}%)
            </p>
          </>
        )}
      </header>

      {/* Content */}
      {tab === "history" ? (
        <History7 />
      ) : (
        <>
          {Object.entries(grouped).map(([category, group]) => (
            <section key={category} className="mb-8 max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-primaryDark mb-3">{category}</h2>
              <div className="grid gap-3">
                {group.map((h) => {
                  const isDone = !!todayEntries[h.id];
                  return (
                    <button
                      key={h.id}
                      onClick={() => toggleHabit(h)}
                      className={clsx(
                        "w-full flex items-center justify-between rounded-2xl px-4 py-3 text-left transition",
                        isDone
                          ? "bg-primary/20 border border-primary"
                          : "bg-surface hover:bg-primaryDark/10 border border-surface"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{h.icon}</span>
                        <div>
                          <p className="font-medium">{h.title}</p>
                          {h.frequency.mode !== "daily" && (
                            <p className="text-sm text-gray-400">
                              {h.frequency.mode === "weekly"
                                ? "Weekly"
                                : h.frequency.note ?? "Custom"}
                            </p>
                          )}
                        </div>
                      </div>
                      {isDone ? (
                        <CheckCircle className="text-primary w-6 h-6" />
                      ) : (
                        <Circle className="text-gray-500 w-6 h-6" />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </>
      )}

      <footer className="text-center text-xs text-gray-500 pt-8 pb-6">
        Offline-first • {new Date().toLocaleDateString()}
      </footer>

      {openPrompt && (
        <PromptModal
          open={!!openPrompt}
          onClose={() => setOpenPrompt(null)}
          title={habits.find((h) => h.id === openPrompt.habitId)?.title || "Reflection"}
          lines={openPrompt.lines}
        />
      )}
    </div>
  );
}
