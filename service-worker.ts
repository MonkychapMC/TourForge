// service-worker.ts
const CACHE_NAME = 'tourforge-v1.5.0'; // Updated version
// Cache only essential, local files for a reliable install.
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install a service worker
self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching essential app shell files.');
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch(err => {
        console.error('Failed to cache essential files during install:', err);
      })
  );
});

// Cache and return requests using a "Cache first, falling back to network" strategy.
self.addEventListener('fetch', (event: any) => {
  // We only want to handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Check the cache for a matching request.
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        // If we found a match in the cache, return it.
        return cachedResponse;
      }

      // If the request is not in the cache, fetch it from the network.
      try {
        const networkResponse = await fetch(event.request);
        
        // If the fetch is successful, clone the response and store it in the cache.
        // We only cache valid, successful (200) responses.
        if (networkResponse && networkResponse.status === 200) {
          cache.put(event.request, networkResponse.clone());
        }

        // Return the response from the network.
        return networkResponse;
      } catch (error) {
        // The fetch failed, likely due to a network error.
        console.error('Network request failed:', error);
        // Optionally, you could return a custom offline page here.
        // For now, we'll let the browser's default error handling take over.
        throw error;
      }
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
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
