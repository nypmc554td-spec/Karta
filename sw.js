/* Karta drogowa — service worker.
   Сеть в приоритете: если есть интернет, всегда берётся свежая версия файлов.
   Нет интернета — отдаётся последняя сохранённая копия (офлайн-режим).
   Чтобы принудительно обновить у всех — поменяй номер VERSION. */
const VERSION = "v59";
const CACHE = "karta-" + VERSION;
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(FILES.map(f => c.add(new Request(f, {cache: "reload"})).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req, {cache: "no-store"})
      .then(res => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req, {ignoreSearch: true}).then(r => r || caches.match("./index.html")))
  );
});
