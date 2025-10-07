// Mnemosyne minimal, safe SW (UTF-8)
// Caches app shell and serves same-origin requests stale-while-revalidate.

const CACHE_NAME = 'mnemo-cache-v2'; // bump version to drop old cache
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest'];

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // don't touch external requests
  if (url.pathname.startsWith('/src/')) return; // don't cache dev/build files
  if (url.pathname.startsWith('/node_modules/')) return;
});

// Install: precache app shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

// Activate: cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    ).then(() => self.clients.claim())
  );
});

// Fetch: offline-first for SPA navigations; stale-while-revalidate for same-origin GETs
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // For SPA navigations, always serve cached index.html (app shell) with network fallback
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match('/index.html');
      if (cached) return cached;

      try {
        const netRes = await fetch('/index.html');
        if (netRes && netRes.ok) {
          // Put a clone in cache, return original
          await cache.put('/index.html', netRes.clone());
        }
        return netRes;
      } catch {
        // final fallback: empty response
        return new Response('<!doctype html><title>Offline</title><h1>Offline</h1>', {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
    })());
    return;
  }

  // Same-origin: stale-while-revalidate
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      const networkPromise = (async () => {
        try {
          const netRes = await fetch(req);
          if (netRes && netRes.ok && (netRes.type === 'basic' || netRes.type === 'cors')) {
            // Only clone ONCE: one copy for cache, one for return handled by caller
            await cache.put(req, netRes.clone());
          }
          return netRes;
        } catch {
          // if network fails, we just return undefined and fall back to cached
          return undefined;
        }
      })();

      // Return cached immediately if present; else wait for network
      return cached || (await networkPromise) || new Response('', { status: 504 });
    })());
  }
});

// Allow app to activate new SW immediately when sent a message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// (Future) Deep-link from notifications
self.addEventListener('notificationclick', (event) => {
  const url = event.notification?.data?.url || '/';
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('navigate' in client) return client.navigate(url);
      }
      return clients.openWindow(url);
    })
  );
});
