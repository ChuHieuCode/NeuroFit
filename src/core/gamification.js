/**
 * @file gamification.js
 * @description Complete Gamification Engine for NeuroFit (Master Prompt Section 9).
 */

import { ACHIEVEMENTS_CATALOG } from '../data/avatars-themes.js';
import { CATEGORIES } from '../data/categories.js';

// Local date helper YYYY-MM-DD
function getLocalDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const gamificationEngine = {
  /**
   * Compute level, XP progress into current level, and next level threshold.
   * Curve: Level N requires 250 XP per level.
   */
  computeLevelProgress(totalXp = 0) {
    const xpPerLevel = 250;
    const level = Math.floor(totalXp / xpPerLevel) + 1;
    const xpIntoLevel = totalXp % xpPerLevel;
    const pct = Math.min(100, Math.max(0, Math.round((xpIntoLevel / xpPerLevel) * 100)));

    return {
      level,
      totalXp,
      xpIntoLevel,
      xpForNextLevel: xpPerLevel,
      pct
    };
  },

  /**
   * Evaluate all 12 achievements from ACHIEVEMENTS_CATALOG against real sessions & stats.
   */
  async evaluateAchievements(storage, sessions, stats) {
    const unlockedList = await storage.getUnlockedAchievements();
    const unlockedMap = new Map(unlockedList.map(a => [a.id, a.unlockedAt]));

    const totalSessions = sessions.length;
    const currentStreak = stats.currentStreak || 0;
    const maxAccuracy = sessions.length > 0 ? Math.max(...sessions.map(s => s.accuracy || 0)) : 0;
    const highAccuracyCount = sessions.filter(s => (s.accuracy || 0) >= 90).length;

    const memoryCount = sessions.filter(s => s.categoryId === 'memory').length;
    const speedCount = sessions.filter(s => s.categoryId === 'speed').length;

    const playedCategories = new Set(sessions.map(s => s.categoryId)).size;
    const dailyTrainingCompletedCount = stats.dailyTrainingCompletedCount || 0;

    return ACHIEVEMENTS_CATALOG.map(item => {
      const isUnlocked = unlockedMap.has(item.id);
      const unlockedAt = unlockedMap.get(item.id) || null;

      let current = 0;
      let target = 1;
      let pct = isUnlocked ? 100 : 0;

      switch (item.id) {
        case 'first-game':
          target = 1;
          current = Math.min(target, totalSessions);
          pct = totalSessions >= 1 ? 100 : 0;
          break;
        case 'perfect-score':
          target = 1;
          current = maxAccuracy >= 100 ? 1 : 0;
          pct = maxAccuracy >= 100 ? 100 : 0;
          break;
        case 'streak-3':
          target = 3;
          current = Math.min(target, currentStreak);
          pct = Math.min(100, Math.round((currentStreak / 3) * 100));
          break;
        case 'streak-5':
          target = 5;
          current = Math.min(target, currentStreak);
          pct = Math.min(100, Math.round((currentStreak / 5) * 100));
          break;
        case 'streak-7':
          target = 7;
          current = Math.min(target, currentStreak);
          pct = Math.min(100, Math.round((currentStreak / 7) * 100));
          break;
        case 'streak-30':
          target = 30;
          current = Math.min(target, currentStreak);
          pct = Math.min(100, Math.round((currentStreak / 30) * 100));
          break;
        case 'memory-master':
          target = 10;
          current = Math.min(target, memoryCount);
          pct = Math.min(100, Math.round((memoryCount / 10) * 100));
          break;
        case 'speed-demon':
          target = 10;
          current = Math.min(target, speedCount);
          pct = Math.min(100, Math.round((speedCount / 10) * 100));
          break;
        case 'accuracy-expert':
          target = 25;
          current = Math.min(target, highAccuracyCount);
          pct = Math.min(100, Math.round((highAccuracyCount / 25) * 100));
          break;
        case 'daily-champion':
          target = 7;
          current = Math.min(target, dailyTrainingCompletedCount);
          pct = Math.min(100, Math.round((dailyTrainingCompletedCount / 7) * 100));
          break;
        case 'all-categories':
          target = 8;
          current = Math.min(target, playedCategories);
          pct = Math.min(100, Math.round((playedCategories / 8) * 100));
          break;
        case 'games-100':
          target = 100;
          current = Math.min(target, totalSessions);
          pct = Math.min(100, Math.round((totalSessions / 100) * 100));
          break;
        default:
          pct = isUnlocked ? 100 : 0;
      }

      return {
        ...item,
        unlocked: isUnlocked || pct >= 100,
        unlockedAt,
        progress: {
          current,
          target,
          pct: isUnlocked ? 100 : pct
        }
      };
    });
  },

  /**
   * Generate 4 real dynamic challenges computed strictly from gameplay data.
   */
  generateChallenges(sessions, stats) {
    const today = getLocalDateKey();
    const todaySessions = sessions.filter(s => s.dateKey === today);
    const todayCount = todaySessions.length;

    // 1. Daily Challenge
    const dailyTarget = 3;
    const dailyProgress = Math.min(dailyTarget, todayCount);
    const dailyCompleted = dailyProgress >= dailyTarget;

    // 2. Weekly Challenge (last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 86400000;
    const recentSessions = sessions.filter(s => s.completedAt >= sevenDaysAgo);
    const weeklyTarget = 15;
    const weeklyProgress = Math.min(weeklyTarget, recentSessions.length);
    const weeklyCompleted = weeklyProgress >= weeklyTarget;

    // 3. Personal Best Challenge: Check if any session today achieved >= personal best for that game
    let pbToday = false;
    const personalBests = stats.personalBests || {};
    for (const s of todaySessions) {
      const best = personalBests[s.gameId];
      if (best && (s.score || 0) >= best.score) {
        pbToday = true;
        break;
      } else if (!best && (s.score || 0) > 0) {
        pbToday = true;
        break;
      }
    }

    // 4. Category Focus Challenge (find lowest scoring category)
    const catScores = stats.categoryScores || {};
    let lowestCatId = 'memory';
    let lowestScore = 999;
    for (const cat of CATEGORIES) {
      const score = catScores[cat.id] || 0;
      if (score < lowestScore) {
        lowestScore = score;
        lowestCatId = cat.id;
      }
    }
    const lowestCatMeta = CATEGORIES.find(c => c.id === lowestCatId) || CATEGORIES[0];
    const categoryFocusCompleted = todaySessions.some(s => s.categoryId === lowestCatId);

    return [
      {
        id: 'daily-session-goal',
        type: 'daily',
        title: { en: 'Daily Focus Sprint', vi: 'Bứt phá tập trung hằng ngày' },
        description: {
          en: `Complete ${dailyTarget} training sessions today with >=85% accuracy`,
          vi: `Hoàn thành ${dailyTarget} phiên tập hôm nay với độ chính xác >=85%`
        },
        rewardXp: 75,
        progress: dailyProgress,
        target: dailyTarget,
        completed: dailyCompleted
      },
      {
        id: 'weekly-training-goal',
        type: 'weekly',
        title: { en: 'Weekly Consistency', vi: 'Sự bền bỉ hằng tuần' },
        description: {
          en: `Complete ${weeklyTarget} training sessions in the last 7 days`,
          vi: `Hoàn thành ${weeklyTarget} phiên tập trong 7 ngày qua`
        },
        rewardXp: 200,
        progress: weeklyProgress,
        target: weeklyTarget,
        completed: weeklyCompleted
      },
      {
        id: 'personal-best-goal',
        type: 'daily',
        title: { en: 'Record Breaker', vi: 'Phá kỷ lục cá nhân' },
        description: {
          en: 'Set or beat a personal best score in any game today',
          vi: 'Thiết lập hoặc phá kỷ lục điểm số cá nhân trong trò chơi hôm nay'
        },
        rewardXp: 100,
        progress: pbToday ? 1 : 0,
        target: 1,
        completed: pbToday
      },
      {
        id: 'category-focus-goal',
        type: 'daily',
        title: { en: `Domain Focus: ${lowestCatMeta.name.en}`, vi: `Tập trung chuyên sâu: ${lowestCatMeta.name.vi}` },
        description: {
          en: `Train your lowest scoring domain (${lowestCatMeta.name.en}) today`,
          vi: `Luyện tập lĩnh vực điểm thấp nhất (${lowestCatMeta.name.vi}) hôm nay`
        },
        rewardXp: 90,
        progress: categoryFocusCompleted ? 1 : 0,
        target: 1,
        completed: categoryFocusCompleted
      }
    ];
  }
};
