// Changez ce numéro à chaque mise à jour du site pour forcer le rafraîchissement
const CACHE_NAME = 'bfr-app-cache-v3';
const urlsToCache = [
  './',
  'index.html',
  'manifest.json',
  'icon-192x192.png',
  'icon-512x512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

// Réseau d'abord : on charge toujours la dernière version en ligne,
// et on n'utilise le cache que hors connexion.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
