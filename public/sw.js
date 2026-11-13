// VERA Service Worker for PWA
// This provides basic offline caching for the application shell

const CACHE_NAME = "vera-v1";
const ASSET_CACHE = "vera-assets-v1";

// Files to cache for offline use
const APP_SHELL = [
  "/",
  "/app",
  "/app/ai",
  "/app/documents",
  "/app/vault",
  "/app/passport",
  "/app/achievements",
  "/app/verification",
  "/app/rewards",
  "/app/opportunities",
  "/app/settings",
  "/app/help",
  "/signin",
  "/signup",
  "/forgot-password",
  "/verify-email",
  "/onboarding",
  "/features",
  "/how-it-works",
  "/about",
  "/faq",
  "/contact",
  "/privacy",
  "/terms",
];

// Asset files to cache
const ASSETS = [
  "/icon-192.png",
  "/icon-512.png",
  "/icon-512-maskable.png",
  "/apple-touch-icon.png",
  "/og-image.png",
  "/manifest.webmanifest",
];

// Install service worker and cache app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
      caches.open(ASSET_CACHE).then((cache) => cache.addAll(ASSETS)),
    ])
  );
  self.skipWaiting();
});

// Activate service worker and clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME && name !== ASSET_CACHE) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch handler - serve from cache when offline
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  
  // Don't intercept API calls or authenticated requests
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/data")) {
    return;
  }

  // Try network first, fall back to cache
  event.respondWith(
    fetch(event.request).catch(() => {
      if (url.pathname.startsWith("/app/") || url.pathname === "/" || url.pathname.startsWith("/sign") || url.pathname.startsWith("/verify")) {
        return caches.match(event.request).then((response) => {
          return response || caches.match("/");
        });
      }
      return caches.match(event.request);
    })
  );
});

// Push notification handler
self.addEventListener("push", (event) => {
  const data = event.data?.json();
  const title = data?.title || "VERA";
  const options = {
    body: data?.body || "You have a new notification",
    icon: "/icon-192.png",
    badge: "/icon-512-maskable.png",
    data: data?.url ? { url: data.url } : {},
  };
  
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/app";
  
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      if (clients.length > 0) {
        clients[0].navigate(url);
        clients[0].focus();
      } else {
        self.clients.openWindow(url);
      }
    })
  );
});

// Periodic sync handler (for when it's supported)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "sync-achievements") {
    event.waitUntil(syncAchievements());
  }
});

async function syncAchievements() {
  // In Phase 2, this would sync local achievements with the server
  console.log("Syncing achievements...");
}
