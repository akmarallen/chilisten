// @ts-nocheck
const CACHE_NAME = `cache-${__BUILD_TIMESTAMP__}`;

// Add any domains here that should always fetch fresh data from the network
const IGNORED_DOMAINS = ["supabase.co"];

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        }),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  const isIgnored = IGNORED_DOMAINS.some((domain) =>
    url.hostname.includes(domain),
  );

  if (isIgnored) {
    return event.respondWith(fetch(event.request));
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic" ||
            event.request.method !== "GET"
          ) {
            return response;
          }

          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return response;
        })
        .catch((error) => {
          console.log(error);
        });
    }),
  );
});
