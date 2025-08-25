// Simple Service Worker for basic caching
const CACHE_NAME = 'quran-reader-v1';
const CACHE_URLS = [
  '/',
  '/search',
  '/settings',
  '/manifest.json',
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(CACHE_URLS);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip API calls and external resources
  if (
    event.request.url.includes('/api/') ||
    event.request.url.includes('api.quran.com') ||
    event.request.url.includes('api.alquran.cloud') ||
    event.request.url.includes('audio.qurancdn.com')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request)
          .then((response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Add to cache if it's a navigation request or static asset
            if (
              event.request.mode === 'navigate' ||
              event.request.url.includes('.js') ||
              event.request.url.includes('.css') ||
              event.request.url.includes('.png') ||
              event.request.url.includes('.jpg') ||
              event.request.url.includes('.svg')
            ) {
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          })
          .catch(() => {
            // If both cache and network fail, return offline page for navigation
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
          });
      })
  );
});

// Handle background sync for bookmarks and last read position
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-bookmarks') {
    event.waitUntil(syncBookmarks());
  }
});

// Simple background sync for bookmarks (placeholder)
async function syncBookmarks() {
  // This would typically sync local bookmarks with a server
  // For now, we just log the sync attempt
  console.log('Background sync: bookmarks');
}

// Handle push notifications (placeholder for future implementation)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const options = {
    body: event.data.text(),
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open Quran Reader',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Quran Reader', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});