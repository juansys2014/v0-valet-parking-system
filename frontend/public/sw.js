/* Service worker para que Chrome instale como PWA (pantalla completa). Fetch handler requerido para installability. */
self.addEventListener("install", (e) => {
  e.waitUntil(self.skipWaiting());
});
self.addEventListener("activate", (e) => {
  e.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", (e) => {
  e.respondWith(fetch(e.request));
});
