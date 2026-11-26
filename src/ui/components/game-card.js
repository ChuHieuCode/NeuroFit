/**
 * @file game-card.js
 * @description Game card component renderer for libraries and home dashboard.
 */

import { icon, gameEmblem } from '../icons.js';
import { getCategoryById } from '../../data/categories.js';

export function renderGameCard(game, { category = null, pb = null, isFav = false, tier = 'beginner', isPlayable = true, lang = 'en' } = {}) {
  const cat = category || getCategoryById(game.categoryId) || { color: '#4F46E5', softBg: '#EEF2FF', name: { en: 'Category', vi: 'Danh mục' } };
  const gameName = game.name[lang] || game.name.en;
  const gameSub = game.subtitle[lang] || game.subtitle.en;
  const catName = cat.name[lang] || cat.name.en;
  const scoreText = pb ? pb.score : '—';
  const favActiveClass = isFav ? 'active' : '';

  const actionLabel = isPlayable ? (lang === 'vi' ? 'Chơi ngay' : 'Play') : (lang === 'vi' ? 'Sắp mở' : 'Blueprint');
  const actionBtnClass = isPlayable ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm opacity-75';

  return `
    <div class="game-card" data-game-id="${game.id}">
      <div class="game-card-top">
        <div class="game-emblem-box" style="background: ${cat.softBg}; color: ${cat.color};">
          ${gameEmblem(game.id, cat.color, 36)}
        </div>
        <button class="fav-btn ${favActiveClass}" data-fav-game="${game.id}" aria-label="Favorite">
          ${isFav ? icon('heart-filled', 18, 'text-rose-500') : icon('heart', 18, 'text-muted')}
        </button>
      </div>

      <div class="game-card-body">
        <div class="game-card-tags">
          <span class="cat-badge" style="background: ${cat.softBg}; color: ${cat.color};">
            ${catName}
          </span>
          <span class="duration-pill">
            ${icon('clock', 12)} ~${game.estimatedMin} min
          </span>
        </div>
        <h3 class="game-card-title">${gameName}</h3>
        <p class="game-card-sub">${gameSub}</p>
      </div>

      <div class="game-card-footer">
        <div class="game-card-pb">
          <span class="text-muted block text-xs">${lang === 'vi' ? 'Kỷ lục' : 'Best'}</span>
          <span class="font-bold text-primary tabular-nums">${scoreText}</span>
        </div>
        <button class="${actionBtnClass}" data-play-game="${game.id}">
          ${isPlayable ? icon('play', 14) : icon('lock', 14)}
          <span>${actionLabel}</span>
        </button>
      </div>
    </div>
  `;
}
