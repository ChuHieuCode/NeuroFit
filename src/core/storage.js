/**
 * @file storage.js
 * @description NeuroFit Hybrid Persistence & Storage Engine (Phase 1 & Wave 2 Upgrades)
 */

import { bus } from './events.js';
import { difficultyEngine } from './difficulty.js';
import { ACHIEVEMENTS_CATALOG } from '../data/avatars-themes.js';

const PROFILE_KEY = 'neurofit_profile_v1';
const PREFS_KEY = 'neurofit_prefs_v1';

const DEFAULT_PROFILE = {
  id: 'explorer_' + Math.random().toString(36).substring(2, 9),
  username: 'Explorer',
  avatarId: 'neural-spark',
  createdAt: new Date().toISOString()
};

const DEFAULT_PREFS = {
  theme: 'light',
  lang: 'en',
  sound: true,
  music: false,
  haptics: true,
  dailyGoalMin: 15,
  preferredDifficulty: 'beginner',
  onboarded: false,
  favorites: [],
  unlockedThemes: ['light', 'dark']
};

// Local date helper YYYY-MM-DD
function getLocalDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

class StorageEngine {
  constructor() {
    this.db = null;
    this.memoryFallback = {
      sessions: new Map(),
      dailyTraining: new Map(),
      achievements: new Map(),
      difficultyHistory: new Map()
    };
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;

    if (typeof localStorage !== 'undefined') {
      if (!localStorage.getItem(PROFILE_KEY)) {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(DEFAULT_PROFILE));
      }
      if (!localStorage.getItem(PREFS_KEY)) {
        localStorage.setItem(PREFS_KEY, JSON.stringify(DEFAULT_PREFS));
      }
    }

    try {
      await this._initIndexedDB();
    } catch (err) {
      console.warn('[Storage] IndexedDB unavailable or blocked, using in-memory fallback:', err);
    }

    this.isInitialized = true;
  }

  _initIndexedDB() {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        return reject(new Error('IndexedDB not supported'));
      }

      const request = indexedDB.open('NeuroFitDB', 1);

      request.onerror = () => reject(request.error);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('sessions')) {
          const store = db.createObjectStore('sessions', { keyPath: 'id' });
          store.createIndex('gameId', 'gameId', { unique: false });
          store.createIndex('categoryId', 'categoryId', { unique: false });
          store.createIndex('completedAt', 'completedAt', { unique: false });
          store.createIndex('dateKey', 'dateKey', { unique: false });
        }
        if (!db.objectStoreNames.contains('dailyTraining')) {
          db.createObjectStore('dailyTraining', { keyPath: 'date' });
        }
        if (!db.objectStoreNames.contains('achievements')) {
          db.createObjectStore('achievements', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('difficultyHistory')) {
          const store = db.createObjectStore('difficultyHistory', { keyPath: 'id' });
          store.createIndex('gameId', 'gameId', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };
    });
  }

  getProfile() {
    if (typeof localStorage === 'undefined') return { ...DEFAULT_PROFILE };
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      return raw ? JSON.parse(raw) : { ...DEFAULT_PROFILE };
    } catch (e) {
      return { ...DEFAULT_PROFILE };
    }
  }

  saveProfile(patch) {
    const current = this.getProfile();
    const updated = { ...current, ...patch };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    }
    bus.emit('profile:changed', updated);
    return updated;
  }

  getPrefs() {
    if (typeof localStorage === 'undefined') return { ...DEFAULT_PREFS };
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : { ...DEFAULT_PREFS };
    } catch (e) {
      return { ...DEFAULT_PREFS };
    }
  }

  savePrefs(patch) {
    const current = this.getPrefs();
    const updated = { ...current, ...patch };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
    }
    bus.emit('prefs:changed', updated);
    return updated;
  }

  toggleFavorite(gameId) {
    const prefs = this.getPrefs();
    const favs = new Set(prefs.favorites || []);
    let isFav = false;
    if (favs.has(gameId)) {
      favs.delete(gameId);
      isFav = false;
    } else {
      favs.add(gameId);
      isFav = true;
    }
    this.savePrefs({ favorites: Array.from(favs) });
    return isFav;
  }

  async _idbOp(storeName, mode, callback) {
    if (!this.db) {
      const map = this.memoryFallback[storeName];
      if (!map) throw new Error(`Unknown store: ${storeName}`);
      return callback({
        get: (key) => Promise.resolve(map.get(key)),
        getAll: () => Promise.resolve(Array.from(map.values())),
        put: (val) => {
          const key = storeName === 'dailyTraining' ? val.date : val.id;
          map.set(key, val);
          return Promise.resolve(val);
        },
        delete: (key) => { map.delete(key); return Promise.resolve(); },
        clear: () => { map.clear(); return Promise.resolve(); }
      });
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      
      tx.onerror = () => reject(tx.error);

      const helpers = {
        get: (key) => new Promise((res, rej) => {
          const req = store.get(key);
          req.onsuccess = () => res(req.result);
          req.onerror = () => rej(req.error);
        }),
        getAll: () => new Promise((res, rej) => {
          const req = store.getAll();
          req.onsuccess = () => res(req.result);
          req.onerror = () => rej(req.error);
        }),
        put: (val) => new Promise((res, rej) => {
          const req = store.put(val);
          req.onsuccess = () => res(req.result);
          req.onerror = () => rej(req.error);
        }),
        delete: (key) => new Promise((res, rej) => {
          const req = store.delete(key);
          req.onsuccess = () => res();
          req.onerror = () => rej(req.error);
        }),
        clear: () => new Promise((res, rej) => {
          const req = store.clear();
          req.onsuccess = () => res();
          req.onerror = () => rej(req.error);
        })
      };

      callback(helpers).then(resolve).catch(reject);
    });
  }

  async saveSession(sessionInput) {
    const now = new Date();
    const dateKey = sessionInput.dateKey || getLocalDateKey(now);
    const sessionId = sessionInput.id || 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();

    const difficulty = sessionInput.difficulty || difficultyEngine.getTier(sessionInput.gameId, 'beginner');
    const tierConfig = difficultyEngine.getTierConfig(difficulty);
    const baseXp = sessionInput.xpEarned || Math.round((sessionInput.score || 100) * (sessionInput.accuracy || 100) / 100 * tierConfig.xpMultiplier);

    const session = {
      id: sessionId,
      gameId: sessionInput.gameId || 'unknown',
      categoryId: sessionInput.categoryId || 'memory',
      startedAt: sessionInput.startedAt || (now.getTime() - (sessionInput.durationSec || 60) * 1000),
      completedAt: sessionInput.completedAt || now.getTime(),
      dateKey,
      durationSec: sessionInput.durationSec || 60,
      score: sessionInput.score || 0,
      accuracy: sessionInput.accuracy !== undefined ? sessionInput.accuracy : 100,
      reactionTimeMs: sessionInput.reactionTimeMs || 450,
      difficulty,
      mistakes: sessionInput.mistakes || 0,
      xpEarned: Math.max(10, baseXp)
    };

    await this._idbOp('sessions', 'readwrite', (h) => h.put(session));

    const allSessions = await this.getSessions(2000);
    const gameSessions = allSessions.filter(s => s.gameId === session.gameId);
    const diffEvaluation = difficultyEngine.evaluateSession(session.gameId, gameSessions);

    if (diffEvaluation.changed) {
      const diffRecord = {
        id: 'diff_' + session.gameId + '_' + Date.now(),
        gameId: session.gameId,
        previousTier: diffEvaluation.previousTier,
        newTier: diffEvaluation.newTier,
        reason: diffEvaluation.reason,
        timestamp: Date.now()
      };
      await this._idbOp('difficultyHistory', 'readwrite', (h) => h.put(diffRecord));
    }

    // Daily Training progress update & Bonus XP
    const daily = await this._idbOp('dailyTraining', 'readwrite', async (h) => {
      let d = await h.get(dateKey);
      if (d) {
        if (d.gameIds.includes(session.gameId) && !d.completedGameIds.includes(session.gameId)) {
          d.completedGameIds.push(session.gameId);
          d.totalXp = (d.totalXp || 0) + session.xpEarned;
          if (d.completedGameIds.length >= d.gameIds.length && !d.completed) {
            d.completed = true;
          }
        }
        if (d.completed && !d.bonusAwarded) {
          d.bonusAwarded = true;
          d.totalXp = (d.totalXp || 0) + 150;
          session.xpEarned += 150; // Add bonus XP to session as well
          // update session in store with bonus XP
          await h.put(session); // wait, put session in sessions store
        }
        await h.put(d);
      }
      return d;
    });

    if (daily && daily.completed && daily.bonusAwarded) {
      // Re-save session with updated xpEarned
      await this._idbOp('sessions', 'readwrite', (h) => h.put(session));
    }

    const newlyUnlockedAchievements = await this._checkAchievements(allSessions);

    const stats = await this.getStats();
    const prefs = this.getPrefs();
    const unlockedThemes = new Set(prefs.unlockedThemes || ['light', 'dark']);
    if (stats.level >= 3) unlockedThemes.add('forest');
    if (stats.level >= 5) unlockedThemes.add('coral');
    if (unlockedThemes.size !== (prefs.unlockedThemes || []).length) {
      this.savePrefs({ unlockedThemes: Array.from(unlockedThemes) });
    }

    bus.emit('session:saved', session);

    return {
      session,
      difficultyChange: diffEvaluation.changed ? diffEvaluation : null,
      newlyUnlockedAchievements
    };
  }

  async getSessions(limit = 2000) {
    const list = await this._idbOp('sessions', 'readonly', (h) => h.getAll());
    list.sort((a, b) => b.completedAt - a.completedAt);
    return limit ? list.slice(0, limit) : list;
  }

  async getDifficultyHistory() {
    const list = await this._idbOp('difficultyHistory', 'readonly', (h) => h.getAll());
    list.sort((a, b) => b.timestamp - a.timestamp);
    return list;
  }

  async getUnlockedAchievements() {
    const list = await this._idbOp('achievements', 'readonly', (h) => h.getAll());
    return list;
  }

  async _checkAchievements(sessions) {
    const unlocked = await this.getUnlockedAchievements();
    const unlockedIds = new Set(unlocked.map(a => a.id));
    const newlyUnlocked = [];

    const stats = await this.getStats();
    const totalSessions = sessions.length;
    const maxAccuracy = sessions.length > 0 ? Math.max(...sessions.map(s => s.accuracy || 0)) : 0;
    const highAccuracyCount = sessions.filter(s => (s.accuracy || 0) >= 90).length;
    const memoryCount = sessions.filter(s => s.categoryId === 'memory').length;
    const speedCount = sessions.filter(s => s.categoryId === 'speed').length;
    const playedCategories = new Set(sessions.map(s => s.categoryId)).size;
    const dailyCompletedCount = stats.dailyTrainingCompletedCount || 0;

    const defs = [
      { id: 'first-game', check: () => totalSessions >= 1 },
      { id: 'perfect-score', check: () => maxAccuracy >= 100 },
      { id: 'streak-3', check: () => stats.currentStreak >= 3 },
      { id: 'streak-5', check: () => stats.currentStreak >= 5 },
      { id: 'streak-7', check: () => stats.currentStreak >= 7 },
      { id: 'streak-30', check: () => stats.currentStreak >= 30 },
      { id: 'memory-master', check: () => memoryCount >= 10 },
      { id: 'speed-demon', check: () => speedCount >= 10 },
      { id: 'accuracy-expert', check: () => highAccuracyCount >= 25 },
      { id: 'daily-champion', check: () => dailyCompletedCount >= 7 },
      { id: 'all-categories', check: () => playedCategories >= 8 },
      { id: 'games-100', check: () => totalSessions >= 100 }
    ];

    for (const def of defs) {
      if (!unlockedIds.has(def.id)) {
        try {
          if (def.check()) {
            const record = { id: def.id, unlockedAt: Date.now() };
            await this._idbOp('achievements', 'readwrite', (h) => h.put(record));
            newlyUnlocked.push(record);
            bus.emit('achievement:unlocked', def.id);
          }
        } catch (e) {}
      }
    }

    return newlyUnlocked;
  }

  async getStats() {
    const sessions = await this.getSessions(5000);
    const totalSessions = sessions.length;
    const totalPlayTimeSec = sessions.reduce((acc, s) => acc + (s.durationSec || 0), 0);
    
    let baseTotalXp = sessions.reduce((acc, s) => acc + (s.xpEarned || 50), 0);

    // Add achievement bonus XP
    const unlockedAchievements = await this.getUnlockedAchievements();
    const unlockedMap = new Map(ACHIEVEMENTS_CATALOG.map(a => [a.id, a.xpBonus || 100]));
    let achievementBonusXp = 0;
    for (const ua of unlockedAchievements) {
      achievementBonusXp += unlockedMap.get(ua.id) || 100;
    }

    // Daily training completed count
    const allDailyRecords = await this._idbOp('dailyTraining', 'readonly', (h) => h.getAll());
    const dailyTrainingCompletedCount = allDailyRecords.filter(d => d.completed).length;

    const totalXp = baseTotalXp + achievementBonusXp;

    const level = Math.floor(totalXp / 250) + 1;
    const xpIntoLevel = totalXp % 250;
    const xpForNextLevel = 250;

    const dateKeys = Array.from(new Set(sessions.map(s => s.dateKey))).sort().reverse();
    let currentStreak = 0;
    let longestStreak = 0;

    if (dateKeys.length > 0) {
      const todayStr = getLocalDateKey();
      const yesterdayStr = getLocalDateKey(new Date(Date.now() - 86400000));
      
      let checkDate = new Date();
      
      if (!dateKeys.includes(todayStr) && dateKeys.includes(yesterdayStr)) {
        // streak maintained via yesterday
      }

      let tempStreak = 0;
      for (let i = 0; i < 365; i++) {
        const dStr = getLocalDateKey(checkDate);
        if (dateKeys.includes(dStr)) {
          tempStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (i === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          const yStr = getLocalDateKey(checkDate);
          if (dateKeys.includes(yStr)) {
            tempStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        } else {
          break;
        }
      }
      currentStreak = Math.max(currentStreak, tempStreak);
      longestStreak = Math.max(longestStreak, currentStreak, dateKeys.length > 0 ? 1 : 0);
    }

    const avgAccuracy = totalSessions > 0 ? Math.round(sessions.reduce((acc, s) => acc + (s.accuracy || 0), 0) / totalSessions) : 0;
    const avgReactionMs = totalSessions > 0 ? Math.round(sessions.reduce((acc, s) => acc + (s.reactionTimeMs || 0), 0) / totalSessions) : 0;

    const personalBests = {};
    const lastPlayedMap = {};
    for (const s of sessions) {
      if (!personalBests[s.gameId] || s.score > personalBests[s.gameId].score) {
        personalBests[s.gameId] = { score: s.score, accuracy: s.accuracy, date: s.dateKey };
      }
      if (!lastPlayedMap[s.gameId] || s.completedAt > new Date(lastPlayedMap[s.gameId]).getTime()) {
        lastPlayedMap[s.gameId] = new Date(s.completedAt).toISOString();
      }
    }

    // Activity by date for charts & streak calendar
    const activityByDate = {};
    const dateGroups = {};
    for (const s of sessions) {
      const dk = s.dateKey || getLocalDateKey(new Date(s.completedAt));
      if (!dateGroups[dk]) dateGroups[dk] = [];
      dateGroups[dk].push(s);
    }
    for (const [dk, group] of Object.entries(dateGroups)) {
      const count = group.length;
      const totalSec = group.reduce((acc, s) => acc + (s.durationSec || 60), 0);
      const minutes = Math.round((totalSec / 60) * 10) / 10;
      const avgScore = Math.round(group.reduce((acc, s) => acc + (s.score || 0), 0) / count);
      activityByDate[dk] = { count, minutes, totalSec, avgScore };
    }

    // Category scores (0..100)
    const categoryScores = {
      memory: 0, attention: 0, speed: 0, problem: 0,
      math: 0, flexibility: 0, language: 0, logic: 0
    };

    const catCounts = {};
    for (const s of sessions) {
      const cat = s.categoryId || 'memory';
      if (!catCounts[cat]) catCounts[cat] = { totalAcc: 0, count: 0 };
      catCounts[cat].totalAcc += s.accuracy || 70;
      catCounts[cat].count++;
    }

    for (const [cat, data] of Object.entries(catCounts)) {
      if (data.count > 0) {
        categoryScores[cat] = Math.round(data.totalAcc / data.count);
      }
    }

    const catValues = Object.values(categoryScores).filter(v => v > 0);
    const avgCat = catValues.length > 0 ? catValues.reduce((a, b) => a + b, 0) / catValues.length : 0;
    const nfiScore = totalSessions === 0 ? 0 : Math.round(100 + (avgCat / 100) * 900);

    return {
      totalSessions,
      totalPlayTimeSec,
      currentStreak,
      longestStreak,
      totalXp,
      level,
      xpIntoLevel,
      xpForNextLevel,
      nfiScore,
      avgAccuracy,
      avgReactionMs,
      personalBests,
      lastPlayedMap,
      activityByDate,
      categoryScores,
      dailyTrainingCompletedCount
    };
  }

  async getOrCreateDailyTraining(catalogGames = []) {
    const todayStr = getLocalDateKey();
    
    const existing = await this._idbOp('dailyTraining', 'readonly', (h) => h.get(todayStr));
    if (existing) return existing;

    // Get yesterday's daily training to avoid repeating exact game combinations
    const yesterdayDate = new Date(Date.now() - 86400000);
    const yesterdayStr = getLocalDateKey(yesterdayDate);
    const yesterdayRecord = await this._idbOp('dailyTraining', 'readonly', (h) => h.get(yesterdayStr));
    const yesterdayGameIds = new Set(yesterdayRecord ? yesterdayRecord.gameIds : []);

    // Get user category scores to prioritize weaker / unplayed categories
    const stats = await this.getStats();
    const catScores = stats.categoryScores || {};
    
    // Sort catalog games prioritizing categories with lower scores and not played yesterday
    const sortedCatalog = [...catalogGames].sort((a, b) => {
      const scoreA = catScores[a.categoryId] || 0;
      const scoreB = catScores[b.categoryId] || 0;
      if (scoreA !== scoreB) return scoreA - scoreB; // lower score first
      const aYesterday = yesterdayGameIds.has(a.id) ? 1 : 0;
      const bYesterday = yesterdayGameIds.has(b.id) ? 1 : 0;
      return aYesterday - bYesterday; // avoid yesterday's games
    });

    const selected = [];
    const usedCategories = new Set();

    // Select 5 diverse games across 5 distinct categories
    for (const g of sortedCatalog) {
      if (selected.length >= 5) break;
      if (!usedCategories.has(g.categoryId) && !yesterdayGameIds.has(g.id)) {
        selected.push(g.id);
        usedCategories.add(g.categoryId);
      }
    }

    // Fill remaining slots if needed
    for (const g of sortedCatalog) {
      if (selected.length >= 5) break;
      if (!selected.includes(g.id)) {
        selected.push(g.id);
        usedCategories.add(g.categoryId);
      }
    }

    const dailyRecord = {
      date: todayStr,
      gameIds: selected,
      completedGameIds: [],
      completed: false,
      bonusAwarded: false,
      totalXp: 0
    };

    await this._idbOp('dailyTraining', 'readwrite', (h) => h.put(dailyRecord));
    return dailyRecord;
  }

  async exportJSON() {
    const profile = this.getProfile();
    const prefs = this.getPrefs();
    const sessions = await this.getSessions(10000);
    const achievements = await this.getUnlockedAchievements();
    const difficultyHistory = await this.getDifficultyHistory();

    const backup = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      profile,
      prefs,
      sessions,
      achievements,
      difficultyHistory
    };

    return JSON.stringify(backup, null, 2);
  }

  async importJSON(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || !data.profile || !data.prefs) {
        throw new Error('Invalid backup format');
      }

      this.saveProfile(data.profile);
      this.savePrefs(data.prefs);

      await this._idbOp('sessions', 'readwrite', (h) => h.clear());
      if (Array.isArray(data.sessions)) {
        for (const s of data.sessions) {
          await this._idbOp('sessions', 'readwrite', (h) => h.put(s));
        }
      }

      await this._idbOp('achievements', 'readwrite', (h) => h.clear());
      if (Array.isArray(data.achievements)) {
        for (const a of data.achievements) {
          await this._idbOp('achievements', 'readwrite', (h) => h.put(a));
        }
      }

      await this._idbOp('difficultyHistory', 'readwrite', (h) => h.clear());
      if (Array.isArray(data.difficultyHistory)) {
        for (const d of data.difficultyHistory) {
          await this._idbOp('difficultyHistory', 'readwrite', (h) => h.put(d));
        }
      }

      bus.emit('prefs:changed', data.prefs);
      bus.emit('profile:changed', data.profile);
      return true;
    } catch (err) {
      console.error('[Storage] Import failed:', err);
      return false;
    }
  }

  async resetAll() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(DEFAULT_PROFILE));
      localStorage.setItem(PREFS_KEY, JSON.stringify(DEFAULT_PREFS));
    }
    difficultyEngine.resetAll();

    await this._idbOp('sessions', 'readwrite', (h) => h.clear());
    await this._idbOp('dailyTraining', 'readwrite', (h) => h.clear());
    await this._idbOp('achievements', 'readwrite', (h) => h.clear());
    await this._idbOp('difficultyHistory', 'readwrite', (h) => h.clear());

    this.memoryFallback.sessions.clear();
    this.memoryFallback.dailyTraining.clear();
    this.memoryFallback.achievements.clear();
    this.memoryFallback.difficultyHistory.clear();

    bus.emit('profile:changed', DEFAULT_PROFILE);
    bus.emit('prefs:changed', DEFAULT_PREFS);
  }
}

export const storage = new StorageEngine();
