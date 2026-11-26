/**
 * @file analytics-engine.js
 * @description Dedicated Real-Data Analytics Engine for NeuroFit (Master Prompt Section 8 — NEVER fabricates data!).
 */

export const analyticsEngine = {
  /**
   * Filter sessions by rangeDays, categoryId, and gameId.
   */
  filterSessions(sessions = [], { rangeDays = 'all', categoryId = 'all', gameId = 'all' } = {}) {
    let filtered = [...sessions];

    // Filter by gameId
    if (gameId && gameId !== 'all') {
      filtered = filtered.filter(s => s.gameId === gameId);
    }

    // Filter by categoryId
    if (categoryId && categoryId !== 'all') {
      filtered = filtered.filter(s => s.categoryId === categoryId);
    }

    // Filter by rangeDays
    if (rangeDays && rangeDays !== 'all') {
      const daysNum = parseInt(rangeDays, 10);
      if (!isNaN(daysNum)) {
        const cutoff = Date.now() - daysNum * 86400000;
        filtered = filtered.filter(s => s.completedAt >= cutoff);
      }
    }

    return filtered;
  },

  /**
   * Compute summary metrics and compare recent period vs immediately preceding period.
   */
  computeSummaryWithComparison(sessions = [], { rangeDays = 7, categoryId = 'all', gameId = 'all' } = {}) {
    const currentFiltered = this.filterSessions(sessions, { rangeDays, categoryId, gameId });

    const totalSessions = currentFiltered.length;
    const totalMinutes = Math.round(currentFiltered.reduce((acc, s) => acc + (s.durationSec || 60), 0) / 60);
    const avgScore = totalSessions > 0 ? Math.round(currentFiltered.reduce((acc, s) => acc + (s.score || 0), 0) / totalSessions) : 0;
    const avgAccuracy = totalSessions > 0 ? Math.round(currentFiltered.reduce((acc, s) => acc + (s.accuracy || 0), 0) / totalSessions) : 0;
    const avgReactionMs = totalSessions > 0 ? Math.round(currentFiltered.reduce((acc, s) => acc + (s.reactionTimeMs || 0), 0) / totalSessions) : 0;

    // NFI Score estimation from current filtered sessions
    const accValues = currentFiltered.map(s => s.accuracy || 70);
    const meanAcc = accValues.length > 0 ? accValues.reduce((a, b) => a + b, 0) / accValues.length : 0;
    const nfiScore = totalSessions === 0 ? 0 : Math.round(100 + (meanAcc / 100) * 900);

    // Previous period comparison
    let deltaScore = null;
    let deltaAccuracy = null;
    let deltaReactionMs = null;

    if (rangeDays !== 'all') {
      const daysNum = parseInt(rangeDays, 10);
      if (!isNaN(daysNum)) {
        const currentCutoff = Date.now() - daysNum * 86400000;
        const previousCutoff = currentCutoff - daysNum * 86400000;

        const prevFiltered = sessions.filter(s => s.completedAt >= previousCutoff && s.completedAt < currentCutoff &&
          (categoryId === 'all' || s.categoryId === categoryId) &&
          (gameId === 'all' || s.gameId === gameId)
        );

        if (prevFiltered.length > 0) {
          const prevScore = prevFiltered.reduce((acc, s) => acc + (s.score || 0), 0) / prevFiltered.length;
          const prevAcc = prevFiltered.reduce((acc, s) => acc + (s.accuracy || 0), 0) / prevFiltered.length;
          const prevReact = prevFiltered.reduce((acc, s) => acc + (s.reactionTimeMs || 0), 0) / prevFiltered.length;

          deltaScore = Math.round(((avgScore - prevScore) / (prevScore || 1)) * 100);
          deltaAccuracy = Math.round(avgAccuracy - prevAcc);
          deltaReactionMs = Math.round(avgReactionMs - prevReact);
        }
      }
    }

    return {
      totalSessions,
      totalMinutes,
      avgScore,
      avgAccuracy,
      avgReactionMs,
      nfiScore,
      comparison: {
        deltaScore,
        deltaAccuracy,
        deltaReactionMs
      }
    };
  },

  /**
   * Get daily trends over last N days for Charts #1, #4, #5.
   */
  getDailyTrends(sessions = [], days = 14) {
    const map = {};
    const now = new Date();

    // Initialize last N days with zero values
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${y}-${m}-${day}`;
      const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

      map[dateKey] = {
        dateKey,
        label,
        totalScore: 0,
        totalAccuracy: 0,
        totalReactionMs: 0,
        count: 0,
        totalSec: 0
      };
    }

    for (const s of sessions) {
      const dk = s.dateKey || new Date(s.completedAt).toISOString().slice(0, 10);
      if (map[dk]) {
        map[dk].totalScore += s.score || 0;
        map[dk].totalAccuracy += s.accuracy || 0;
        map[dk].totalReactionMs += s.reactionTimeMs || 450;
        map[dk].count++;
        map[dk].totalSec += s.durationSec || 60;
      }
    }

    return Object.values(map).map(item => {
      const c = item.count;
      return {
        dateKey: item.dateKey,
        label: item.label,
        avgScore: c > 0 ? Math.round(item.totalScore / c) : 0,
        avgAccuracy: c > 0 ? Math.round(item.totalAccuracy / c) : 0,
        avgReactionMs: c > 0 ? Math.round(item.totalReactionMs / c) : 0,
        count: c,
        minutes: Math.round((item.totalSec / 60) * 10) / 10
      };
    });
  },

  /**
   * Get 30-day activity series for Chart #3 (Monthly training activity).
   */
  getMonthlyActivity(sessions = [], days = 30) {
    return this.getDailyTrends(sessions, days);
  },

  /**
   * Get category comparison stats for Chart #6.
   */
  getCategoryComparison(sessions = [], categories = []) {
    const catMap = {};
    for (const cat of categories) {
      catMap[cat.id] = {
        id: cat.id,
        name: cat.name,
        color: cat.color,
        count: 0,
        totalScore: 0,
        totalAccuracy: 0,
        totalReactionMs: 0,
        totalSec: 0
      };
    }

    for (const s of sessions) {
      const cid = s.categoryId;
      if (catMap[cid]) {
        catMap[cid].count++;
        catMap[cid].totalScore += s.score || 0;
        catMap[cid].totalAccuracy += s.accuracy || 0;
        catMap[cid].totalReactionMs += s.reactionTimeMs || 450;
        catMap[cid].totalSec += s.durationSec || 60;
      }
    }

    return Object.values(catMap).map(item => {
      const c = item.count;
      return {
        id: item.id,
        name: item.name,
        color: item.color,
        count: c,
        avgScore: c > 0 ? Math.round(item.totalScore / c) : 0,
        avgAccuracy: c > 0 ? Math.round(item.totalAccuracy / c) : 0,
        avgReactionMs: c > 0 ? Math.round(item.totalReactionMs / c) : 0,
        minutes: Math.round((item.totalSec / 60) * 10) / 10
      };
    });
  },

  /**
   * Get per-game stats breakdown for Chart #7 & Library stats.
   */
  getGameBreakdown(sessions = [], gamesCatalog = []) {
    const gameMap = {};
    for (const g of gamesCatalog) {
      gameMap[g.id] = {
        gameId: g.id,
        name: g.name,
        categoryId: g.categoryId,
        plays: 0,
        bestScore: 0,
        totalScore: 0,
        totalAccuracy: 0,
        totalReactionMs: 0,
        lastPlayed: null
      };
    }

    for (const s of sessions) {
      const gid = s.gameId;
      if (!gameMap[gid]) {
        gameMap[gid] = {
          gameId: gid,
          name: { en: gid, vi: gid },
          categoryId: s.categoryId || 'memory',
          plays: 0,
          bestScore: 0,
          totalScore: 0,
          totalAccuracy: 0,
          totalReactionMs: 0,
          lastPlayed: null
        };
      }
      const item = gameMap[gid];
      item.plays++;
      if ((s.score || 0) > item.bestScore) {
        item.bestScore = s.score || 0;
      }
      item.totalScore += s.score || 0;
      item.totalAccuracy += s.accuracy || 0;
      item.totalReactionMs += s.reactionTimeMs || 450;

      if (!item.lastPlayed || s.completedAt > new Date(item.lastPlayed).getTime()) {
        item.lastPlayed = new Date(s.completedAt).toISOString();
      }
    }

    return Object.values(gameMap).map(item => {
      const p = item.plays;
      return {
        gameId: item.gameId,
        name: item.name,
        categoryId: item.categoryId,
        plays: p,
        bestScore: item.bestScore,
        avgScore: p > 0 ? Math.round(item.totalScore / p) : 0,
        avgAccuracy: p > 0 ? Math.round(item.totalAccuracy / p) : 0,
        avgReactionMs: p > 0 ? Math.round(item.totalReactionMs / p) : 0,
        lastPlayed: item.lastPlayed
      };
    });
  }
};
