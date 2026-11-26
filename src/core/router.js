/**
 * NeuroFit Hash-Based SPA Router (Phase 1)
 */

import { bus } from './events.js';

class Router {
  constructor() {
    this.handlers = [];
    this.currentRoute = null;
    this._boundHandleHash = this._handleHash.bind(this);
  }

  onRoute(handler) {
    if (typeof handler === 'function') {
      this.handlers.push(handler);
    }
  }

  navigate(hash) {
    if (typeof window === 'undefined') return;
    if (!hash.startsWith('#')) {
      hash = '#' + (hash.startsWith('/') ? hash : '/' + hash);
    }
    window.location.hash = hash;
  }

  start() {
    if (typeof window === 'undefined') return;
    window.addEventListener('hashchange', this._boundHandleHash);
    // Initial route parse
    this._handleHash();
  }

  getCurrent() {
    return this.currentRoute;
  }

  _handleHash() {
    const rawHash = window.location.hash || '#/dashboard';
    const parsed = this._parseHash(rawHash);
    this.currentRoute = parsed;

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    bus.emit('route:changed', parsed);

    for (const handler of this.handlers) {
      try {
        handler(parsed);
      } catch (err) {
        console.error('[Router] Error in route handler:', err);
      }
    }
  }

  _parseHash(rawHash) {
    // Clean hash e.g. "#/play/sequence-recall?daily=1"
    let clean = rawHash.replace(/^#\/?/, '');
    if (!clean || clean === 'dashboard') {
      return { route: 'dashboard', params: {}, query: {} };
    }

    const [pathPart, queryPart] = clean.split('?');
    const segments = pathPart.split('/').filter(Boolean);

    const query = {};
    if (queryPart) {
      const params = new URLSearchParams(queryPart);
      for (const [k, v] of params.entries()) {
        query[k] = v;
      }
    }

    const topRoute = segments[0] || 'dashboard';

    // Route matching
    if (topRoute === 'play' && segments[1]) {
      return {
        route: 'play',
        params: { gameId: segments[1] },
        query,
        rawHash
      };
    }

    const validRoutes = ['dashboard', 'daily', 'library', 'categories', 'analytics', 'achievements', 'history', 'settings'];
    if (validRoutes.includes(topRoute)) {
      return {
        route: topRoute,
        params: {},
        query,
        rawHash
      };
    }

    // Fallback
    return { route: 'dashboard', params: {}, query: {}, rawHash };
  }
}

export const router = new Router();
