/* Service worker de ¡A Reciclar! — para que abra sin señal.
   HTML: red primero (así una versión nueva llega sola), cache de respaldo.
   Resto (íconos, manifest): cache primero. Subir VERSION al cambiar assets. */
const VERSION = 'reciclar-v1';
const ASSETS = ['./', 'index.html', 'manifest.json', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', ev => {
  ev.waitUntil(
    caches.open(VERSION)
      .then(c => Promise.all(ASSETS.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', ev => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // Google Fonts etc.: que lo resuelva el navegador

  if (req.mode === 'navigate' || url.pathname.endsWith('.html')) {
    ev.respondWith(
      fetch(req)
        .then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put(req, c)); return r; })
        .catch(() => caches.match(req).then(r => r || caches.match('index.html')))
    );
    return;
  }
  ev.respondWith(caches.match(req).then(r => r || fetch(req)));
});
