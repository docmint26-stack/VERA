"use client";

import { useEffect } from "react";

/**
 * Service Worker registration component for PWA functionality.
 * Handles service worker registration, updates, and offline caching.
 */
export function ServiceWorkerProvider() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        // Only register in production
        if (process.env.NODE_ENV === "production") {
          const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
            type: "module",
          });

          // Handle update available
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed") {
                  // New version available - notify user
                  console.log("New VERA update available. Refresh to get the latest version.");
                }
              });
            }
          });

          // Handle controller change (new SW activated)
          navigator.serviceWorker.addEventListener("controllerchange", () => {
            window.location.reload();
          });

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Check hourly

          console.log("VERA Service Worker registered successfully");
        } else {
          // In development, unregister any existing service worker
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const reg of registrations) {
            await reg.unregister();
          }
        }
      } catch (error) {
        console.error("Service Worker registration failed:", error);
      }
    };

    registerServiceWorker();

    // Clean up
    return () => {
      // Nothing to clean up
    };
  }, []);

  return null;
}
