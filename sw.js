const CACHE_NAME = 'ayanava-pwa-v2';

// Core shell assets required for the app to function offline
const CORE_PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/research.html',
  '/career.html',
  '/cv.html',
  '/assets/styles.css',
  '/assets/site.js',
  '/assets/ad-logo.svg',
  '/assets/icon-192.png',
  '/assets/icon-maskable-192.png',
  '/assets/icon-512.png',
  '/assets/icon-maskable-512.png',
  '/assets/apple-touch-icon.png',
  '/manifest.json'
];

// Optional assets cached in the background without blocking service worker installation
const OPTIONAL_PRECACHE_ASSETS = [
  '/assets/ayanava-dasgupta.png',
  '/assets/ayanava-cv-portrait-retouched.png',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  // Activate worker immediately once downloaded
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Cache critical assets first (guaranteed to succeed quickly)
      try {
        await cache.addAll(CORE_PRECACHE_ASSETS);
      } catch (err) {
        console.warn('PWA core precache warning:', err);
      }
      
      // 2. Opportunistically cache heavier assets
      for (const url of OPTIONAL_PRECACHE_ASSETS) {
        try {
          await cache.add(url);
        } catch (e) {
          // Ignore individual non-critical failures
        }
      }
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle HTTP/HTTPS GET requests
  if (request.method !== 'GET') return;
  if (!request.url.startsWith('http://') && !request.url.startsWith('https://')) return;

  // For HTML page navigations, use Network-First with Cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            // Fallback to home page if offline
            return caches.match('/') || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // For static assets (CSS, JS, images, fonts, manifests), use Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed; return cached response if available
        });

      return cachedResponse || fetchPromise;
    })
  );
});
