self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('vip-cache').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles.css',
        '/script.js',
        '/admin.html',
        '/admin.js',
        // tambahkan file lain yang ingin di-cache
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
