const CACHE_NAME = 'boids-hunter-v1';
const ASSETS = [
    './boids_hunter.html',
    './boids_hunter_logic.js',
    './boids_hunter_manifest.json'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});