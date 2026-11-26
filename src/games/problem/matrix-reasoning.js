import { BaseGame } from '../base-game.js';

/**
 * MatrixReasoningGame — 3x3 Abstract 3x3 pattern visual matrix reasoning (#14)
 * 90s timer, bottom-right cell (2,2) is ? with 2x2 choice grid.
 */
export class MatrixReasoningGame extends BaseGame {
  constructor(container, callbacks = {}, options = {}) {
    super(container, callbacks, options);
    this.duration = 90;
    this.timeLeft = this.duration;
    this.score = 0;
    this.correctCount = 0;
    this.totalAnswered = 0;
    this.streak = 0;
    this.timerInterval = null;
    this.currentPuzzle = null;
  }

  initialize() {
    const lang = this.options.lang;
    const titleText = lang === 'vi' ? 'Suy Luận Ma Trận' : 'Matrix Reasoning';
    const timeText = lang === 'vi' ? 'Thời gian' : 'Time';
    const scoreText = lang === 'vi' ? 'Điểm' : 'Score';

    this.container.innerHTML = `
      <div class="game-container matrix-reasoning-game animate-fade-in" style="display: flex; flex-direction: column; height: 100%; max-width: 600px; margin: 0 auto; padding: 16px; font-family: inherit;">
        <div class="game-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; background: rgba(255,255,255,0.05); padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
          <div>
            <h2 style="margin: 0; font-size: 1.2rem; font-weight: 700; color: var(--color-text, #fff);">${titleText}</h2>
            <div style="font-size: 0.85rem; color: var(--color-text-muted, #aaa); margin-top: 2px;">Streak: <span id="mr-streak">0</span></div>
          </div>
          <div style="display: flex; gap: 16px; text-align: right;">
            <div>
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted, #aaa);">${timeText}</div>
              <div id="mr-timer" style="font-size: 1.1rem; font-weight: 700; color: var(--color-primary, #6366f1); font-tabular-nums;">90s</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted, #aaa);">${scoreText}</div>
              <div id="mr-score" style="font-size: 1.1rem; font-weight: 700; color: var(--color-accent, #10b981);">0</div>
            </div>
          </div>
        </div>

        <div class="game-main" style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 16px;">
          <div style="font-size: 0.9rem; font-weight: 600; color: var(--color-text-muted, #cbd5e1); text-align: center;">
            ${lang === 'vi' ? 'Xác định ô trống còn thiếu ở góc dưới bên phải:' : 'Identify the missing cell in the bottom-right:'}
          </div>

          <!-- 3x3 Matrix Board -->
          <div id="mr-matrix" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; background: rgba(0,0,0,0.25); padding: 12px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); width: 280px; height: 280px; max-width: 100%;">
            <!-- Dynamically populated 9 cells -->
          </div>

          <!-- 2x2 Choice Grid -->
          <div style="width: 100%; max-width: 320px;">
            <div style="font-size: 0.8rem; font-weight: 600; color: var(--color-text-muted, #94a3b8); margin-bottom: 6px; text-align: center;">
              ${lang === 'vi' ? 'Chọn đáp án đúng:' : 'Select the correct choice:'}
            </div>
            <div id="mr-options" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
              <!-- Dynamically populated -->
            </div>
          </div>
        </div>
      </div>
    `;

    this.timerEl = this.container.querySelector('#mr-timer');
    this.scoreEl = this.container.querySelector('#mr-score');
    this.streakEl = this.container.querySelector('#mr-streak');
    this.matrixContainer = this.container.querySelector('#mr-matrix');
    this.optionsContainer = this.container.querySelector('#mr-options');

    this.boundHandleOptionClick = (e) => {
      const btn = e.target.closest('.mr-option-btn');
      if (!btn || this.status !== 'running') return;
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      this.handleInput({ type: 'select', index: idx });
    };

    this.optionsContainer.addEventListener('click', this.boundHandleOptionClick);
  }

  start() {
    super.start();
    this.timeLeft = this.duration;
    this.score = 0;
    this.correctCount = 0;
    this.totalAnswered = 0;
    this.streak = 0;
    this.nextPuzzle();

    this.timerInterval = setInterval(() => {
      if (this.status !== 'running') return;
      this.timeLeft--;
      if (this.timerEl) this.timerEl.textContent = `${this.timeLeft}s`;
      if (this.timeLeft <= 0) {
        this.end();
      }
    }, 1000);
  }

  pause() {
    super.pause();
  }

  resume() {
    super.resume();
  }

  nextPuzzle() {
    this.currentPuzzle = this.generatePuzzle();
    this.render();
  }

  generatePuzzle() {
    const shapes = ['circle', 'triangle', 'square'];
    const styles = ['solid', 'striped', 'outline'];
    const counts = [1, 2, 3];

    // Build a Latin square base for shapes, styles, counts
    // We want a 3x3 matrix where each row & col has distinct shapes, styles, counts
    const shapePerm = [0, 1, 2];
    // Shuffle shapePerm
    for (let i = shapePerm.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shapePerm[i], shapePerm[j]] = [shapePerm[j], shapePerm[i]];
    }

    const matrix = [];
    for (let r = 0; r < 3; r++) {
      const row = [];
      for (let c = 0; c < 3; c++) {
        const sIdx = (shapePerm[r] + c) % 3;
        const styleIdx = (r + c) % 3;
        const countIdx = (r * 2 + c) % 3;
        row.push({
          shape: shapes[sIdx],
          style: styles[styleIdx],
          count: counts[countIdx]
        });
      }
      matrix.push(row);
    }

    const correctCell = matrix[2][2];

    // Generate 3 distractors
    const distractors = [];
    while (distractors.length < 3) {
      const dShape = shapes[Math.floor(Math.random() * shapes.length)];
      const dStyle = styles[Math.floor(Math.random() * styles.length)];
      const dCount = counts[Math.floor(Math.random() * counts.length)];

      if (dShape === correctCell.shape && dStyle === correctCell.style && dCount === correctCell.count) continue;

      const candidate = { shape: dShape, style: dStyle, count: dCount };
      if (!distractors.some(d => d.shape === candidate.shape && d.style === candidate.style && d.count === candidate.count)) {
        distractors.push(candidate);
      }
    }

    const optionsList = [correctCell, ...distractors];
    for (let i = optionsList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [optionsList[i], optionsList[j]] = [optionsList[j], optionsList[i]];
    }

    const correctIndex = optionsList.findIndex(o => o.shape === correctCell.shape && o.style === correctCell.style && o.count === correctCell.count);

    return {
      matrix,
      correctCell,
      options: optionsList,
      correctIndex
    };
  }

  renderCellContent(item) {
    if (!item) return '';
    const { shape, style, count } = item;
    const fillColor = style === 'solid' ? 'var(--color-primary, #6366f1)' : (style === 'striped' ? 'url(#stripePattern)' : 'none');
    const strokeColor = 'var(--color-primary, #6366f1)';
    const strokeWidth = 2.5;

    let path = '';
    if (shape === 'circle') {
      path = `<circle cx="35" cy="35" r="18" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`;
    } else if (shape === 'triangle') {
      path = `<polygon points="35,14 54,48 16,48" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round" />`;
    } else if (shape === 'square') {
      path = `<rect x="18" y="18" width="34" height="34" rx="4" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`;
    }

    // Count dots or mini shapes inside
    let badges = '';
    if (count > 1) {
      const coords = count === 2 ? [[25, 35], [45, 35]] : [[22, 28], [48, 28], [35, 48]];
      badges = coords.map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="4" fill="${style === 'solid' ? '#fff' : strokeColor}" />`).join('');
    }

    return `
      <svg width="70" height="70" viewBox="0 0 70 70">
        <defs>
          <pattern id="stripePattern" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--color-primary, #6366f1)" stroke-width="2.5" />
          </pattern>
        </defs>
        ${path}
        ${badges}
      </svg>
    `;
  }

  render() {
    if (!this.currentPuzzle) return;

    if (this.scoreEl) this.scoreEl.textContent = this.score;
    if (this.streakEl) this.streakEl.textContent = this.streak;

    // Render 3x3 matrix
    let matrixHtml = '';
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const isMissing = (r === 2 && c === 2);
        if (isMissing) {
          matrixHtml += `
            <div style="background: rgba(99, 102, 241, 0.15); border: 2px dashed var(--color-primary, #6366f1); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 1.5rem; font-weight: 800; color: var(--color-primary, #6366f1);">?</span>
            </div>
          `;
        } else {
          matrixHtml += `
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
              ${this.renderCellContent(this.currentPuzzle.matrix[r][c])}
            </div>
          `;
        }
      }
    }
    this.matrixContainer.innerHTML = matrixHtml;

    // Render 2x2 options
    let optHtml = '';
    this.currentPuzzle.options.forEach((opt, idx) => {
      optHtml += `
        <button type="button" class="mr-option-btn" data-index="${idx}" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; padding: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease;">
          ${this.renderCellContent(opt)}
        </button>
      `;
    });
    this.optionsContainer.innerHTML = optHtml;
  }

  handleInput(input) {
    if (this.status !== 'running' || !input || input.type !== 'select') return;

    this.totalAnswered++;
    const isCorrect = input.index === this.currentPuzzle.correctIndex;
    const buttons = this.optionsContainer.querySelectorAll('.mr-option-btn');
    const clickedBtn = buttons[input.index];

    if (isCorrect) {
      this.correctCount++;
      this.streak++;
      const bonus = Math.min(this.streak * 5, 30);
      this.score += 60 + bonus;
      if (this.callbacks.audio && typeof this.callbacks.audio.correct === 'function') {
        this.callbacks.audio.correct();
      }
      if (clickedBtn) {
        clickedBtn.style.background = 'rgba(16, 185, 129, 0.25)';
        clickedBtn.style.borderColor = '#10b981';
      }
    } else {
      this.streak = 0;
      if (this.callbacks.audio && typeof this.callbacks.audio.wrong === 'function') {
        this.callbacks.audio.wrong();
      }
      if (clickedBtn) {
        clickedBtn.style.background = 'rgba(239, 68, 68, 0.25)';
        clickedBtn.style.borderColor = '#ef4444';
      }
      const correctBtn = buttons[this.currentPuzzle.correctIndex];
      if (correctBtn) {
        correctBtn.style.background = 'rgba(16, 185, 129, 0.2)';
        correctBtn.style.borderColor = '#10b981';
      }
    }

    if (this.callbacks.onScoreUpdate) {
      const accuracy = this.totalAnswered > 0 ? Math.round((this.correctCount / this.totalAnswered) * 100) : 100;
      this.callbacks.onScoreUpdate({ score: this.score, accuracy });
    }

    setTimeout(() => {
      if (this.status === 'running') {
        this.nextPuzzle();
      }
    }, 450);
  }

  update(dt) {}

  calculateScore() {
    const accuracy = this.totalAnswered > 0 ? Math.round((this.correctCount / this.totalAnswered) * 100) : (this.correctCount > 0 ? 100 : 0);
    return {
      score: this.score,
      accuracy,
      correctCount: this.correctCount,
      totalAnswered: this.totalAnswered
    };
  }

  destroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.optionsContainer && this.boundHandleOptionClick) {
      this.optionsContainer.removeEventListener('click', this.boundHandleOptionClick);
    }
    super.destroy();
  }
}
