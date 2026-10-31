/*
 * Rollback for movement-clips-sw.js. Deploy this file at the same URL
 * (/movement-clips-sw.js) and remove the registration from site.js.
 * Browsers that already installed the worker pick this up on their next
 * visit; it unregisters itself and stops intercepting anything.
 */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.registration.unregister());
});
