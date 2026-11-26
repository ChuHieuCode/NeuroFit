import { storage } from '../../core/storage.js';
import { audio } from '../../core/audio.js';
import { i18n } from '../../core/i18n.js';
import { router } from '../../core/router.js';
import { difficultyEngine } from '../../core/difficulty.js';
import { GAMES_CATALOG } from '../../data/games-catalog.js';
import { CATEGORIES } from '../../data/categories.js';
import { createGameInstance, isGameImplemented } from '../../games/registry.js';
import { gameEmblem } from '../../ui/icons.js';
import { launchConfetti } from '../components/toast-confetti.js';

export async function renderArenaView(rootEl, params, query) {
  const gameId = params.gameId || 'sequence-recall';
  const gameMeta = GAMES_CATALOG.find(g => g.id === gameId) || GAMES_CATALOG[0];
  const cat = CATEGORIES.find(c => c.id === gameMeta.categoryId) || CATEGORIES[0];
  const isVi = i18n.getLang() === 'vi';
  const tier = difficultyEngine.getTier(gameId);
  const isImplementedGame = isGameImplemented(gameId);
  const stats = await storage.getStats();
  const personalBest = stats.personalBests?.[gameId]?.score ?? '—';

  // Remove any existing arena overlay first
  const existingOverlay = document.getElementById('arena-overlay');
  if (existingOverlay) existingOverlay.remove();

  // Mount distraction-free full viewport arena overlay directly onto document.body
  const overlay = document.createElement('div');
  overlay.id = 'arena-overlay';
  overlay.className = 'arena-overlay';

  const instructionsArray = i18n.pick(gameMeta.instructions);
  const instructionsHTML = Array.isArray(instructionsArray) 
    ? instructionsArray.map(step => `<li>• ${step}</li>`).join('')
    : `<li>• ${instructionsArray || 'Focus and complete the exercise.'}</li>`;

  overlay.innerHTML = `
    <!-- Screen 1: Instructions / Start Screen -->
    <div class="arena-screen active" id="arena-start-screen">
      <div class="arena-start-card animate-scale-in">
        <div class="arena-emblem-lg" style="background: ${cat.softBg}; color: ${cat.color};">
          ${gameEmblem(gameMeta.id, cat.color, 44)}
        </div>
        <span class="category-pill-sm" style="color: ${cat.color}; background: ${cat.softBg};">${i18n.pick(cat.name)}</span>
        <h2>${i18n.pick(gameMeta.name)}</h2>
        <p>${i18n.pick(gameMeta.description)}</p>

        <div class="arena-tier-badge" style="display: flex; gap: 12px; justify-content: center; align-items: center; margin: 16px 0;">
          <span>⚡ ${isVi ? 'Độ khó:' : 'Tier:'} <strong>${tier.toUpperCase()}</strong></span>
          <span>🏆 ${isVi ? 'Kỷ lục:' : 'PB:'} <strong class="tabular-nums">${personalBest}</strong></span>
        </div>

        <div class="arena-instructions-list">
          <h4>${isVi ? 'Hướng dẫn chơi:' : 'How to Play:'}</h4>
          <ul>
            ${instructionsHTML}
          </ul>
        </div>

        <div class="arena-start-actions">
          ${isImplementedGame ? `
            <button class="btn btn-primary btn-lg" id="start-game-action-btn">
              🚀 ${isVi ? 'Bắt đầu trò chơi' : 'Start Game'}
            </button>
          ` : `
            <div class="phase4-preview-notice">
              <span class="badge-pill-primary">Phase 4 Scheduled — Architecture Ready</span>
              <p>${isVi ? 'Trò chơi này đã sẵn sàng kiến trúc và sẽ ra mắt hoàn chỉnh ở Phase 4. Bạn có thể trải nghiệm ngay trò chơi mẫu Sequence Recall.' : 'This game architecture is ready and scheduled for Phase 4. You can play our fully polished reference game Sequence Recall right now!'}</p>
              <a href="#/play/sequence-recall" class="btn btn-primary" id="fallback-seq-btn">🎮 Chơi thử Sequence Recall</a>
            </div>
          `}
          <button class="btn btn-ghost" id="arena-back-lib-btn">← ${isVi ? 'Quay lại Thư viện' : 'Back to Library'}</button>
        </div>
      </div>
    </div>

    <!-- Screen 2: 3-2-1 Countdown -->
    <div class="arena-screen" id="arena-countdown-screen">
      <div class="countdown-number" id="countdown-num">3</div>
    </div>

    <!-- Screen 3: Active Gameplay HUD -->
    <div class="arena-screen" id="arena-gameplay-screen">
      <div class="arena-top-hud">
        <button class="arena-hud-btn" id="arena-quit-btn" title="Quit">✕</button>
        <div class="arena-hud-stats">
          <div class="ah-pill">Score: <span id="hud-score">0</span></div>
          <div class="ah-pill">Accuracy: <span id="hud-accuracy">100</span>%</div>
        </div>
        <button class="arena-hud-btn" id="arena-pause-btn" title="Pause">⏸</button>
      </div>
      <div class="arena-game-canvas-container" id="arena-canvas-container">
        <!-- Game DOM/Canvas mounted here -->
      </div>
    </div>

    <!-- Screen 4: Game-Over Summary -->
    <div class="arena-screen" id="arena-summary-screen">
      <div class="arena-summary-card animate-scale-in">
        <div class="summary-icon">🏆</div>
        <div id="summary-pb-banner"></div>
        <h2>${isVi ? 'Hoàn thành lượt chơi!' : 'Session Complete!'}</h2>
        <div id="summary-adaptive-badge"></div>

        <div class="summary-stats-grid">
          <div class="ss-box">
            <span class="ss-val tabular-nums" id="sum-score">0</span>
            <span class="ss-label">${isVi ? 'Điểm số' : 'Score'}</span>
          </div>
          <div class="ss-box">
            <span class="ss-val tabular-nums" id="sum-accuracy">100%</span>
            <span class="ss-label">${isVi ? 'Độ chính xác' : 'Accuracy'}</span>
          </div>
          <div class="ss-box">
            <span class="ss-val tabular-nums" id="sum-reaction">0 ms</span>
            <span class="ss-label">${isVi ? 'Phản ứng TB' : 'Avg Reaction'}</span>
          </div>
          <div class="ss-box">
            <span class="ss-val tabular-nums" id="sum-xp">+50 XP</span>
            <span class="ss-label">${isVi ? 'Điểm kinh nghiệm' : 'XP Earned'}</span>
          </div>
        </div>

        <div class="summary-actions" id="summary-actions-container">
          <!-- Dynamically populated CTA (Next Daily Game or Replay) -->
        </div>
      </div>
    </div>

    <!-- Pause Overlay -->
    <div class="pause-overlay" id="arena-pause-overlay" style="display: none;">
      <div class="pause-card animate-scale-in">
        <h3>⏸ ${isVi ? 'Trò chơi đang tạm dừng' : 'Game Paused'}</h3>
        <button class="btn btn-primary" id="pause-resume-btn">${isVi ? 'Tiếp tục' : 'Resume'}</button>
        <button class="btn btn-outline" id="pause-restart-btn">${isVi ? 'Chơi lại từ đầu' : 'Restart'}</button>
        <button class="btn btn-danger" id="pause-quit-btn">${isVi ? 'Thoát' : 'Quit to Library'}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Back to library handlers
  const cleanupAndNavigate = (hash) => {
    overlay.remove();
    router.navigate(hash);
  };

  overlay.querySelector('#arena-back-lib-btn').addEventListener('click', () => cleanupAndNavigate('#/library'));
  const fallbackSeqBtn = overlay.querySelector('#fallback-seq-btn');
  if (fallbackSeqBtn) {
    fallbackSeqBtn.addEventListener('click', (e) => {
      e.preventDefault();
      overlay.remove();
      router.navigate('#/play/sequence-recall');
    });
  }

  if (!isImplementedGame) return;

  let gameInstance = null;
  const startBtn = overlay.querySelector('#start-game-action-btn');
  const startScreen = overlay.querySelector('#arena-start-screen');
  const countdownScreen = overlay.querySelector('#arena-countdown-screen');
  const gameplayScreen = overlay.querySelector('#arena-gameplay-screen');
  const summaryScreen = overlay.querySelector('#arena-summary-screen');
  const pauseOverlay = overlay.querySelector('#arena-pause-overlay');
  const countdownNum = overlay.querySelector('#countdown-num');
  const canvasContainer = overlay.querySelector('#arena-canvas-container');

  startBtn.addEventListener('click', async () => {
    audio.tap();
    startScreen.classList.remove('active');
    countdownScreen.classList.add('active');

    // 3-2-1 Countdown
    for (let i = 3; i > 0; i--) {
      countdownNum.textContent = i;
      audio.countdown(false);
      await new Promise(r => setTimeout(r, 800));
    }
    countdownNum.textContent = 'GO!';
    audio.countdown(true);
    await new Promise(r => setTimeout(r, 500));

    countdownScreen.classList.remove('active');
    gameplayScreen.classList.add('active');

    // Instantiate & start game
    gameInstance = createGameInstance(gameId, canvasContainer, {
      audio,
      onScoreUpdate: (state) => {
        const scoreEl = overlay.querySelector('#hud-score');
        const accEl = overlay.querySelector('#hud-accuracy');
        if (scoreEl) scoreEl.textContent = state.score;
        if (accEl) accEl.textContent = state.accuracy;
      },
      onGameEnd: async (summary) => {
        await handleGameEnd(summary);
      }
    }, { difficulty: tier, lang: i18n.getLang(), gameMeta });

    if (gameInstance) {
      gameInstance.initialize();
      gameInstance.start();
    }
  });

  // Pause & Quit buttons
  overlay.querySelector('#arena-pause-btn').addEventListener('click', () => {
    if (gameInstance) gameInstance.pause();
    pauseOverlay.style.display = 'flex';
  });

  overlay.querySelector('#arena-quit-btn').addEventListener('click', () => {
    if (gameInstance) gameInstance.destroy();
    cleanupAndNavigate('#/library');
  });

  overlay.querySelector('#pause-resume-btn').addEventListener('click', () => {
    pauseOverlay.style.display = 'none';
    if (gameInstance) gameInstance.resume();
  });

  overlay.querySelector('#pause-restart-btn').addEventListener('click', () => {
    pauseOverlay.style.display = 'none';
    if (gameInstance) {
      gameInstance.destroy();
      gameInstance.initialize();
      gameInstance.start();
    }
  });

  overlay.querySelector('#pause-quit-btn').addEventListener('click', () => {
    if (gameInstance) gameInstance.destroy();
    cleanupAndNavigate('#/library');
  });

  async function handleGameEnd(summary) {
    if (gameInstance) gameInstance.destroy();

    const prevBest = typeof personalBest === 'number' ? personalBest : 0;
    const isNewPB = (summary.score || 0) > prevBest;

    // Persist real session via storage.saveSession(...)
    const sessionRecord = {
      id: 'sess_' + Date.now(),
      gameId,
      categoryId: gameMeta.categoryId,
      score: summary.score || 0,
      accuracy: summary.accuracy ?? 100,
      reactionTimeMs: summary.reactionMs || 450,
      mistakes: summary.mistakes || 0,
      difficulty: tier,
      completedAt: Date.now()
    };

    const res = await storage.saveSession(sessionRecord);
    const earnedXp = res?.session?.xpEarned || Math.round((summary.score || 100) / 10);

    // Populate summary screen stats
    overlay.querySelector('#sum-score').textContent = summary.score || 0;
    overlay.querySelector('#sum-accuracy').textContent = (summary.accuracy ?? 100) + '%';
    overlay.querySelector('#sum-reaction').textContent = (summary.reactionMs || 450) + ' ms';
    overlay.querySelector('#sum-xp').textContent = '+' + earnedXp + ' XP';

    // Personal Best badge
    if (isNewPB) {
      overlay.querySelector('#summary-pb-banner').innerHTML = `
        <div class="pb-celebration-pill animate-bounce">
          🏆 ${isVi ? 'Kỷ lục cá nhân mới!' : 'New Personal Best!'}
        </div>
      `;
    }

    // Adaptive Difficulty change badge if triggered
    if (res?.difficultyChange) {
      const dc = res.difficultyChange;
      const isUp = dc.newTier !== dc.oldTier; // simplified check
      overlay.querySelector('#summary-adaptive-badge').innerHTML = `
        <div class="adaptive-tier-notice">
          ${isVi ? 'Độ thích ứng:' : 'Adaptive Shift:'} <strong>${dc.newTier.toUpperCase()}</strong>
        </div>
      `;
    }

    // Daily Training workflow logic
    const actionsContainer = overlay.querySelector('#summary-actions-container');
    const isDailyParam = query.daily === '1';

    if (isDailyParam) {
      const daily = await storage.getOrCreateDailyTraining(GAMES_CATALOG);
      // Mark current game completed in daily if not already
      if (!daily.completedGameIds.includes(gameId)) {
        daily.completedGameIds.push(gameId);
        if (daily.completedGameIds.length >= daily.gameIds.length) {
          daily.completed = true;
        }
        await storage.saveDailyTraining(daily);
      }

      const nextDailyId = daily.gameIds.find(id => !daily.completedGameIds.includes(id));
      if (nextDailyId) {
        const nextMeta = GAMES_CATALOG.find(g => g.id === nextDailyId);
        actionsContainer.innerHTML = `
          <button class="btn btn-primary btn-lg" id="summary-next-daily-btn">
            ⚡ ${isVi ? 'Game hằng ngày tiếp theo' : 'Next Daily Game'} (${daily.completedGameIds.length}/${daily.gameIds.length}) →
          </button>
          <button class="btn btn-outline" id="summary-replay-btn">🔄 ${isVi ? 'Chơi lại' : 'Replay'}</button>
        `;
        overlay.querySelector('#summary-next-daily-btn').addEventListener('click', () => {
          overlay.remove();
          router.navigate(`#/play/${nextDailyId}?daily=1`);
        });
      } else {
        actionsContainer.innerHTML = `
          <div class="daily-completed-banner">
            🎉 ${isVi ? 'Hoàn thành bài tập hằng ngày! (+150 Bonus XP)' : 'Daily Workout Complete! (+150 Bonus XP)'}
          </div>
          <button class="btn btn-primary btn-lg" id="summary-daily-view-btn">
            🏠 ${isVi ? 'Xem lộ trình hằng ngày' : 'View Daily Workout'}
          </button>
        `;
        overlay.querySelector('#summary-daily-view-btn').addEventListener('click', () => cleanupAndNavigate('#/daily'));
      }
    } else {
      actionsContainer.innerHTML = `
        <button class="btn btn-primary btn-lg" id="summary-replay-btn">
          🔄 ${isVi ? 'Chơi lại' : 'Play Again'}
        </button>
        <button class="btn btn-outline" id="summary-dashboard-btn">
          🏠 ${isVi ? 'Về Tổng quan' : 'Back to Dashboard'}
        </button>
      `;
    }

    const replayBtn = overlay.querySelector('#summary-replay-btn');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        overlay.remove();
        renderArenaView(rootEl, params, query);
      });
    }

    const dashBtn = overlay.querySelector('#summary-dashboard-btn');
    if (dashBtn) {
      dashBtn.addEventListener('click', () => cleanupAndNavigate('#/dashboard'));
    }

    gameplayScreen.classList.remove('active');
    summaryScreen.classList.add('active');

    audio.celebrate();
    launchConfetti();
  }
}
