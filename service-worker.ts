// service-worker.ts
const CACHE_NAME = 'tourforge-v1.3.0'; // Updated version
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Lora:wght@400;700&display=swap',
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react-dom@^19.2.0/',
  'https://aistudiocdn.com/@google/genai@^1.29.1',
];

// Install a service worker
self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        const requests = URLS_TO_CACHE.map(url => new Request(url, { mode: 'no-cors' }));
        return cache.addAll(requests).catch(err => {
          console.error('Failed to cache during install:', err);
        });
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', (event: any) => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // We don't cache failed requests or non-basic responses (e.g. from extensions)
            // Opaque responses (no-cors) are fine to cache for offline support.
            if (!response || (response.status !== 200 && response.type !== 'opaque') || (response.type === 'basic' && response.status !== 200)) {
              return response;
            }

            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(err => {
            console.warn(`Fetch failed for ${event.request.url}; returning offline fallback if available.`);
            return caches.match(event.request);
        });
      })
  );
});

// Update a service worker
self.addEventListener('activate', (event: any) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
