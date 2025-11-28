/**
 * Service Worker for Production Environment
 * Provides offline functionality, caching, and performance optimizations
 */

const CACHE_NAME = 'elp-v1.0.0';
const STATIC_CACHE = 'elp-static-v1.0.0';
const DYNAMIC_CACHE = 'elp-dynamic-v1.0.0';
const API_CACHE = 'elp-api-v1.0.0';

// Cache configuration
const CACHE_CONFIG = {
  // Static assets to cache immediately
  staticAssets: [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.ico',
    '/robots.txt'
  ],
  
  // API endpoints to cache
  apiEndpoints: [
    '/api/health',
    '/api/contact',
    '/api/events/upcoming',
    '/api/posts/featured',
    '/api/members/active'
  ],
  
  // External resources to cache
  externalResources: [
    'https://fonts.googleapis.com/css2',
    'https://fonts.gstatic.com',
    'https://cdn.jsdelivr.net'
  ],
  
  // Cache TTL in seconds
  ttl: {
    static: 30 * 24 * 60 * 60, // 30 days
    api: 5 * 60, // 5 minutes
    images: 7 * 24 * 60 * 60, // 7 days
    fonts: 30 * 24 * 60 * 60 // 30 days
  }
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(CACHE_CONFIG.staticAssets);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different request types
  if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isImageRequest(url)) {
    event.respondWith(handleImageRequest(request));
  } else {
    event.respondWith(handleNavigationRequest(request));
  }
});

// Check if request is for API
function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') || url.pathname.startsWith('/socket.io/');
}

// Check if request is for static asset
function isStaticAsset(url) {
  return /\.(js|css|woff2?|ttf|eot|svg|ico|json)$/.test(url.pathname);
}

// Check if request is for image
function isImageRequest(url) {
  return /\.(png|jpe?g|gif|webp|avif)$/.test(url.pathname);
}

// Handle API requests with network-first strategy
async function handleAPIRequest(request) {
  const url = new URL(request.url);
  
  // Skip caching for sensitive endpoints
  const sensitiveEndpoints = ['/auth/', '/admin/', '/vote/', '/upload'];
  if (sensitiveEndpoints.some(endpoint => url.pathname.includes(endpoint))) {
    return fetch(request);
  }
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful GET requests
    if (networkResponse.ok && CACHE_CONFIG.apiEndpoints.some(endpoint => url.pathname.includes(endpoint))) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback to cache if network fails
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Check if cache is still valid
    const cacheDate = cachedResponse.headers.get('sw-cache-date');
    if (cacheDate) {
      const age = (Date.now() - new Date(cacheDate).getTime()) / 1000;
      if (age < CACHE_CONFIG.ttl.static) {
        return cachedResponse;
      }
    }
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      const responseToCache = networkResponse.clone();
      
      // Add cache date header
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-date', new Date().toISOString());
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers
      });
      
      cache.put(request, modifiedResponse);
    }
    
    return networkResponse;
  } catch (error) {
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Handle image requests with stale-while-revalidate strategy
async function handleImageRequest(request) {
  const cachedResponse = await caches.match(request);
  
  // Always try to fetch fresh version
  const networkPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Wait for network response
  try {
    return await networkPromise;
  } catch (error) {
    return new Response('Image not available offline', { status: 503 });
  }
}

// Handle navigation requests with network-first strategy
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    return caches.match('/offline.html') || new Response('Offline', { status: 503 });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Get all pending requests from IndexedDB
  const pendingRequests = await getPendingRequests();
  
  for (const request of pendingRequests) {
    try {
      await fetch(request.url, request.options);
      await removePendingRequest(request.id);
    } catch (error) {
      console.error('Background sync failed for request:', request.id, error);
    }
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
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
    self.registration.showNotification('Equity Leaders Chapter', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// IndexedDB helpers for offline storage
async function getPendingRequests() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('elp-offline-db', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pending-requests'], 'readonly');
      const store = transaction.objectStore('pending-requests');
      const getRequest = store.getAll();
      
      getRequest.onsuccess = () => resolve(getRequest.result);
      getRequest.onerror = () => reject(getRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('pending-requests')) {
        db.createObjectStore('pending-requests', { keyPath: 'id' });
      }
    };
  });
}

async function removePendingRequest(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('elp-offline-db', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pending-requests'], 'readwrite');
      const store = transaction.objectStore('pending-requests');
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

// Cache cleanup on message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_CLEANUP') {
    event.waitUntil(cleanupCache());
  }
});

async function cleanupCache() {
  const cacheNames = await caches.keys();
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];
  
  return Promise.all(
    cacheNames
      .filter(cacheName => !currentCaches.includes(cacheName))
      .map(cacheName => caches.delete(cacheName))
  );
}