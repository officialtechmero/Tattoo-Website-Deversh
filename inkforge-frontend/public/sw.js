const IMAGE_CACHE = "inkforge-image-cache-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("inkforge-image-cache-") && key !== IMAGE_CACHE)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.method !== "GET") return;
  if (req.destination !== "image") return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(IMAGE_CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;

      try {
        const network = await fetch(req);
        if (network && (network.ok || network.type === "opaque")) {
          cache.put(req, network.clone()).catch(() => {});
        }
        return network;
      } catch (error) {
        if (cached) return cached;
        throw error;
      }
    })()
  );
});
