/* ============================================================
   SERVICE WORKER — For Sneha PWA
   Strategy: Cache-first for assets, network-first for HTML
   ============================================================ */

const CACHE_NAME   = 'sneha-story-v2';
const STATIC_SHELL = [
  './',
  './index.html',
  './ch1.html',
  './ch2.html',
  './ch3.html',
  './ch4.html',
  './ch5.html',
  './our-numbers.html',
  './ch6.html',
  './ch7.html',
  './poem.html',
  './letter.html',
  './final.html',
  './style.css',
  './script.js',
  './manifest.json',
  /* fonts loaded from Google — browser caches them separately */
];

/* ── INSTALL: pre-cache the app shell ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_SHELL);
    })
  );
  self.skipWaiting();
});

/* ── ACTIVATE: clean up old caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* ── FETCH: serve from cache, fallback to network ── */
self.addEventListener('fetch', event => {
  const { request } = event;

  // Only handle GET requests to our own origin
  if (request.method !== 'GET') return;

  // For navigation (HTML) use network-first so updates land quickly
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Update cache with fresh copy
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // For everything else (images, CSS, JS, audio) use cache-first
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        // Don't cache opaque (cross-origin) or error responses
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then(c => c.put(request, clone));
        return response;
      });
    })
  );
});
