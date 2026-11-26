import { storage } from './core/storage.js';
import { audio } from './core/audio.js';
import { i18n } from './core/i18n.js';
import { router } from './core/router.js';
import { bus } from './core/events.js';
import { shell } from './ui/shell.js';
import { maybeShowOnboarding } from './ui/onboarding.js';

// Views
import { renderDashboardView } from './ui/views/dashboard-view.js';
import { renderDailyView } from './ui/views/daily-view.js';
import { renderLibraryView } from './ui/views/library-view.js';
import { renderCategoriesView } from './ui/views/categories-view.js';
import { renderAnalyticsView } from './ui/views/analytics-view.js';
import { renderAchievementsView } from './ui/views/achievements-view.js';
import { renderHistoryView } from './ui/views/history-view.js';
import { renderSettingsView } from './ui/views/settings-view.js';
import { renderArenaView } from './ui/views/arena-view.js';

function applyTheme(themePref) {
  let activeTheme = themePref;
  if (themePref === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    activeTheme = isDark ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', activeTheme);
}

async function bootstrap() {
  // 1. Initialize storage (IndexedDB + LocalStorage)
  await storage.init();

  // 2. Get preferences & profile
  const prefs = storage.getPrefs();

  // 3. Apply theme and language
  applyTheme(prefs.theme);
  await i18n.init(prefs.lang);
  audio.setConfig(prefs);

  // 4. Mount persistent responsive shell
  const appRoot = document.getElementById('app');
  await shell.mount(appRoot);

  let currentRouteName = 'dashboard';
  let currentParams = {};
  let currentQuery = {};

  async function renderCurrentRoute() {
    // Always fetch live viewContainer dynamically after remounts
    const viewContainer = shell.getViewContainer();
    if (!viewContainer) return;

    if (currentRouteName === 'dashboard') {
      await renderDashboardView(viewContainer);
    } else if (currentRouteName === 'daily') {
      await renderDailyView(viewContainer);
    } else if (currentRouteName === 'library') {
      await renderLibraryView(viewContainer, currentQuery);
    } else if (currentRouteName === 'categories') {
      await renderCategoriesView(viewContainer);
    } else if (currentRouteName === 'analytics') {
      await renderAnalyticsView(viewContainer);
    } else if (currentRouteName === 'achievements') {
      await renderAchievementsView(viewContainer);
    } else if (currentRouteName === 'history') {
      await renderHistoryView(viewContainer);
    } else if (currentRouteName === 'settings') {
      await renderSettingsView(viewContainer);
    } else if (currentRouteName === 'play') {
      await renderArenaView(viewContainer, currentParams, currentQuery);
    } else {
      await renderDashboardView(viewContainer);
    }
  }

  // 5. Configure router routes
  router.onRoute(async ({ route, params, query }) => {
    currentRouteName = route;
    currentParams = params || {};
    currentQuery = query || {};

    // Cleanup arena overlay if navigating away from play
    if (route !== 'play') {
      document.getElementById('arena-overlay')?.remove();
    }

    shell.setActiveRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    await renderCurrentRoute();
  });

  router.start();

  // 6. Global Event Listeners for reactive theme, language & preferences
  bus.on('i18n:changed', async (lang) => {
    storage.savePrefs({ lang });
    await i18n.init(lang);
    await shell.remount();
    await renderCurrentRoute();
  });

  bus.on('prefs:changed', (newPrefs) => {
    if (newPrefs.theme) {
      applyTheme(newPrefs.theme);
    }
    audio.setConfig(storage.getPrefs());
    shell.refreshHeader();
  });

  // System theme media query listener
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const p = storage.getPrefs();
    if (p.theme === 'system') {
      applyTheme('system');
    }
  });

  // 7. Trigger Onboarding modal if not yet onboarded
  maybeShowOnboarding(() => {
    shell.refreshHeader();
  });

  // 8. Register Service Worker for offline-first PWA
  if ('serviceWorker' in navigator && (location.protocol === 'http:' || location.protocol === 'https:')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).catch(err => {
        console.warn('ServiceWorker registration failed:', err);
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', bootstrap);
