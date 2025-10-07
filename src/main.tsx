import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// add these imports
import { seedIfEmpty, exposeDebug } from "./db";

// run once on boot
seedIfEmpty().then((seeded) => {
  if (seeded) console.log("[DB] Seeded memory plan.");
  exposeDebug();
});

import { registerSW } from "./pwa";

// Only register SW in production builds (npm run preview / deployed)
if (import.meta.env.PROD) {
  registerSW();
}

import "./index.css";
