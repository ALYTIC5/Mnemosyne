# 🧠 Mnemosyne

**Mnemosyne** is a dark, minimalist, offline-first **memory improvement and habit tracking web app** — inspired by the Greek goddess of memory.  
Built with **React, Vite, TypeScript, TailwindCSS (v4)**, and **Dexie.js (IndexedDB)**, it’s designed to feel like a native iOS app while running entirely free and locally in your browser.

---

## 🌌 Concept

Mnemosyne is a personalized system for tracking and improving **memory, focus, and cognitive resilience** through small, science-backed habits.

It integrates mental, physical, and lifestyle actions into a unified, data-backed tracker — blending wellness with daily reflection and self-feedback.

---

## 🧭 Core Philosophy

The app is structured around two time horizons:

### 🔹 Short-Term Plan (0–4 weeks)
- **Alcohol management:** track limits and hydration patterns  
- **Sleep stabilization:** build consistency using magnesium, light control, and timing  
- **Memory primers:** small daily recall, math, and name-linking drills  
- **Professional/A.I. cognition:** code tracing, micro AI explainers  
- **Supplements:** Omega-3, B-complex, Magnesium

### 🔹 Long-Term Plan (3–12 months)
- **Alcohol resets:** 2-week resets each quarter  
- **Fitness and cardio:** support hippocampal blood flow  
- **Structured brain training:** Dual N-Back, memory palace, problem-solving  
- **Social recall:** train memory through names, facts, and follow-ups  
- **Reflection tracking:** weekly journal loops for memory self-assessment  

Each category is broken into habits and prompts that can be toggled daily. Mnemosyne acts as both a **planner** and a **reflection partner**.

---

## 🚀 Current Phase: **Phase 3 — Core Build Complete**

✅ *Fully functional PWA and offline-first habit tracker.*

### Features implemented:
- **Offline-first PWA** (installable on iOS/Android & Desktop)
- **Service Worker** + **Web Manifest**
- **Dexie.js IndexedDB** with pre-seeded memory improvement plan
- **Dark theme UI** with Mnemosyne violet accent `#BB4CFF`
- **Tap-to-complete habits** with persistence across sessions
- **Modal-based reflection prompts**
- **Dynamic progress bar (% of daily habits completed)**
- **Automatic data seeding on first load**
- **Responsive for mobile-first use**

---

## 🧩 Technology Stack

| Layer | Tech |
|:------|:-----|
| Framework | [React](https://react.dev/) (with Vite + TypeScript) |
| Styling | [TailwindCSS v4](https://tailwindcss.com/) |
| Database | [Dexie.js](https://dexie.org/) (IndexedDB wrapper) |
| PWA | Web Manifest + Service Worker |
| Icons | [Lucide React](https://lucide.dev/icons) |
| UI Components | Radix UI Dialog for modals |

---

## 🧱 Architecture Overview

src/
├─ components/
│ └─ PromptModal.tsx # Reflection modal UI
│
├─ db.ts # Dexie database setup and seed
├─ types.ts # Habit & schema interfaces
├─ App.tsx # Main UI: categories, habits, progress bar
├─ index.css # Tailwind v4 + Mnemosyne dark theme
├─ main.tsx # App entry point + PWA registration
└─ pwa.ts # Handles service worker registration

ruby
Copy code

---

## 🧠 App Functionality (Phase 3)

| Category | Description |
|:----------|:-------------|
| **Daily Tracker** | Tapping a habit logs it for the day (binary or incremental). |
| **Reflection Prompts** | Some habits open journaling-style modals with self-review questions. |
| **Offline Database** | Dexie ensures all entries sync locally; no cloud dependencies. |
| **Daily Progress** | Shows total % of habits completed for the day. |
| **Responsive Layout** | Scales beautifully for iPhone-sized devices (optimized for mobile use). |

---

## 🗺️ Roadmap

| Phase | Status | Description |
|:------|:--------|:-------------|
| **Phase 1** | ✅ | PWA shell, manifest, icons, service worker |
| **Phase 2** | ✅ | Dexie database setup + seed with memory plan |
| **Phase 3** | ✅ | Dark aesthetic UI, reflection modals, progress tracking |
| **Phase 4** | 🚧 | Local push notifications + reminders system |
| **Phase 5** | 🚧 | Habit analytics dashboard (streaks, trends, charts) |
| **Phase 6** | 🚧 | Data export/import (JSON or cloud backup) |
| **Phase 7** | 🚧 | Advanced AI reflection assistant integration |

---

## 📲 Using Mnemosyne

### 💻 Development
```cmd
npm install
npm run dev
Then open:

arduino
Copy code
http://localhost:5173
📦 Production Build
cmd
Copy code
npm run build
npm run preview
Then open:

arduino
Copy code
http://localhost:4173
📱 Installing on iPhone
Open the preview URL in Safari.

Tap the Share icon → Add to Home Screen.

Mnemosyne now behaves as a standalone app (offline ready, full screen).

💜 Design Aesthetic
Primary Accent: #BB4CFF (Mnemosyne violet)

Background: #0B1117 (true black)

Surface Layers: #151B24

Typography: soft gray text, rounded corners, motion-sensitive hover states

Philosophy: minimal, symbolic, memory-oriented

🧩 Credits
Built with 💜 by ALYTIC5

🧰 License
This project is licensed under the MIT License.
You’re free to fork, build, and expand Mnemosyne for personal or research use.