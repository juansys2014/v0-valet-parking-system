/* Service worker mínimo para que Chrome instale la app como PWA (pantalla completa, sin barra del navegador) */
self.addEventListener("install", (e) => {
  e.waitUntil(self.skipWaiting());
});
self.addEventListener("activate", (e) => {
  e.waitUntil(self.clients.claim());
});
