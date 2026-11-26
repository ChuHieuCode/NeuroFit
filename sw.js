const CACHE_NAME = 'neurofit-pwa-v5';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './assets/icons/icon.svg',
  './assets/icons/favicon.svg',
  './src/main.js',
  './src/styles/tokens.css',
  './src/styles/base.css',
  './src/styles/layout.css',
  './src/styles/components.css',
  './src/styles/games.css',
  './src/core/events.js',
  './src/core/i18n.js',
  './src/core/storage.js',
  './src/core/audio.js',
  './src/core/difficulty.js',
  './src/core/router.js',
  './src/core/gamification.js',
  './src/core/analytics-engine.js',
  './src/data/categories.js',
  './src/data/games-catalog.js',
  './src/data/avatars-themes.js',
  './src/games/base-game.js',
  './src/games/registry.js',
  './src/games/memory/sequence-recall.js',
  './src/games/memory/number-memory.js',
  './src/games/memory/spatial-memory.js',
  './src/games/memory/card-matching.js',
  './src/games/attention/target-tracking.js',
  './src/games/attention/selective-attention.js',
  './src/games/attention/visual-search.js',
  './src/games/attention/stroop-challenge.js',
  './src/games/speed/speed-match.js',
  './src/games/speed/reaction-time.js',
  './src/games/speed/rapid-calculation.js',
  './src/games/speed/symbol-comparison.js',
  './src/games/problem/pattern-recognition.js',
  './src/games/problem/matrix-reasoning.js',
  './src/games/problem/tower-of-hanoi.js',
  './src/games/problem/puzzle-solver.js',
  './src/games/math/mental-arithmetic.js',
  './src/games/math/number-series.js',
  './src/games/math/quick-estimate.js',
  './src/games/flexibility/task-switching.js',
  './src/games/flexibility/rule-change.js',
  './src/games/flexibility/dual-n-back.js',
  './src/games/language/word-association.js',
  './src/games/language/vocabulary-challenge.js',
  './src/games/logic/syllogism-verdict.js',
  './src/games/logic/deductive-grid.js',
  './src/games/logic/set-logic.js',
  './src/ui/icons.js',
  './src/ui/components/charts.js',
  './src/ui/components/game-card.js',
  './src/ui/components/numpad.js',
  './src/ui/components/toast-confetti.js',
  './src/ui/onboarding.js',
  './src/ui/shell.js',
  './src/ui/views/dashboard-view.js',
  './src/ui/views/daily-view.js',
  './src/ui/views/library-view.js',
  './src/ui/views/categories-view.js',
  './src/ui/views/analytics-view.js',
  './src/ui/views/achievements-view.js',
  './src/ui/views/history-view.js',
  './src/ui/views/settings-view.js',
  './src/ui/views/arena-view.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET or cross-origin requests
  if (event.request.method !== 'GET' || url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback if offline
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
      });

      return cachedResponse || fetchPromise;
    })
  );
});
