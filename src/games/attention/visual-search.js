import { BaseGame } from '../base-game.js';

export class VisualSearchGame extends BaseGame {
  constructor(container, callbacks = {}, options = {}) {
    super(container, callbacks, options);

    const diff = this.options.difficulty || 'beginner';
    if (diff === 'beginner' || diff === 'easy') {
      this.gridSize = 4; // 4x4 = 16 items
    } else if (diff === 'intermediate' || diff === 'advanced') {
      this.gridSize = 5; // 5x5 = 25 items
    } else {
      this.gridSize = 6; // 6x6 = 36 items
    }

    this.timeLeft = 60;
    this.score = 0;
    this.foundCount = 0;
    this.mistakes = 0;
    this.accuracy = 100;
    this.reactionTimes = [];

    this.targetSpecimen = null; // { shape, color, rotation }
    this.items = [];
    this.timer = null;
    this.roundStartTime = 0;
  }

  initialize() {
    this.renderShell();
    this.nextLevel();
    this.startCountdownTimer();
  }

  renderShell() {
    const lang = this.options.lang;
    this.container.innerHTML = `
      <div class="nf-game-shell visual-search-game" style="max-width: 440px; margin: 0 auto; text-align: center;">
        <div class="nf-status-pills" style="justify-content: center; margin-bottom: 8px;">
          <div class="nf-pill">Time: <span id="vs-time">${this.timeLeft}</span>s</div>
          <div class="nf-pill">Found: <span id="vs-found">0</span></div>
          <div class="nf-pill">Score: <span id="vs-score">0</span></div>
        </div>

        <div class="nf-timer-bar" style="margin: 8px 0 12px 0;">
          <div class="nf-timer-fill" id="vs-timer-fill" style="width: 100%;"></div>
        </div>

        <div class="nf-prompt-card" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; margin-bottom: 14px; background: var(--bg-surface); border: 2px solid var(--border-strong, #cbd5e1); border-radius: 12px;">
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-secondary);">
            ${lang === 'vi' ? 'MỤC TIÊU CẦN TÌM' : 'TARGET SPECIMEN'}
          </div>
          <div id="vs-target-specimen-box" style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: var(--bg-canvas, #f8fafc); border-radius: 8px; border: 2px solid var(--brand-primary);"></div>
        </div>

        <div id="vs-grid" style="display: grid; grid-template-columns: repeat(${this.gridSize}, 1fr); gap: 6px; max-width: 400px; margin: 0 auto;"></div>
      </div>
    `;
  }

  startCountdownTimer() {
    this.timer = setInterval(() => {
      if (this.status !== 'running') return;
      this.timeLeft--;
      const timeEl = this.container.querySelector('#vs-time');
      const timerFill = this.container.querySelector('#vs-timer-fill');
      if (timeEl) timeEl.textContent = this.timeLeft;
      if (timerFill) timerFill.style.width = `${(this.timeLeft / 60) * 100}%`;

      if (this.timeLeft <= 0) {
        this.end();
      }
    }, 1000);
  }

  nextLevel() {
    if (this.status === 'ended') return;
    this.roundStartTime = performance.now();

    const colors = [
      { hex: '#10B981', name: 'emerald' },
      { hex: '#6366F1', name: 'indigo' },
      { hex: '#F59E0B', name: 'amber' },
      { hex: '#F43F5E', name: 'rose' }
    ];

    const shapes = ['ring', 'L-glyph', 'T-glyph'];
    const rotations = [0, 90, 180, 270];

    const targetColor = colors[Math.floor(Math.random() * colors.length)];
    const targetShape = shapes[Math.floor(Math.random() * shapes.length)];
    const targetRotation = rotations[Math.floor(Math.random() * rotations.length)];

    this.targetSpecimen = { shape: targetShape, color: targetColor.hex, rotation: targetRotation };

    // Render target specimen box
    const specimenBox = this.container.querySelector('#vs-target-specimen-box');
    if (specimenBox) {
      specimenBox.innerHTML = this.renderItemSvg(targetShape, targetColor.hex, targetRotation);
    }

    // Generate items for grid
    const totalCells = this.gridSize * this.gridSize;
    const pool = [];

    // Exactly 1 matching target
    pool.push({ ...this.targetSpecimen, isTarget: true });

    // N-1 distractors (different rotation or slightly modified shape/color)
    while (pool.length < totalCells) {
      const dColor = Math.random() < 0.6 ? targetColor.hex : colors[Math.floor(Math.random() * colors.length)].hex;
      const dShape = Math.random() < 0.7 ? targetShape : shapes[Math.floor(Math.random() * shapes.length)];
      const dRot = rotations[Math.floor(Math.random() * rotations.length)];

      // Ensure it's not an exact match to target
      if (dColor === targetColor.hex && dShape === targetShape && dRot === targetRotation) {
        continue;
      }

      pool.push({ shape: dShape, color: dColor, rotation: dRot, isTarget: false });
    }

    pool.sort(() => Math.random() - 0.5);
    this.items = pool;

    const gridEl = this.container.querySelector('#vs-grid');
    if (!gridEl) return;
    gridEl.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
    gridEl.innerHTML = '';

    this.items.forEach((item, idx) => {
      const btn = document.createElement('button');
      btn.className = 'vs-item';
      btn.dataset.index = idx;
      btn.setAttribute('aria-label', `Item ${idx + 1}`);
      btn.style.cssText = `
        aspect-ratio: 1;
        background: var(--bg-surface);
        border: 2px solid var(--border-strong, #cbd5e1);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.15s ease, background 0.15s ease;
      `;
      btn.innerHTML = this.renderItemSvg(item.shape, item.color, item.rotation);
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.handleItemTap(idx);
      });
      gridEl.appendChild(btn);
    });
  }

  renderItemSvg(shape, hexColor, rotation) {
    let inner = '';
    if (shape === 'ring') {
      inner = `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="${hexColor}" stroke-width="3"><circle cx="12" cy="12" r="8"/><path d="M12 4v4"/></svg>`; // gap pointing UP
    } else if (shape === 'L-glyph') {
      inner = `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="${hexColor}" stroke-width="3" stroke-linecap="round"><path d="M7 4v13h10"/></svg>`;
    } else {
      inner = `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="${hexColor}" stroke-width="3" stroke-linecap="round"><path d="M12 4v16M5 4h14"/></svg>`;
    }

    return `<div style="transform: rotate(${rotation}deg); display: flex; align-items: center; justify-content: center;">${inner}</div>`;
  }

  handleItemTap(index) {
    if (this.status !== 'running') return;
    const item = this.items[index];
    const reactionTime = performance.now() - this.roundStartTime;
    const btn = this.container.querySelector(`.vs-item[data-index="${index}"]`);

    if (item.isTarget) {
      // Correct!
      this.foundCount++;
      this.reactionTimes.push(reactionTime);
      const earnedPts = 30 + Math.max(0, Math.round(30 - reactionTime / 40));
      this.score += earnedPts;
      if (this.callbacks.audio?.correct) this.callbacks.audio.correct(this.foundCount);

      if (btn) {
        btn.style.background = 'rgba(16, 185, 129, 0.2)';
        btn.style.borderColor = 'var(--success, #10B981)';
      }

      this.updateHUD();

      // Slightly increase grid density on higher levels
      if (this.foundCount % 3 === 0 && this.gridSize < 6) {
        this.gridSize++;
      }

      setTimeout(() => {
        if (this.status !== 'running') return;
        this.nextLevel();
      }, 400);
    } else {
      // Wrong distractor tap
      this.mistakes++;
      if (this.callbacks.audio?.wrong) this.callbacks.audio.wrong();
      if (btn) {
        btn.style.background = 'rgba(239, 68, 68, 0.2)';
        btn.style.borderColor = 'var(--danger, #EF4444)';
        setTimeout(() => {
          btn.style.background = 'var(--bg-surface)';
          btn.style.borderColor = 'var(--border-strong, #cbd5e1)';
        }, 300);
      }
      this.updateHUD();
    }
  }

  handleInput(input) {
    if (typeof input === 'number' && input >= 0 && input < this.items.length) {
      this.handleItemTap(input);
    }
  }

  update(dt) {}

  render() {
    this.updateHUD();
  }

  updateHUD() {
    const foundEl = this.container.querySelector('#vs-found');
    const scoreEl = this.container.querySelector('#vs-score');
    if (foundEl) foundEl.textContent = this.foundCount;
    if (scoreEl) scoreEl.textContent = this.score;

    if (this.callbacks.onScoreUpdate) {
      this.callbacks.onScoreUpdate({ score: this.score, accuracy: this.getAccuracy() });
    }
  }

  getAccuracy() {
    const total = this.foundCount + this.mistakes;
    if (total === 0) return 100;
    return Math.round((this.foundCount / total) * 100);
  }

  calculateScore() {
    const avgReaction = this.reactionTimes.length > 0
      ? Math.round(this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length)
      : 0;

    return {
      score: this.score,
      accuracy: this.getAccuracy(),
      reactionMs: avgReaction,
      mistakes: this.mistakes
    };
  }

  start() {
    super.start();
  }

  pause() {
    super.pause();
    if (this.timer) clearInterval(this.timer);
  }

  resume() {
    super.resume();
  }

  end() {
    if (this.timer) clearInterval(this.timer);
    super.end();
  }

  destroy() {
    if (this.timer) clearInterval(this.timer);
    super.destroy();
  }
}
