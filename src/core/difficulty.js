/**
 * NeuroFit Difficulty Engine & Tier Configurations (Phase 1)
 */

export const DIFFICULTY_TIERS = ['beginner', 'easy', 'intermediate', 'advanced', 'expert'];

const TIER_CONFIGS = {
  beginner: {
    tier: 'beginner',
    index: 0,
    speedMultiplier: 1.0,
    complexity: 1,
    xpMultiplier: 1.0,
    label: { en: 'Beginner', vi: 'Khởi đầu' }
  },
  easy: {
    tier: 'easy',
    index: 1,
    speedMultiplier: 1.15,
    complexity: 2,
    xpMultiplier: 1.15,
    label: { en: 'Easy', vi: 'Cơ bản' }
  },
  intermediate: {
    tier: 'intermediate',
    index: 2,
    speedMultiplier: 1.32,
    complexity: 3,
    xpMultiplier: 1.3,
    label: { en: 'Intermediate', vi: 'Trung cấp' }
  },
  advanced: {
    tier: 'advanced',
    index: 3,
    speedMultiplier: 1.52,
    complexity: 4,
    xpMultiplier: 1.5,
    label: { en: 'Advanced', vi: 'Nâng cao' }
  },
  expert: {
    tier: 'expert',
    index: 4,
    speedMultiplier: 1.75,
    complexity: 5,
    xpMultiplier: 1.75,
    label: { en: 'Expert', vi: 'Chuyên gia' }
  }
};

const STORAGE_KEY = 'neurofit_difficulty_v1';

class DifficultyEngine {
  constructor() {
    this._cache = null;
  }

  _loadStore() {
    if (this._cache) return this._cache;
    if (typeof localStorage === 'undefined') return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this._cache = raw ? JSON.parse(raw) : {};
    } catch (e) {
      this._cache = {};
    }
    return this._cache;
  }

  _saveStore(store) {
    this._cache = store;
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) {}
  }

  getTier(gameId, fallback = 'beginner') {
    const store = this._loadStore();
    return store[gameId] || fallback;
  }

  setTier(gameId, tier) {
    if (!DIFFICULTY_TIERS.includes(tier)) return;
    const store = this._loadStore();
    store[gameId] = tier;
    this._saveStore(store);
  }

  getTierConfig(tier) {
    return TIER_CONFIGS[tier] || TIER_CONFIGS.beginner;
  }

  getTierLabel(tier, lang = 'en') {
    const config = this.getTierConfig(tier);
    return config.label[lang] || config.label.en;
  }

  evaluateSession(gameId, recentGameSessions = []) {
    const currentTier = this.getTier(gameId, 'beginner');
    const currentIndex = DIFFICULTY_TIERS.indexOf(currentTier);

    if (!recentGameSessions || recentGameSessions.length < 2) {
      return { previousTier: currentTier, newTier: currentTier, changed: false, reason: 'insufficient_history' };
    }

    // Check last 2 sessions
    const lastTwo = recentGameSessions.slice(0, 2);
    const bothStrong = lastTwo.every(s => (s.accuracy >= 88) && (s.mistakes <= 2));
    const bothWeak = lastTwo.every(s => s.accuracy < 55);

    if (bothStrong && currentIndex < DIFFICULTY_TIERS.length - 1) {
      const newTier = DIFFICULTY_TIERS[currentIndex + 1];
      this.setTier(gameId, newTier);
      return {
        previousTier: currentTier,
        newTier,
        changed: true,
        reason: 'promoted_consistency'
      };
    }

    if (bothWeak && currentIndex > 0) {
      const newTier = DIFFICULTY_TIERS[currentIndex - 1];
      this.setTier(gameId, newTier);
      return {
        previousTier: currentTier,
        newTier,
        changed: true,
        reason: 'demoted_struggle'
      };
    }

    return {
      previousTier: currentTier,
      newTier: currentTier,
      changed: false,
      reason: 'stable'
    };
  }

  resetAll() {
    this._cache = {};
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
    }
  }
}

export const difficultyEngine = new DifficultyEngine();
