import { storage } from '../../core/storage.js';
import { i18n } from '../../core/i18n.js';
import { router } from '../../core/router.js';
import { DIFFICULTY_TIERS, difficultyEngine } from '../../core/difficulty.js';
import { GAMES_CATALOG, getGameById } from '../../data/games-catalog.js';
import { CATEGORIES } from '../../data/categories.js';
import { renderGameCard } from '../components/game-card.js';
import { isGameImplemented } from '../../games/registry.js';
import { gameEmblem } from '../../ui/icons.js';

export async function renderLibraryView(container, query = {}) {
  const isVi = i18n.getLang() === 'vi';
  const prefs = storage.getPrefs();
  const stats = await storage.getStats();
  const sessions = await storage.getSessions(20);
  const favorites = prefs.favorites || [];
  const lang = i18n.getLang();

  let currentCategory = query.cat || 'all';
  let searchQuery = query.q || '';
  let selectedDifficulty = query.diff || 'all';
  let favOnly = query.fav === 'true';

  // Recently played unique games (up to 4)
  const recentlyPlayedIds = [];
  for (const s of sessions) {
    if (!recentlyPlayedIds.includes(s.gameId) && recentlyPlayedIds.length < 4) {
      recentlyPlayedIds.push(s.gameId);
    }
  }

  const renderGridHTML = () => {
    let filtered = GAMES_CATALOG.filter(game => {
      const matchesCat = currentCategory === 'all' || game.categoryId === currentCategory;
      const tier = difficultyEngine.getTier(game.id);
      const matchesDiff = selectedDifficulty === 'all' || tier === selectedDifficulty;
      const nameText = i18n.pick(game.name).toLowerCase();
      const subText = i18n.pick(game.subtitle).toLowerCase();
      const matchesQuery = !searchQuery || nameText.includes(searchQuery.toLowerCase()) || subText.includes(searchQuery.toLowerCase());
      const matchesFav = !favOnly || favorites.includes(game.id);
      return matchesCat && matchesDiff && matchesQuery && matchesFav;
    });

    if (filtered.length === 0) {
      return `
        <div class="empty-state">
          <span class="empty-icon">🔍</span>
          <h3>${isVi ? 'Không tìm thấy trò chơi phù hợp' : 'No games found'}</h3>
          <p>${isVi ? 'Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.' : 'Try adjusting your filters or search query.'}</p>
        </div>
      `;
    }

    return `
      <div class="games-grid">
        ${filtered.map(game => {
          const cat = CATEGORIES.find(c => c.id === game.categoryId) || CATEGORIES[0];
          const isFav = favorites.includes(game.id);
          const tier = difficultyEngine.getTier(game.id);
          const pb = stats.personalBests?.[game.id];
          const isPlayable = isGameImplemented(game.id);

          return renderGameCard(game, {
            category: cat,
            pb,
            isFav,
            tier,
            isPlayable,
            lang
          });
        }).join('')}
      </div>
    `;
  };

  container.innerHTML = `
    <div class="library-view animate-fade-in">
      <div class="filter-bar">
        <div>
          <h2>${isVi ? 'Thư viện trò chơi nhận thức' : 'Cognitive Game Library'}</h2>
          <p>${isVi ? 'Khám phá tất cả 27 trò chơi rèn luyện trí não theo tiêu chuẩn khoa học.' : 'Explore all 27 science-backed brain training exercises.'}</p>
        </div>
        <div class="search-box">
          <input type="text" class="search-input" id="lib-search-input" value="${searchQuery}" placeholder="${isVi ? 'Tìm kiếm game...' : 'Search games...'}">
        </div>
      </div>

      <!-- Recently Played Row (if sessions > 0 and no search active) -->
      ${recentlyPlayedIds.length > 0 && !searchQuery ? `
        <div class="recently-played-section" style="margin-bottom: 24px;">
          <h3 style="font-size: 1rem; margin-bottom: 12px; color: var(--text-secondary);">⏳ ${isVi ? 'Chơi gần đây' : 'Recently Played'}</h3>
          <div class="recently-played-row" style="display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px;">
            ${recentlyPlayedIds.map(gId => {
              const game = getGameById(gId);
              if (!game) return '';
              const cat = CATEGORIES.find(c => c.id === game.categoryId) || CATEGORIES[0];
              return `
                <a href="#/play/${game.id}" class="recently-played-pill" style="display: flex; align-items: center; gap: 10px; background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: 8px 14px; border-radius: var(--radius-pill); text-decoration: none; color: var(--text-primary); white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
                  <div style="width: 28px; height: 28px; border-radius: 6px; background: ${cat.softBg}; color: ${cat.color}; display: flex; align-items: center; justify-content: center;">
                    ${gameEmblem(game.id, cat.color, 18)}
                  </div>
                  <span style="font-weight: 600; font-size: 0.85rem;">${i18n.pick(game.name)}</span>
                </a>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Category Filter Pills -->
      <div class="pill-row">
        <button class="filter-pill ${currentCategory === 'all' ? 'active' : ''}" data-cat="all">
          ✨ ${isVi ? 'Tất cả (27)' : 'All (27)'}
        </button>
        ${CATEGORIES.map(cat => `
          <button class="filter-pill ${currentCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}" style="--cat-accent: ${cat.color};">
            ${i18n.pick(cat.name)}
          </button>
        `).join('')}
      </div>

      <!-- Difficulty Filter Pills & Favorites Toggle Row -->
      <div class="library-sub-filters" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 24px;">
        <div class="difficulty-pill-row" style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button class="diff-filter-pill ${selectedDifficulty === 'all' ? 'active' : ''}" data-diff="all">
            ${isVi ? 'Mọi độ khó' : 'All Tiers'}
          </button>
          ${DIFFICULTY_TIERS.map(tier => `
            <button class="diff-filter-pill ${selectedDifficulty === tier ? 'active' : ''}" data-diff="${tier}">
              ${tier.charAt(0).toUpperCase() + tier.slice(1)}
            </button>
          `).join('')}
        </div>

        <label class="checkbox-label">
          <input type="checkbox" id="lib-fav-checkbox" ${favOnly ? 'checked' : ''}>
          <span>❤️ ${isVi ? 'Chỉ yêu thích' : 'Favorites only'}</span>
        </label>
      </div>

      <div id="library-grid-container">
        ${renderGridHTML()}
      </div>
    </div>
  `;

  // Attach interactive filter & favorite listeners
  const searchInput = container.querySelector('#lib-search-input');
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    container.querySelector('#library-grid-container').innerHTML = renderGridHTML();
  });

  container.querySelectorAll('.pill-row .filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.pill-row .filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.cat;
      container.querySelector('#library-grid-container').innerHTML = renderGridHTML();
    });
  });

  container.querySelectorAll('.diff-filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.diff-filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedDifficulty = btn.dataset.diff;
      container.querySelector('#library-grid-container').innerHTML = renderGridHTML();
    });
  });

  const favCheckbox = container.querySelector('#lib-fav-checkbox');
  favCheckbox.addEventListener('change', (e) => {
    favOnly = e.target.checked;
    container.querySelector('#library-grid-container').innerHTML = renderGridHTML();
  });

  container.addEventListener('click', async (e) => {
    const playBtn = e.target.closest('[data-play-game]');
    if (playBtn) {
      e.preventDefault();
      router.navigate(`#/play/${playBtn.dataset.playGame}`);
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
