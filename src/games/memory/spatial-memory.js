import { BaseGame } from '../base-game.js';

export class SpatialMemoryGame extends BaseGame {
  constructor(container, callbacks = {}, options = {}) {
    super(container, callbacks, options);

    const diff = this.options.difficulty || 'beginner';
    if (diff === 'beginner' || diff === 'easy') {
      this.gridSize = 3; // 3x3
      this.targetCount = 3;
    } else if (diff === 'intermediate') {
      this.gridSize = 4; // 4x4
      this.targetCount = 5;
    } else if (diff === 'advanced') {
      this.gridSize = 4; // 4x4
      this.targetCount = 6;
    } else {
      this.gridSize = 5; // 5x5
      this.targetCount = 8;
    }

    this.round = 1;
    this.maxRounds = 10;
    this.score = 0;
    this.lives = 3;
    this.mistakes = 0;
    this.correctSelections = 0;
    this.reactionTimes = [];

    this.activeTargets = new Set();
    this.playerSelections = new Set();
    this.phase = 'memorize'; // 'memorize' | 'recall' | 'feedback'
    this.timer = null;
    this.roundStartTime = 0;
  }

  initialize() {
    this.renderShell();
    this.startRound();
  }

  renderShell() {
    const lang = this.options.lang;
    this.container.innerHTML = `
      <div class="nf-game-shell spatial-memory-game">
        <div class="nf-status-pills">
          <div class="nf-pill"><span id="sm-round-label">${lang === 'vi' ? 'Vòng' : 'Round'}</span>: <span id="sm-round">${this.round}</span>/${this.maxRounds}</div>
          <div class="nf-pill">Score: <span id="sm-score">${this.score}</span></div>
          <div class="nf-pill">Lives: <span id="sm-lives">${'❤️'.repeat(this.lives)}</span></div>
        </div>

        <div class="nf-prompt-card" style="text-align: center; padding: 16px; margin: 12px 0;">
          <div id="sm-instruction" style="font-size: 0.95rem; font-weight: 600; color: var(--brand-primary);">
            ${lang === 'vi' ? 'Quan sát và ghi nhớ các ô sáng...' : 'Observe and memorize the highlighted cells...'}
          </div>
        </div>

        <div class="nf-grid-board grid-${this.gridSize}x${this.gridSize}" id="sm-grid" style="display: grid; grid-template-columns: repeat(${this.gridSize}, 1fr); gap: 10px; max-width: 360px; margin: 0 auto; aspect-ratio: 1;">
        </div>
      </div>
    `;

    const gridEl = this.container.querySelector('#sm-grid');
    const totalCells = this.gridSize * this.gridSize;

    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement('button');
      cell.className = 'nf-cell sm-cell';
      cell.dataset.index = i;
      cell.setAttribute('aria-label', `Cell ${i + 1}`);
      cell.style.cssText = `
        background: var(--bg-surface);
        border: 2px solid var(--border-strong, #cbd5e1);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        aspect-ratio: 1;
      `;
      cell.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.handleCellTap(i);
      });
      gridEl.appendChild(cell);
    }
  }

  start() {
    super.start();
  }

  pause() {
    super.pause();
    if (this.timer) clearTimeout(this.timer);
  }

  resume() {
    super.resume();
  }

  startRound() {
    if (this.status === 'ended') return;
    this.phase = 'memorize';
    this.activeTargets.clear();
    this.playerSelections.clear();

    const totalCells = this.gridSize * this.gridSize;
    const actualTargets = Math.min(this.targetCount, totalCells - 1);

    while (this.activeTargets.size < actualTargets) {
      const idx = Math.floor(Math.random() * totalCells);
      this.activeTargets.add(idx);
    }

    const cells = this.container.querySelectorAll('.sm-cell');
    cells.forEach((cell, idx) => {
      cell.className = 'nf-cell sm-cell';
      cell.style.background = 'var(--bg-surface)';
      cell.style.borderColor = 'var(--border-strong, #cbd5e1)';
      if (this.activeTargets.has(idx)) {
        cell.style.background = '#6366F1'; // --cat-memory
        cell.style.borderColor = '#4F46E5';
        cell.style.boxShadow = '0 0 16px rgba(99, 102, 241, 0.6)';
      }
    });

    const instruction = this.container.querySelector('#sm-instruction');
    const lang = this.options.lang;
    if (instruction) {
      instruction.textContent = lang === 'vi' ? 'Ghi nhớ vị trí các ô sáng...' : 'Memorize highlighted positions...';
      instruction.style.color = 'var(--brand-primary)';
    }

    this.updateHUD();

    // Highlight duration: 1300ms + targetCount * 100ms
    const memorizeTime = 1300 + actualTargets * 100;

    this.timer = setTimeout(() => {
      if (this.status !== 'running') return;
      this.enterRecallPhase();
    }, memorizeTime);
  }

  enterRecallPhase() {
    this.phase = 'recall';
    this.roundStartTime = performance.now();

    const cells = this.container.querySelectorAll('.sm-cell');
    cells.forEach((cell) => {
      cell.style.background = 'var(--bg-surface)';
      cell.style.borderColor = 'var(--border-strong, #cbd5e1)';
      cell.style.boxShadow = 'none';
    });

    const instruction = this.container.querySelector('#sm-instruction');
    const lang = this.options.lang;
    if (instruction) {
      instruction.textContent = lang === 'vi' ? `Chạm vào ${this.activeTargets.size} ô bạn vừa nhớ!` : `Tap the ${this.activeTargets.size} cells you memorized!`;
      instruction.style.color = 'var(--text-primary)';
    }
  }

  handleCellTap(index) {
    if (this.status !== 'running' || this.phase !== 'recall') return;
    if (this.playerSelections.has(index)) return;

    const cell = this.container.querySelector(`.sm-cell[data-index="${index}"]`);
    if (!cell) return;

    this.playerSelections.add(index);

    if (this.activeTargets.has(index)) {
      // Correct tap
      cell.style.background = 'var(--success, #10B981)';
      cell.style.borderColor = '#059669';
      if (this.callbacks.audio?.tap) this.callbacks.audio.tap();

      if (this.playerSelections.size === this.activeTargets.size) {
        // Round completed successfully!
        const reactionTime = performance.now() - this.roundStartTime;
        this.reactionTimes.push(reactionTime);
        this.correctSelections++;

        const earnedPts = 20 * this.activeTargets.size;
        this.score += earnedPts;
        if (this.callbacks.audio?.correct) this.callbacks.audio.correct(this.correctSelections);

        const instruction = this.container.querySelector('#sm-instruction');
        const lang = this.options.lang;
        if (instruction) {
          instruction.textContent = lang === 'vi' ? `Hoàn hảo! (+${earnedPts} điểm)` : `Perfect! (+${earnedPts} pts)`;
          instruction.style.color = 'var(--success, #10B981)';
        }

        this.phase = 'feedback';

        // Expand grid or difficulty slightly if possible
        if (this.round % 3 === 0 && this.gridSize < 5) {
          this.gridSize++;
        }
        if (this.targetCount < 10) {
          this.targetCount++;
        }

        this.timer = setTimeout(() => {
          if (this.status !== 'running') return;
          this.round++;
          if (this.round > this.maxRounds) {
            this.end();
          } else {
            this.renderShell();
            this.startRound();
          }
        }, 1400);
      }
    } else {
      // Wrong decoy tap
      this.mistakes++;
      this.lives--;
      cell.style.background = 'var(--danger, #EF4444)';
      cell.style.borderColor = '#DC2626';
      if (this.callbacks.audio?.wrong) this.callbacks.audio.wrong();

      if (this.lives <= 0) {
        this.phase = 'feedback';
        this.timer = setTimeout(() => this.end(), 1200);
      } else {
        // Reveal correct ones and restart round
        this.phase = 'feedback';
        const cells = this.container.querySelectorAll('.sm-cell');
        this.activeTargets.forEach(tIdx => {
          if (cells[tIdx]) {
            cells[tIdx].style.background = '#6366F1';
          }
        });

        this.timer = setTimeout(() => {
          if (this.status !== 'running') return;
          this.round++;
          if (this.round > this.maxRounds) {
            this.end();
          } else {
            this.renderShell();
            this.startRound();
          }
        }, 1600);
      }
    }

    this.updateHUD();
  }

  handleInput(input) {
    if (typeof input === 'number' && input >= 0 && input < this.gridSize * this.gridSize) {
      this.handleCellTap(input);
    }
  }

  update(dt) {}

  render() {
    this.updateHUD();
  }

  updateHUD() {
    const roundEl = this.container.querySelector('#sm-round');
    const scoreEl = this.container.querySelector('#sm-score');
    const livesEl = this.container.querySelector('#sm-lives');

    if (roundEl) roundEl.textContent = this.round;
    if (scoreEl) scoreEl.textContent = this.score;
    if (livesEl) livesEl.textContent = '❤️'.repeat(Math.max(0, this.lives));

    if (this.callbacks.onScoreUpdate) {
      this.callbacks.onScoreUpdate({ score: this.score, accuracy: this.getAccuracy() });
    }
  }

  getAccuracy() {
    const total = this.correctSelections + this.mistakes;
    if (total === 0) return 100;
    return Math.round((this.correctSelections / total) * 100);
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

  end() {
    if (this.timer) clearTimeout(this.timer);
    super.end();
  }

  destroy() {
    if (this.timer) clearTimeout(this.timer);
    super.destroy();
  }
}
