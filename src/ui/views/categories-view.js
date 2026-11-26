import { storage } from '../../core/storage.js';
import { i18n } from '../../core/i18n.js';
import { CATEGORIES } from '../../data/categories.js';
import { GAMES_CATALOG } from '../../data/games-catalog.js';
import { icon } from '../../ui/icons.js';

export async function renderCategoriesView(container) {
  const isVi = i18n.getLang() === 'vi';
  const stats = await storage.getStats();
  const categoryScores = stats.categoryScores || {};

  container.innerHTML = `
    <div class="categories-view animate-fade-in">
      <div class="categories-header">
        <h2>${isVi ? '8 Danh mục Nhận thức' : '8 Cognitive Categories'}</h2>
        <p>${isVi ? 'Mỗi danh mục rèn luyện một khía cạnh riêng biệt của não bộ.' : 'Each category targets a distinct neural network and cognitive faculty.'}</p>
      </div>

      <div class="categories-grid">
        ${CATEGORIES.map(cat => {
          const score = categoryScores[cat.id] || 0;
          const gamesInCat = GAMES_CATALOG.filter(g => g.categoryId === cat.id);

          return `
            <div class="category-card" style="--cat-accent: ${cat.color};">
              <div class="category-card-top">
                <div class="category-icon-wrap" style="background: ${cat.softBg}; color: ${cat.color};">
                  ${icon(cat.icon, 24)}
                </div>
                <div class="category-score-badge" style="background: ${cat.softBg}; color: ${cat.color};">
                  ${score}/100
                </div>
              </div>
              <h3>${i18n.pick(cat.name)}</h3>
              <p>${i18n.pick(cat.description)}</p>
              
              <div class="category-games-preview">
                <span class="wg-title">${isVi ? 'Trò chơi tiêu biểu:' : 'Featured Games:'}</span>
                <ul>
                  ${gamesInCat.slice(0, 3).map(g => `<li>• ${i18n.pick(g.name)}</li>`).join('')}
                </ul>
              </div>

              <div class="category-card-footer">
                <span class="game-count">${gamesInCat.length} ${isVi ? 'trò chơi' : 'games'}</span>
                <a href="#/library?cat=${cat.id}" class="btn btn-outline btn-sm">
                  ${isVi ? 'Khám phá →' : 'Explore →'}
                </a>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
