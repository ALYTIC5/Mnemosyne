export function registerSW() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        await navigator.serviceWorker.register("/sw.js");
        console.log("[PWA] SW registered");
      } catch (err) {
        console.error("[PWA] SW registration failed:", err);
      }
    });
  }
}
