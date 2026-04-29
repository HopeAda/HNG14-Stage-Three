const CACHE_NAME = "habit-tracker-v1";

const APP_SHELL = ["/", "/manifest.json"];

// Install: cache app shell
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(APP_SHELL);
		}),
	);
});

// Activate: cleanup old caches
self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(
				keys.map((key) => {
					if (key !== CACHE_NAME) {
						return caches.delete(key);
					}
				}),
			),
		),
	);
});

// Fetch: serve cache first, fallback to network
self.addEventListener("fetch", (event) => {
	event.respondWith(
		caches.match(event.request).then((cached) => {
			if (cached) return cached;

			return fetch(event.request)
				.then((response) => {
					// Optionally cache new requests
					return response;
				})
				.catch(() => {
					// prevents crash when offline
					return new Response("Offline", {
						status: 200,
						headers: { "Content-Type": "text/plain" },
					});
				});
		}),
	);
});
