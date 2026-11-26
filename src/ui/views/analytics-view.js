import { storage } from '../../core/storage.js';
import { i18n } from '../../core/i18n.js';
import { CATEGORIES } from '../../data/categories.js';
import { GAMES_CATALOG } from '../../data/games-catalog.js';
import { analyticsEngine } from '../../core/analytics-engine.js';
import { renderRadarChart, renderWeeklyChart, renderTrendChart, renderStreakCalendar } from '../components/charts.js';

export async function renderAnalyticsView(container) {
  const isVi = i18n.getLang() === 'vi';
  const lang = i18n.getLang();
  const stats = await storage.getStats();
  const rawSessions = await storage.getSessions(200);

  let currentRange = '30d';
  let currentCat = 'all';
  let currentGame = 'all';

  const computeFilteredSessions = () => {
    let list = [...rawSessions];
    const now = Date.now();
    if (currentRange === '7d') {
      const cutoff = now - 7 * 24 * 60 * 60 * 1000;
      list = list.filter(s => new Date(s.completedAt).getTime() >= cutoff);
    } else if (currentRange === '30d') {
      const cutoff = now - 30 * 24 * 60 * 60 * 1000;
      list = list.filter(s => new Date(s.completedAt).getTime() >= cutoff);
    }

    if (currentCat !== 'all') {
      list = list.filter(s => s.categoryId === currentCat);
    }

    if (currentGame !== 'all') {
      list = list.filter(s => s.gameId === currentGame);
    }

    return list;
  };

  const renderContent = () => {
    const filtered = computeFilteredSessions();
    const summary = analyticsEngine.computeSummaryWithComparison(rawSessions, {
      rangeDays: currentRange === '7d' ? 7 : (currentRange === '30d' ? 30 : 'all'),
      categoryId: currentCat,
      gameId: currentGame
    });
    const categoryComp = analyticsEngine.getCategoryComparison(filtered, CATEGORIES);
    const gameBreakdown = analyticsEngine.getGameBreakdown(rawSessions, GAMES_CATALOG, lang);

    container.innerHTML = `
      <div class="analytics-view animate-fade-in">
        <div class="analytics-header">
          <h2>${isVi ? 'Thống kê & Hiệu suất' : 'Performance Analytics'}</h2>
          <p>${isVi ? 'Phân tích chiều sâu lịch sử luyện tập và xu hướng tiến bộ nhận thức.' : 'Deep dive into your cognitive growth, accuracy, and reaction speed.'}</p>
        </div>

        <!-- Interactive Filters Bar -->
        <div class="analytics-filter-bar" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-bottom: 20px; background: var(--bg-surface); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div class="filter-group">
            <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 4px;">${isVi ? 'Khoảng thời gian' : 'Date Range'}</label>
            <select id="filter-range" class="filter-select">
              <option value="7d" ${currentRange === '7d' ? 'selected' : ''}>7 ${isVi ? 'ngày qua' : 'Days'}</option>
              <option value="30d" ${currentRange === '30d' ? 'selected' : ''}>30 ${isVi ? 'ngày qua' : 'Days'}</option>
              <option value="all" ${currentRange === 'all' ? 'selected' : ''}>${isVi ? 'Tất cả' : 'All Time'}</option>
            </select>
          </div>

          <div class="filter-group">
            <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 4px;">${isVi ? 'Danh mục' : 'Category'}</label>
            <select id="filter-category" class="filter-select">
              <option value="all">${isVi ? 'Tất cả danh mục' : 'All Categories'}</option>
              ${CATEGORIES.map(c => `<option value="${c.id}" ${currentCat === c.id ? 'selected' : ''}>${i18n.pick(c.name)}</option>`).join('')}
            </select>
          </div>

          <div class="filter-group">
            <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 4px;">${isVi ? 'Trò chơi' : 'Game'}</label>
            <select id="filter-game" class="filter-select">
              <option value="all">${isVi ? 'Tất cả trò chơi' : 'All Games'}</option>
              ${GAMES_CATALOG.map(g => `<option value="${g.id}" ${currentGame === g.id ? 'selected' : ''}>${i18n.pick(g.name)}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- KPI Summary Row with Period Comparison Deltas -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-icon-wrap" style="background: rgba(99, 102, 241, 0.12); color: #6366F1;">🧠</div>
            <div class="kpi-data">
              <span class="kpi-value tabular-nums">${stats.nfiScore}</span>
              <span class="kpi-label">${isVi ? 'Chỉ số NFI' : 'NeuroFit Index'}</span>
              ${summary.comparison.deltaScore != null && summary.comparison.deltaScore !== 0 ? `<span class="kpi-sub ${summary.comparison.deltaScore > 0 ? 'positive' : 'negative'}">${summary.comparison.deltaScore > 0 ? '+' : ''}${summary.comparison.deltaScore} vs prev</span>` : ''}
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon-wrap" style="background: rgba(16, 185, 129, 0.12); color: #10B981;">🎯</div>
            <div class="kpi-data">
              <span class="kpi-value tabular-nums">${summary.avgAccuracy}%</span>
              <span class="kpi-label">${isVi ? 'Độ chính xác TB' : 'Avg Accuracy'}</span>
              ${summary.comparison.deltaAccuracy != null && summary.comparison.deltaAccuracy !== 0 ? `<span class="kpi-sub ${summary.comparison.deltaAccuracy > 0 ? 'positive' : 'negative'}">${summary.comparison.deltaAccuracy > 0 ? '+' : ''}${summary.comparison.deltaAccuracy}%</span>` : ''}
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon-wrap" style="background: rgba(6, 182, 212, 0.12); color: #06B6D4;">⚡</div>
            <div class="kpi-data">
              <span class="kpi-value tabular-nums">${summary.avgReactionMs} <small>ms</small></span>
              <span class="kpi-label">${isVi ? 'Tốc độ phản ứng TB' : 'Avg Reaction Time'}</span>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon-wrap" style="background: rgba(245, 158, 11, 0.12); color: #F59E0B;">🔥</div>
            <div class="kpi-data">
              <span class="kpi-value tabular-nums">${stats.currentStreak} <small>${isVi ? 'ngày' : 'days'}</small></span>
              <span class="kpi-label">${isVi ? 'Chuỗi hiện tại' : 'Current Streak'}</span>
            </div>
          </div>
        </div>

        <!-- 7 Analytics Visualizations Bento Grid -->
        <div class="bento-grid-2" style="margin-top: 24px;">
          <!-- 1. Score Performance Trend -->
          <div class="card">
            <div class="bento-header">
              <h3>📈 ${isVi ? 'Xu hướng điểm số' : 'Score Trend'}</h3>
            </div>
            <div class="chart-wrap">
              ${renderTrendChart(filtered, 'score', '#4F46E5', lang)}
            </div>
          </div>

          <!-- 2. Accuracy Over Time Trend -->
          <div class="card">
            <div class="bento-header">
              <h3>🎯 ${isVi ? 'Xu hướng độ chính xác' : 'Accuracy Trend'}</h3>
            </div>
            <div class="chart-wrap">
              ${renderTrendChart(filtered, 'accuracy', '#10B981', lang)}
            </div>
          </div>
        </div>

        <div class="bento-grid-2" style="margin-top: 24px;">
          <!-- 3. Reaction Time Trend -->
          <div class="card">
            <div class="bento-header">
              <h3>⚡ ${isVi ? 'Xu hướng tốc độ phản ứng' : 'Reaction Time Trend'}</h3>
            </div>
            <div class="chart-wrap">
              ${renderTrendChart(filtered, 'reactionTimeMs', '#06B6D4', lang)}
            </div>
          </div>

          <!-- 4. Weekly Activity -->
          <div class="card">
            <div class="bento-header">
              <h3>📅 ${isVi ? 'Hoạt động tuần' : 'Weekly Activity'}</h3>
            </div>
            <div class="chart-wrap">
              ${renderWeeklyChart(stats.activityByDate, lang)}
            </div>
          </div>
        </div>

        <div class="bento-grid-2" style="margin-top: 24px;">
          <!-- 5. Monthly Training Activity Heatmap -->
          <div class="card">
            <div class="bento-header">
              <h3>🔥 ${isVi ? 'Lịch nhiệt độ hoạt động' : 'Activity Heatmap'}</h3>
            </div>
            <div class="chart-wrap">
              ${renderStreakCalendar(stats.activityByDate, lang)}
            </div>
          </div>

          <!-- 6. 8-Domain Cognitive Radar -->
          <div class="card">
            <div class="bento-header">
              <h3>📊 ${isVi ? 'Radar kỹ năng nhận thức' : 'Cognitive Radar'}</h3>
            </div>
            <div class="chart-wrap">
              ${renderRadarChart(stats.categoryScores, CATEGORIES, lang)}
            </div>
          </div>
        </div>

        <!-- 7. Game-Specific Performance Breakdown Table -->
        <div class="card" style="margin-top: 24px;">
          <div class="bento-header">
            <h3>🎮 ${isVi ? 'Phân tích chi tiết từng trò chơi' : 'Game-Specific Performance Breakdown'}</h3>
          </div>
          <div class="table-responsive">
            <table class="analytics-table">
              <thead>
                <tr>
                  <th>${isVi ? 'Trò chơi' : 'Game'}</th>
                  <th>${isVi ? 'Số lượt' : 'Plays'}</th>
                  <th>${isVi ? 'Kỷ lục (PB)' : 'Personal Best'}</th>
                  <th>${isVi ? 'Điểm TB' : 'Avg Score'}</th>
                  <th>${isVi ? 'Độ chính xác TB' : 'Avg Accuracy'}</th>
                  <th>${isVi ? 'Phản ứng TB' : 'Avg Reaction'}</th>
                </tr>
              </thead>
              <tbody>
                ${gameBreakdown.map(gb => `
                  <tr>
                    <td><strong>${i18n.pick(gb.name)}</strong></td>
                    <td><span class="tabular-nums">${gb.plays}</span></td>
                    <td><span class="tabular-nums">${gb.bestScore}</span></td>
                    <td><span class="tabular-nums">${gb.avgScore}</span></td>
                    <td><span class="tabular-nums">${gb.avgAccuracy}%</span></td>
                    <td><span class="tabular-nums">${gb.avgReactionMs} ms</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Rebind filter change listeners
    container.querySelector('#filter-range').addEventListener('change', (e) => {
      currentRange = e.target.value;
      renderContent();
    });
    container.querySelector('#filter-category').addEventListener('change', (e) => {
      currentCat = e.target.value;
      renderContent();
    });
    container.querySelector('#filter-game').addEventListener('change', (e) => {
      currentGame = e.target.value;
      renderContent();
    });
  };

  renderContent();
}
