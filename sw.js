const CACHE_NAME = 'neppado-v2';
const ASSETS = ['./', './netsuha-do.html', './icon-192.png', './icon-512.png', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// ネットワーク優先：オンラインなら常に最新を取得してキャッシュを更新し、
// オフライン時だけキャッシュにフォールバックする（更新が反映されない問題を防ぐ）。
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).then(res => {
      const resClone = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(e.request, resClone));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
