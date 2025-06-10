const CACHE_NAME = 'web-queue-v2';
const STATIC_CACHE_NAME = 'web-queue-static-v2';

// Critical assets to cache immediately with high priority
const CRITICAL_ASSETS = [
  '/squad-logo.svg',
  '/favicon.ico',
];

// Secondary assets to cache
const STATIC_ASSETS = [
  '/',
  '/dept_icons/web.png',
  '/dept_icons/social.png', 
  '/dept_icons/brand.png',
];

// Install event - cache critical assets first
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache critical assets with high priority
      caches.open(STATIC_CACHE_NAME)
        .then((cache) => {
          return cache.addAll(CRITICAL_ASSETS);
        }),
      // Cache secondary assets
      caches.open(CACHE_NAME)
        .then((cache) => {
          return cache.addAll(STATIC_ASSETS.filter(url => !url.endsWith('/')));
        })
    ]).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Handle critical assets with cache-first strategy
  if (CRITICAL_ASSETS.some(asset => event.request.url.includes(asset))) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((response) => {
          const responseClone = response.clone();
          caches.open(STATIC_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        });
      })
    );
    return;
  }
  
  // Handle API requests with network-first strategy
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }
  
  // Handle other requests with stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((response) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      });
      
      return response || fetchPromise;
    })
  );
});

// Handle page visibility changes to optimize performance
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Cleanup resources when page is hidden
self.addEventListener('pagehide', (event) => {
  // Cleanup any ongoing requests or timers
  if (event.persisted) {
    // Page is being persisted in bfcache
    return;
  }
  
  // Page is being unloaded
  // Cleanup operations here
});

// Optimize for back/forward cache
self.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    // Page was restored from bfcache
    // Re-initialize if needed
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'PAGE_RESTORED_FROM_BFCACHE'
        });
      });
    });
  }
}); 