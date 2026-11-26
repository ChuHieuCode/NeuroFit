import { storage } from '../../core/storage.js';
import { i18n } from '../../core/i18n.js';
import { GAMES_CATALOG } from '../../data/games-catalog.js';
import { CATEGORIES } from '../../data/categories.js';
import { gameEmblem } from '../../ui/icons.js';

export async function renderDailyView(container) {
  const isVi = i18n.getLang() === 'vi';
  const daily = await storage.getOrCreateDailyTraining(GAMES_CATALOG);
  const gameIds = daily.gameIds || [];
  const completedIds = daily.completedGameIds || [];
  const completedCount = completedIds.length;
  const totalCount = gameIds.length || 5;
  const completionPct = Math.round((completedCount / totalCount) * 100);
  const isCompleted = daily.completed || completedCount >= totalCount;
  const nextGameId = gameIds.find(id => !completedIds.includes(id)) || gameIds[0] || 'sequence-recall';

  container.innerHTML = `
    <div class="daily-view animate-fade-in">
      ${isCompleted ? `
        <div class="hero-workout-card" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white;">
          <div class="hero-workout-left">
            <div>
              <span class="badge-pill-primary" style="background: rgba(255,255,255,0.2); color: white;">🎉 ${isVi ? 'Đã hoàn thành!' : 'Workout Complete!'}</span>
              <h2>${isVi ? 'Tuyệt vời! Bạn đã hoàn thành bài tập hôm nay.' : 'Fantastic job! Today\'s circuit is fully completed.'}</h2>
              <p>${isVi ? 'Nhận thưởng +150 XP Bonus và duy trì chuỗi thành công.' : 'Claimed +150 XP Bonus and maintained your streak.'}</p>
            </div>
          </div>
          <div class="hero-workout-right">
            <a href="#/dashboard" class="btn btn-lg" style="background: white; color: #059669; font-weight: 700;">
              🏠 ${isVi ? 'Về Tổng quan' : 'Back to Dashboard'}
            </a>
          </div>
        </div>
      ` : `
        <div class="hero-workout-card">
          <div class="hero-workout-left">
            <div>
              <span class="badge-pill-primary">⚡ ${isVi ? 'Lộ trình cá nhân hóa hôm nay' : 'Personalized Daily Workout'}</span>
              <h2>${isVi ? 'Bài tập 5 trò chơi chuẩn khoa học' : '5-Game Cognitive Circuit'}</h2>
              <p>${isVi ? 'Đã được tối ưu hóa dựa trên điểm yếu nhận thức và chỉ số NFI của bạn. Thời lượng ước tính: ~12-15 phút.' : 'Tailored specifically to balance your cognitive profile. Estimated duration: ~12-15 minutes.'}</p>
              <div class="daily-meta-row">
                <span>⏱️ ~12-15 min</span>
                <span>⭐ +150 XP Bonus</span>
                <span>🎯 ${completedCount} / ${totalCount} (${completionPct}%)</span>
              </div>
            </div>
          </div>
          <div class="hero-workout-right">
            <a href="#/play/${nextGameId}?daily=1" class="btn btn-primary btn-lg">
              🚀 ${isVi ? 'Bắt đầu ngay' : 'Start Session'}
            </a>
          </div>
        </div>
      `}

      <div class="section-block">
        <h3>${isVi ? 'Các bước luyện tập hôm nay' : 'Today\'s Exercises'}</h3>
        <div class="daily-games-list">
          ${gameIds.map((gameId, index) => {
            const game = GAMES_CATALOG.find(g => g.id === gameId) || GAMES_CATALOG[0];
            const cat = CATEGORIES.find(c => c.id === game.categoryId) || CATEGORIES[0];
            const isDone = completedIds.includes(gameId);

            return `
              <div class="daily-step-card ${isDone ? 'completed' : ''}">
                <div class="step-number" style="background: ${cat.softBg}; color: ${cat.color};">
                  ${isDone ? '✓' : `#${index + 1}`}
                </div>
                <div class="step-emblem" style="background: ${cat.softBg}; color: ${cat.color};">
                  ${gameEmblem(game.id, cat.color, 34)}
                </div>
                <div class="step-info">
                  <span class="category-pill-sm" style="color: ${cat.color}; background: ${cat.softBg};">${i18n.pick(cat.name)}</span>
                  <h4>${i18n.pick(game.name)}</h4>
                  <p>${i18n.pick(game.subtitle)}</p>
                </div>
                <div class="step-action">
                  <a href="#/play/${game.id}?daily=1" class="btn ${isDone ? 'btn-ghost' : 'btn-outline'} btn-sm">
                    ${isDone ? (isVi ? 'Chơi lại' : 'Replay') : (isVi ? 'Bắt đầu' : 'Play')} →
                  </a>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}
