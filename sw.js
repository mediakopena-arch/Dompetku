const CACHE = "dompetku-v7";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./sync.js", "./firebase-config.js", "./icon-192.png", "./icon-512.png", "./maskable-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Ambil dari jaringan dulu supaya selalu versi terbaru; cache hanya cadangan saat offline.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  const ok = u.origin === location.origin || ["fonts.googleapis.com", "fonts.gstatic.com", "www.gstatic.com"].includes(u.hostname);
  if (!ok) return; // jangan cache lalu lintas Firebase
  e.respondWith(
    fetch(e.request).then((res) => {
      if (res && (res.ok || res.type === "opaque")) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request).then((hit) => hit || caches.match("./index.html")))
  );
});
