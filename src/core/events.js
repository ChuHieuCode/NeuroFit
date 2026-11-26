/**
 * NeuroFit Core Event Bus (Phase 1)
 * Pub/sub message bus using Map of Sets, safe listener execution.
 */

class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, fn) {
    if (typeof fn !== 'function') return;
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(fn);
  }

  off(event, fn) {
    if (!this.listeners.has(event)) return;
    const set = this.listeners.get(event);
    set.delete(fn);
    if (set.size === 0) {
      this.listeners.delete(event);
    }
  }

  emit(event, detail) {
    if (!this.listeners.has(event)) return;
    const set = this.listeners.get(event);
    for (const fn of set) {
      try {
        fn(detail);
      } catch (err) {
        console.error(`[EventBus] Error in listener for event "${event}":`, err);
      }
    }
  }
}

export const bus = new EventBus();
