import { storage } from '../../core/storage.js';
import { i18n } from '../../core/i18n.js';
import { CATEGORIES } from '../../data/categories.js';
import { getGameById } from '../../data/games-catalog.js';

export async function renderHistoryView(container) {
  const isVi = i18n.getLang() === 'vi';
  const sessions = await storage.getSessions(100);
  const difficultyHistory = await storage.getDifficultyHistory() || [];

  let selectedCategory = 'all';

  const renderContent = () => {
    const filteredSessions = selectedCategory === 'all' 
      ? sessions 
      : sessions.filter(s => s.categoryId === selectedCategory);

    container.innerHTML = `
      <div class="history-view animate-fade-in">
        <div class="history-header">
          <h2>${isVi ? 'Lịch sử luyện tập' : 'Training History'}</h2>
          <p>${isVi ? 'Nhật ký toàn bộ các phiên chơi và thay đổi độ thích ứng.' : 'Chronological log of all completed cognitive training sessions.'}</p>
        </div>

        <!-- Category Filter Bar -->
        <div class="history-filter-bar" style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px;">
          <button class="filter-pill ${selectedCategory === 'all' ? 'active' : ''}" data-cat="all">
            ${isVi ? 'Tất cả danh mục' : 'All Categories'}
          </button>
          ${CATEGORIES.map(cat => `
            <button class="filter-pill ${selectedCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}" style="--cat-accent: ${cat.color};">
              ${i18n.pick(cat.name)}
            </button>
          `).join('')}
        </div>

        <!-- Sessions Log Card -->
        <div class="card" style="margin-bottom: 24px;">
          <div class="bento-header">
            <h3>📜 ${isVi ? 'Nhật ký phiên chơi' : 'Session Log'}</h3>
            <span class="badge-sub">${filteredSessions.length} ${isVi ? 'phiên' : 'sessions'}</span>
          </div>
          <div class="table-responsive">
            <table class="history-table">
              <thead>
                <tr>
                  <th>${isVi ? 'Trò chơi' : 'Game'}</th>
                  <th>${isVi ? 'Điểm số' : 'Score'}</th>
                  <th>${isVi ? 'Độ chính xác' : 'Accuracy'}</th>
                  <th>${isVi ? 'Phản ứng' : 'Reaction'}</th>
                  <th>${isVi ? 'Độ khó' : 'Difficulty'}</th>
                  <th>${isVi ? 'Thời gian' : 'Timestamp'}</th>
                </tr>
              </thead>
              <tbody>
                ${filteredSessions.map(s => {
                  const gMeta = getGameById(s.gameId);
                  const gName = gMeta ? i18n.pick(gMeta.name) : s.gameId;
                  const reaction = s.reactionTimeMs || s.reactionMs || 400;
                  return `
                    <tr>
                      <td><strong>${gName}</strong></td>
                      <td><span class="tabular-nums">${s.score}</span></td>
                      <td><span class="tabular-nums">${s.accuracy}%</span></td>
                      <td><span class="tabular-nums">${reaction} ms</span></td>
                      <td><span class="badge-pill-sm">${s.difficulty || 'beginner'}</span></td>
                      <td>${new Date(s.completedAt).toLocaleString()}</td>
                    </tr>
                  `;
                }).join('')}
                ${filteredSessions.length === 0 ? `
                  <tr>
                    <td colspan="6" class="text-center text-muted" style="padding: 40px;">
                      ${isVi ? 'Không tìm thấy phiên chơi phù hợp.' : 'No sessions found for this filter.'}
                    </td>
                  </tr>
                ` : ''}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Difficulty Progression History Card -->
        <div class="card">
          <div class="bento-header">
            <h3>📈 ${isVi ? 'Lịch sử thay đổi độ khó (Adaptive Engine)' : 'Adaptive Difficulty Progression History'}</h3>
            <span class="badge-sub">${difficultyHistory.length} ${isVi ? 'sự kiện' : 'events'}</span>
          </div>
          <div class="table-responsive">
            <table class="history-table">
              <thead>
                <tr>
                  <th>${isVi ? 'Trò chơi' : 'Game'}</th>
                  <th>${isVi ? 'Cũ' : 'Old Tier'}</th>
                  <th>${isVi ? 'Mới' : 'New Tier'}</th>
                  <th>${isVi ? 'Lý do' : 'Reason'}</th>
                  <th>${isVi ? 'Thời gian' : 'Timestamp'}</th>
                </tr>
              </thead>
              <tbody>
                ${difficultyHistory.map(dh => {
                  const gMeta = getGameById(dh.gameId);
                  const gameTitle = gMeta ? i18n.pick(gMeta.name) : dh.gameId;
                  return `
                    <tr>
                      <td><strong>${gameTitle}</strong></td>
                      <td><span class="badge-pill-sm">${dh.previousTier || dh.oldTier || 'beginner'}</span></td>
                      <td><span class="badge-pill-sm" style="background: var(--brand-primary-soft); color: var(--brand-primary);">${dh.newTier}</span></td>
                      <td>${dh.reason}</td>
                      <td>${new Date(dh.timestamp).toLocaleString()}</td>
                    </tr>
                  `;
                }).join('')}
                ${difficultyHistory.length === 0 ? `
                  <tr>
                    <td colspan="5" class="text-center text-muted" style="padding: 30px;">
                      ${isVi ? 'Chưa có sự kiện thay đổi độ khó nào.' : 'No adaptive difficulty adjustments recorded yet.'}
                    </td>
                  </tr>
                ` : ''}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Rebind category filter buttons
    container.querySelectorAll('.history-filter-bar .filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.history-filter-bar .filter-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedCategory = btn.dataset.cat;
        renderContent();
      });
    });
  };

  renderContent();
}
