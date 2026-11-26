import { storage } from '../../core/storage.js';
import { i18n } from '../../core/i18n.js';
import { router } from '../../core/router.js';
import { GAMES_CATALOG, getGameById } from '../../data/games-catalog.js';
import { CATEGORIES } from '../../data/categories.js';
import { getAvatarObject } from '../../data/avatars-themes.js';
import { renderGameCard } from '../components/game-card.js';
import { renderRadarChart, renderWeeklyChart } from '../components/charts.js';
import { isGameImplemented } from '../../games/registry.js';
import { gamificationEngine } from '../../core/gamification.js';
import { icon } from '../../ui/icons.js';

export async function renderDashboardView(container) {
  const profile = storage.getProfile();
  const avatar = getAvatarObject(profile.avatarId);
  const stats = await storage.getStats();
  const sessions = await storage.getSessions(20);
  const isVi = i18n.getLang() === 'vi';
  const daily = await storage.getOrCreateDailyTraining(GAMES_CATALOG);
  const lang = i18n.getLang();

  // Today's 5 daily games IDs
  const dailyGameIds = daily.gameIds || [];
  const nextGameId = dailyGameIds.find(id => !daily.completedGameIds?.includes(id)) || dailyGameIds[0] || 'sequence-recall';

  // Recommend 4 diverse games prioritizing weaker categories
  const categoryScores = stats.categoryScores || {};
  const sortedCategories = [...CATEGORIES].sort((a, b) => (categoryScores[a.id] || 0) - (categoryScores[b.id] || 0));
  const recommendedGames = [];
  for (const cat of sortedCategories) {
    const match = GAMES_CATALOG.find(g => g.categoryId === cat.id && !recommendedGames.includes(g));
    if (match) recommendedGames.push(match);
    if (recommendedGames.length >= 4) break;
  }
  while (recommendedGames.length < 4) {
    const fallback = GAMES_CATALOG.find(g => !recommendedGames.includes(g));
    if (fallback) recommendedGames.push(fallback);
    else break;
  }

  // Evaluate achievements for dashboard card
  const evaluatedAchievements = await gamificationEngine.evaluateAchievements(storage, sessions, stats);
  const unlockedBadges = evaluatedAchievements.filter(a => a.unlocked);
  const lockedBadges = evaluatedAchievements.filter(a => !a.unlocked).slice(0, 3);

  container.innerHTML = `
    <div class="dashboard-view animate-fade-in">
      <!-- Welcome Hero Workout Card -->
      <div class="hero-workout-card">
        <div class="hero-workout-left">
          <div class="hero-avatar" style="background: ${avatar.bg}; color: ${avatar.color};">
            ${avatar.symbol}
          </div>
          <div>
            <h1>${isVi ? 'Chào, ' : 'Welcome back, '}${profile.username}! 👋</h1>
            <p>${isVi ? 'Lộ trình luyện tập cá nhân hóa hôm nay sẵn sàng kích hoạt.' : 'Your personalized daily cognitive circuit is ready.'}</p>
            <div class="hero-step-pills">
              ${dailyGameIds.map((gId, idx) => {
                const gMeta = GAMES_CATALOG.find(x => x.id === gId);
                const isDone = daily.completedGameIds?.includes(gId);
                return `
                  <a href="#/play/${gId}?daily=1" class="hero-step-pill ${isDone ? 'done' : ''}">
                    ${isDone ? '✓' : `#${idx + 1}`} ${gMeta ? i18n.pick(gMeta.name) : gId}
                  </a>
                `;
              }).join('')}
            </div>
          </div>
        </div>
        <div class="hero-workout-right">
          <a href="#/play/${nextGameId}?daily=1" class="btn btn-primary btn-lg">
            ⚡ ${isVi ? 'Tiếp tục luyện tập' : 'Start Next Daily Game'}
          </a>
        </div>
      </div>

      <!-- 4 KPI Bento Cards -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon-wrap" style="background: rgba(99, 102, 241, 0.12); color: #6366F1;">🧠</div>
          <div class="kpi-data">
            <span class="kpi-value tabular-nums">${stats.nfiScore}</span>
            <span class="kpi-label">${isVi ? 'Chỉ số NeuroFit (NFI)' : 'NeuroFit Index'}</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-wrap" style="background: rgba(245, 158, 11, 0.12); color: #F59E0B;">🔥</div>
          <div class="kpi-data">
            <span class="kpi-value tabular-nums">${stats.currentStreak} <small>${isVi ? 'ngày' : 'days'}</small></span>
            <span class="kpi-label">${isVi ? 'Chuỗi liên tiếp' : 'Current Streak'}</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-wrap" style="background: rgba(16, 185, 129, 0.12); color: #10B981;">🎮</div>
          <div class="kpi-data">
            <span class="kpi-value tabular-nums">${stats.totalSessions}</span>
            <span class="kpi-label">${isVi ? 'Tổng số lượt chơi' : 'Total Sessions'}</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-wrap" style="background: rgba(6, 182, 212, 0.12); color: #06B6D4;">⏱️</div>
          <div class="kpi-data">
            <span class="kpi-value tabular-nums">${Math.round(stats.totalPlayTimeSec / 60)} <small>min</small></span>
            <span class="kpi-label">${isVi ? 'Thời gian rèn luyện' : 'Training Time'}</span>
          </div>
        </div>
      </div>

      <!-- 2-Column Bento: Charts & Radar -->
      <div class="bento-grid-2">
        <div class="card">
          <div class="bento-header">
            <h3>📊 ${isVi ? 'Tổng quan 8 kỹ năng' : '8-Skill Cognitive Radar'}</h3>
            <a href="#/analytics" class="text-link">${isVi ? 'Chi tiết' : 'View Stats'} →</a>
          </div>
          <div class="radar-chart-container" id="dash-radar-wrap">
            ${renderRadarChart(stats.categoryScores, CATEGORIES, lang)}
          </div>
        </div>

        <div class="card">
          <div class="bento-header">
            <h3>📅 ${isVi ? 'Hoạt động trong tuần' : 'Weekly Activity'}</h3>
            <span class="badge-sub">${isVi ? '7 ngày qua' : 'Last 7 days'}</span>
          </div>
          <div class="weekly-chart-container" id="dash-weekly-wrap">
            ${renderWeeklyChart(stats.activityByDate, lang)}
          </div>
        </div>
      </div>

      <!-- Recommended Games Grid -->
      <div class="section-block">
        <div class="section-header">
          <h3>🎮 ${isVi ? 'Trò chơi đề xuất' : 'Recommended Games'}</h3>
          <a href="#/library" class="text-link">${isVi ? 'Xem tất cả 27 game' : 'View All 27 Games'} →</a>
        </div>
        <div class="games-grid" id="dash-recommended-grid">
          ${recommendedGames.map(game => {
            const cat = CATEGORIES.find(c => c.id === game.categoryId) || CATEGORIES[0];
            return renderGameCard(game, {
              category: cat,
              pb: stats.personalBests[game.id],
              isFav: prefsFavoritesContains(game.id),
              tier: 'beginner',
              isPlayable: isGameImplemented(game.id),
              lang
            });
          }).join('')}
        </div>
      </div>

      <!-- Second Bento Grid: Recent Results & Achievement Progress -->
      <div class="bento-grid-2" style="margin-top: 24px;">
        <!-- Recent Game Results & Personal Bests -->
        <div class="card">
          <div class="bento-header">
            <h3>📜 ${isVi ? 'Kết quả gần đây & Kỷ lục' : 'Recent Results & Personal Bests'}</h3>
            <a href="#/history" class="text-link">${isVi ? 'Lịch sử' : 'History'} →</a>
          </div>
          <div class="recent-sessions-list">
            ${sessions.slice(0, 4).map(s => {
              const gMeta = getGameById(s.gameId);
              const gName = gMeta ? i18n.pick(gMeta.name) : s.gameId;
              const xpEarned = s.xpEarned || Math.round(s.score / 10);
              return `
                <div class="recent-session-row">
                  <div class="rs-info">
                    <strong>${gName}</strong>
                    <span>${new Date(s.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • <strong style="color:var(--brand-primary);">+${xpEarned} XP</strong></span>
                  </div>
                  <div class="rs-stats">
                    <span class="tabular-nums">Score: <strong>${s.score}</strong></span>
                    <span class="tabular-nums">Acc: <strong>${s.accuracy}%</strong></span>
                  </div>
                </div>
              `;
            }).join('')}
            ${sessions.length === 0 ? `
              <div class="empty-state-sm">
                <p class="text-muted">${isVi ? 'Chưa có phiên chơi nào gần đây. Hãy bắt đầu chơi ngay!' : 'No recent sessions yet. Play a game to populate your feed!'}</p>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Achievement Progress -->
        <div class="card">
          <div class="bento-header">
            <h3>🏆 ${isVi ? 'Tiến độ thành tựu' : 'Achievement Progress'}</h3>
            <a href="#/achievements" class="text-link">${isVi ? 'Tất cả (' + unlockedBadges.length + '/' + evaluatedAchievements.length + ')' : 'View All (' + unlockedBadges.length + '/' + evaluatedAchievements.length + ')'} →</a>
          </div>
          <div class="achievement-progress-preview">
            <p class="text-muted" style="margin-bottom: 12px; font-size: 0.9rem;">${isVi ? 'Các huy hiệu sắp đạt được:' : 'Badges in progress:'}</p>
            ${lockedBadges.map(ach => `
              <div class="ach-preview-row">
                <span class="ach-icon">${icon(ach.icon, 18)}</span>
                <div class="ach-preview-info">
                  <div class="ach-preview-title">
                    <span>${i18n.pick(ach.name)}</span>
                    <span class="tabular-nums">${ach.progress.current} / ${ach.progress.target}</span>
                  </div>
                  <div class="progress-track">
                    <div class="progress-fill" style="width: ${Math.min(100, Math.round((ach.progress.current / ach.progress.target) * 100))}%"></div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  attachDashboardDelegation(container);
}

function prefsFavoritesContains(gameId) {
  const prefs = storage.getPrefs();
  return (prefs.favorites || []).includes(gameId);
}

function attachDashboardDelegation(container) {
  container.addEventListener('click', async (e) => {
    const playBtn = e.target.closest('[data-play-game]');
    if (playBtn) {
      e.preventDefault();
      const gameId = playBtn.dataset.playGame;
      router.navigate(`#/play/${gameId}`);
      return;
    }

    const favBtn = e.target.closest('[data-fav-game]');
    if (favBtn) {
      e.preventDefault();
      const gameId = favBtn.dataset.favGame;
      const isFav = await storage.toggleFavorite(gameId);
      favBtn.classList.toggle('active', isFav);
      favBtn.textContent = isFav ? '❤️' : '🤍';
    }
  });
}
