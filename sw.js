/* 飞行练习器 - 统一离线缓存 (PWA 根 Service Worker) */
const CACHE = 'flight-trainer-v1';

const CORE = [
  './',
  './index.html',
  './style.css?v=1',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',

  './b737/index.html',
  './b737/styles.css?v=13',
  './b737/glossary.js?v=13',
  './b737/tutorial.js?v=13',
  './b737/pages.js?v=13',
  './b737/app.js?v=13',
  './b737/panel.png',
  './b737/icon.png',
  './b737/manifest.json',

  './atr/index.html',
  './atr/styles.css?v=9',
  './atr/glossary.js?v=9',
  './atr/tutorial.js?v=9',
  './atr/pages.js?v=9',
  './atr/app.js?v=9',
  './atr/panel.png',
  './atr/icon.png',
  './atr/manifest.json'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(CORE.map(function (u) {
        return c.add(u).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return caches.match(req.url.split('?')[0]).then(function (hit2) {
        if (hit2) return hit2;
        return fetch(req).then(function (res) {
          if (res && res.status === 200) {
            var copy = res.clone();
            caches.open(CACHE).then(function (c) { c.put(req, copy); });
          }
          return res;
        }).catch(function () {
          if (req.mode === 'navigate') return caches.match('./index.html');
        });
      });
    })
  );
});
