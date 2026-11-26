import { storage } from '../../core/storage.js';
import { i18n } from '../../core/i18n.js';
import { bus } from '../../core/events.js';
import { ACHIEVEMENTS_CATALOG, THEMES } from '../../data/avatars-themes.js';
import { gamificationEngine } from '../../core/gamification.js';
import { icon } from '../../ui/icons.js';
import { showToast } from '../components/toast-confetti.js';
import { renderStreakCalendar } from '../components/charts.js';

export async function renderAchievementsView(container) {
  const isVi = i18n.getLang() === 'vi';
  const stats = await storage.getStats();
  const prefs = storage.getPrefs();
  const sessions = await storage.getSessions(200);

  // Evaluate achievements dynamically
  const evaluatedAchievements = await gamificationEngine.evaluateAchievements(storage, sessions, stats);
  const unlockedBadges = evaluatedAchievements.filter(a => a.unlocked);
  const unlockedCount = unlockedBadges.length;

  // 4 Active Challenges via gamificationEngine
  const challenges = gamificationEngine.generateChallenges ? gamificationEngine.generateChallenges(sessions, stats) : [];

  container.innerHTML = `
    <div class="achievements-view animate-fade-in">
      <div class="achievements-hero">
        <div class="ah-info">
          <span class="badge-pill-primary">⭐ Level ${stats.level} Explorer</span>
          <h2>${isVi ? 'Thành tựu & Huy hiệu' : 'Achievements & Badges'}</h2>
          <p>${isVi ? `Đã mở khóa ${unlockedCount} / ${evaluatedAchievements.length} huy hiệu vinh quang.` : `Unlocked ${unlockedCount} of ${evaluatedAchievements.length} prestigious badges.`}</p>
          <div class="level-progress-bar-wrap">
            <div class="lp-header">
              <span>XP: ${stats.totalXp} XP</span>
              <span>Next Level in ${stats.xpForNextLevel - stats.xpIntoLevel} XP</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${Math.round((stats.xpIntoLevel / stats.xpForNextLevel) * 100)}%"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4 Active Challenges Section -->
      <div class="section-block">
        <h3>🎯 ${isVi ? 'Thử thách đang diễn ra' : 'Active Challenges'}</h3>
        <div class="challenges-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-top: 12px;">
          ${challenges.map(ch => {
            const pct = Math.min(100, Math.round((ch.progress / ch.target) * 100));
            const isDone = ch.completed;
            return `
              <div class="card" style="padding: 16px; position: relative;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                  <h4 style="font-size: 0.95rem; font-weight: 700;">${i18n.pick(ch.title)}</h4>
                  <span class="badge-pill-primary" style="font-size: 0.75rem;">+${ch.rewardXp} XP</span>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px;">${i18n.pick(ch.description)}</p>
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 4px;">
                  <span class="tabular-nums">${ch.progress} / ${ch.target}</span>
                  <span style="font-weight: 600; color: ${isDone ? 'var(--brand-secondary)' : 'var(--text-muted)'};">${isDone ? (isVi ? 'Hoàn thành ✓' : 'Completed ✓') : `${pct}%`}</span>
                </div>
                <div class="progress-track">
                  <div class="progress-fill" style="width: ${pct}%;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Streak Calendar Section -->
      <div class="section-block">
        <h3>🔥 ${isVi ? 'Lịch duy trì chuỗi' : 'Streak Calendar'}</h3>
        <div class="card" style="padding: 20px; margin-top: 12px;">
          ${renderStreakCalendar(stats.activityByDate, isVi ? 'vi' : 'en')}
        </div>
      </div>

      <!-- Unlockable Themes Preview -->
      <div class="section-block">
        <h3>🎨 ${isVi ? 'Giao diện thưởng mở khóa (Nhấn để kích hoạt)' : 'Reward Themes (Click to Activate)'}</h3>
        <div class="themes-preview-grid">
          ${THEMES.map(theme => {
            const isUnlocked = theme.unlockLevel <= 1 || prefs.unlockedThemes.includes(theme.id);
            const isCurrent = prefs.theme === theme.id;
            return `
              <div class="theme-reward-card ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'active' : ''}" data-activate-theme="${theme.id}" style="cursor: ${isUnlocked ? 'pointer' : 'default'};">
                <div class="theme-color-preview" style="background: ${theme.previewBg};"></div>
                <h4>${i18n.pick(theme.name)}</h4>
                <p>${isUnlocked ? (isCurrent ? (isVi ? 'Đang dùng ✓' : 'Active ✓') : (isVi ? 'Đã mở khóa (Nhấn dùng)' : 'Unlocked (Click)')) : `Level ${theme.unlockLevel}`}</p>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- All Badges Grid -->
      <div class="section-block">
        <h3>🏆 ${isVi ? 'Tất cả huy hiệu' : 'All Badges'}</h3>
        <div class="achievement-grid">
          ${evaluatedAchievements.map(ach => {
            const pct = Math.min(100, Math.round((ach.progress.current / ach.progress.target) * 100));
            return `
              <div class="achievement-card ${ach.unlocked ? '' : 'locked'}">
                <div class="achievement-icon-wrap">${icon(ach.icon, 24)}</div>
                <div class="achievement-info">
                  <h4>${i18n.pick(ach.name)}</h4>
                  <p>${i18n.pick(ach.desc)}</p>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                    <span class="badge-status" style="font-size: 0.75rem;">${ach.unlocked ? (isVi ? 'Đã đạt được ✓' : 'Unlocked ✓') : `${ach.progress.current} / ${ach.progress.target}`}</span>
                    ${!ach.unlocked ? `<div class="progress-track" style="width: 80px; height: 6px;"><div class="progress-fill" style="width: ${pct}%;"></div></div>` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  // Attach theme activation listener
  container.querySelectorAll('[data-activate-theme]').forEach(card => {
    card.addEventListener('click', async () => {
      const themeId = card.dataset.activateTheme;
      const themeMeta = THEMES.find(t => t.id === themeId);
      const prefsCurrent = storage.getPrefs();
      const isUnlocked = themeMeta?.unlockLevel <= 1 || prefsCurrent.unlockedThemes.includes(themeId);

      if (isUnlocked) {
        await storage.savePrefs({ theme: themeId });
        bus.emit('prefs:changed', { theme: themeId });
        showToast(isVi ? `Đã kích hoạt giao diện ${themeId}!` : `Activated theme ${themeId}!`);
        renderAchievementsView(container);
      } else {
        showToast(isVi ? 'Giao diện này chưa được mở khóa!' : 'Theme is locked!');
      }
    });
  });
}
