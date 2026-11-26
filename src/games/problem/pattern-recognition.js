import { BaseGame } from '../base-game.js';

/**
 * PatternRecognitionGame — Inductive visual sequence game (#13)
 * Displays a row of 4 crisp inline SVG tiles + [ ? ] and 4 option buttons.
 */
export class PatternRecognitionGame extends BaseGame {
  constructor(container, callbacks = {}, options = {}) {
    super(container, callbacks, options);
    this.duration = 75; // 75 seconds
    this.timeLeft = this.duration;
    this.score = 0;
    this.correctCount = 0;
    this.totalAnswered = 0;
    this.streak = 0;
    this.timerInterval = null;
    this.currentPuzzle = null;
    this.selectedOption = null;
  }

  initialize() {
    const lang = this.options.lang;
    const titleText = lang === 'vi' ? 'Nhận Diện Quy Luật' : 'Pattern Recognition';
    const timeText = lang === 'vi' ? 'Thời gian' : 'Time';
    const scoreText = lang === 'vi' ? 'Điểm' : 'Score';

    this.container.innerHTML = `
      <div class="game-container pattern-recognition-game animate-fade-in" style="display: flex; flex-direction: column; height: 100%; max-width: 600px; margin: 0 auto; padding: 16px; font-family: inherit;">
        <div class="game-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: rgba(255,255,255,0.05); padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
          <div>
            <h2 style="margin: 0; font-size: 1.2rem; font-weight: 700; color: var(--color-text, #fff);">${titleText}</h2>
            <div style="font-size: 0.85rem; color: var(--color-text-muted, #aaa); margin-top: 2px;">Streak: <span id="pr-streak">0</span></div>
          </div>
          <div style="display: flex; gap: 16px; text-align: right;">
            <div>
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted, #aaa);">${timeText}</div>
              <div id="pr-timer" style="font-size: 1.1rem; font-weight: 700; color: var(--color-primary, #6366f1); font-tabular-nums;">75s</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted, #aaa);">${scoreText}</div>
              <div id="pr-score" style="font-size: 1.1rem; font-weight: 700; color: var(--color-accent, #10b981);">0</div>
            </div>
          </div>
        </div>

        <div class="game-main" style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 24px;">
          <div style="font-size: 0.95rem; font-weight: 600; color: var(--color-text-muted, #cbd5e1); text-align: center;">
            ${lang === 'vi' ? 'Chọn hình tiếp theo hoàn thành chuỗi:' : 'Select the next shape in the sequence:'}
          </div>

          <!-- Sequence Row -->
          <div id="pr-sequence" style="display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; background: rgba(0,0,0,0.2); padding: 16px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); width: 100%;">
            <!-- Dynamically populated -->
          </div>

          <!-- Options Grid (2x2) -->
          <div style="width: 100%; max-width: 400px;">
            <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-muted, #94a3b8); margin-bottom: 8px; text-align: center;">
              ${lang === 'vi' ? 'Các lựa chọn:' : 'Choices:'}
            </div>
            <div id="pr-options" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
              <!-- Dynamically populated -->
            </div>
          </div>
        </div>
      </div>
    `;

    this.timerEl = this.container.querySelector('#pr-timer');
    this.scoreEl = this.container.querySelector('#pr-score');
    this.streakEl = this.container.querySelector('#pr-streak');
    this.seqContainer = this.container.querySelector('#pr-sequence');
    this.optionsContainer = this.container.querySelector('#pr-options');

    this.boundHandleOptionClick = (e) => {
      const btn = e.target.closest('.pr-option-btn');
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
    const diff = this.options.difficulty;
    const shapes = ['circle', 'triangle', 'square', 'pentagon'];
    
    // Choose primary rule: shape cycle, rotation, dot count, fill
    const rules = ['shape', 'rotation', 'dots', 'fill'];
    const primaryRule = rules[Math.floor(Math.random() * (diff === 'beginner' ? 2 : rules.length))];
    const dualRule = (diff === 'advanced' || diff === 'expert') ? rules[(rules.indexOf(primaryRule) + 1) % rules.length] : null;

    const baseShapeIdx = Math.floor(Math.random() * shapes.length);
    const baseRot = Math.floor(Math.random() * 4) * 45;
    const rotStep = Math.random() > 0.5 ? 45 : 90;
    const baseDots = Math.floor(Math.random() * 2) + 1; // 1 or 2
    const dotStep = Math.random() > 0.5 ? 1 : 2;
    const baseFill = Math.random() > 0.5 ? 'solid' : 'outline';

    const sequence = [];
    for (let i = 0; i < 4; i++) {
      const sIdx = primaryRule === 'shape' ? (baseShapeIdx + i) % shapes.length : baseShapeIdx;
      const rot = primaryRule === 'rotation' ? (baseRot + i * rotStep) % 360 : (dualRule === 'rotation' ? (baseRot + i * rotStep) % 360 : 0);
      const dots = primaryRule === 'dots' ? baseDots + i * dotStep : (dualRule === 'dots' ? baseDots + (i % 3) * dotStep : baseDots);
      const fill = primaryRule === 'fill' ? (i % 2 === 0 ? 'solid' : 'outline') : baseFill;
      sequence.push({ shape: shapes[sIdx], rotation: rot, dots, fill });
    }

    // Correct 5th item
    const nextIdx = 4;
    const correctNext = {
      shape: primaryRule === 'shape' ? (baseShapeIdx + nextIdx) % shapes.length : shapes[baseShapeIdx],
      shapeName: primaryRule === 'shape' ? shapes[(baseShapeIdx + nextIdx) % shapes.length] : shapes[baseShapeIdx],
      rotation: primaryRule === 'rotation' ? (baseRot + nextIdx * rotStep) % 360 : (dualRule === 'rotation' ? (baseRot + nextIdx * rotStep) % 360 : 0),
      dots: primaryRule === 'dots' ? baseDots + nextIdx * dotStep : (dualRule === 'dots' ? baseDots + (nextIdx % 3) * dotStep : baseDots),
      fill: primaryRule === 'fill' ? (nextIdx % 2 === 0 ? 'solid' : 'outline') : baseFill
    };
    // normalize correctNext shape field
    correctNext.shape = correctNext.shapeName || shapes[baseShapeIdx];

    // Generate 3 distinct distractors
    const distractors = [];
    while (distractors.length < 3) {
      const dShape = shapes[Math.floor(Math.random() * shapes.length)];
      const dRot = Math.floor(Math.random() * 4) * 90;
      const dDots = Math.floor(Math.random() * 4) + 1;
      const dFill = Math.random() > 0.5 ? 'solid' : 'outline';

      if (dShape === correctNext.shape && dRot === correctNext.rotation && dDots === correctNext.dots && dFill === correctNext.fill) continue;
      
      const candidate = { shape: dShape, rotation: dRot, dots: dDots, fill: dFill };
      if (!distractors.some(d => d.shape === candidate.shape && d.rotation === candidate.rotation && d.dots === candidate.dots && d.fill === candidate.fill)) {
        distractors.push(candidate);
      }
    }

    const optionsList = [correctNext, ...distractors];
    // Shuffle options
    for (let i = optionsList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [optionsList[i], optionsList[j]] = [optionsList[j], optionsList[i]];
    }

    const correctIndex = optionsList.findIndex(o => o.shape === correctNext.shape && o.rotation === correctNext.rotation && o.dots === correctNext.dots && o.fill === correctNext.fill);

    return {
      sequence,
      correctNext,
      options: optionsList,
      correctIndex
    };
  }

  renderSvgTile(item, size = 50) {
    const { shape, rotation = 0, dots = 1, fill = 'solid' } = item;
    const fillColor = fill === 'solid' ? 'var(--color-primary, #6366f1)' : 'none';
    const strokeColor = 'var(--color-primary, #6366f1)';
    const strokeWidth = 3;

    let shapePath = '';
    if (shape === 'circle') {
      shapePath = `<circle cx="25" cy="25" r="18" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`;
    } else if (shape === 'triangle') {
      shapePath = `<polygon points="25,6 44,40 6,40" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round" />`;
    } else if (shape === 'square') {
      shapePath = `<rect x="8" y="8" width="34" height="34" rx="4" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`;
    } else if (shape === 'pentagon') {
      shapePath = `<polygon points="25,6 44,19 37,41 13,41 6,19" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round" />`;
    }

    // Dots inside
    let dotsHtml = '';
    if (dots > 0) {
      const dotCoords = {
        1: [[25, 25]],
        2: [[18, 25], [32, 25]],
        3: [[25, 17], [17, 33], [33, 33]],
        4: [[17, 17], [33, 17], [17, 33], [33, 33]]
      }[Math.min(dots, 4)] || [[25, 25]];

      dotsHtml = dotCoords.map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="3.5" fill="${fill === 'solid' ? '#fff' : strokeColor}" />`).join('');
    }

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 50 50" style="transform: rotate(${rotation}deg); transition: transform 0.3s ease;">
        ${shapePath}
        ${dotsHtml}
      </svg>
    `;
  }

  render() {
    if (!this.currentPuzzle) return;

    if (this.scoreEl) this.scoreEl.textContent = this.score;
    if (this.streakEl) this.streakEl.textContent = this.streak;

    // Render sequence
    let seqHtml = '';
    this.currentPuzzle.sequence.forEach((item, idx) => {
      seqHtml += `
        <div style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center;">
          ${this.renderSvgTile(item, 48)}
        </div>
      `;
      if (idx < 3) {
        seqHtml += `<div style="color: var(--color-text-muted, #64748b); font-weight: 700; font-size: 1.2rem;">→</div>`;
      }
    });

    // Target question mark box
    seqHtml += `
      <div style="color: var(--color-text-muted, #64748b); font-weight: 700; font-size: 1.2rem;">→</div>
      <div style="background: rgba(99, 102, 241, 0.15); padding: 8px; border-radius: 12px; border: 2px dashed var(--color-primary, #6366f1); display: flex; align-items: center; justify-content: center; width: 64px; height: 64px;">
        <span style="font-size: 1.5rem; font-weight: 800; color: var(--color-primary, #6366f1);">?</span>
      </div>
    `;
    this.seqContainer.innerHTML = seqHtml;

    // Render options
    let optHtml = '';
    this.currentPuzzle.options.forEach((opt, idx) => {
      optHtml += `
        <button type="button" class="pr-option-btn" data-index="${idx}" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 14px; padding: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease;">
          ${this.renderSvgTile(opt, 54)}
        </button>
      `;
    });
    this.optionsContainer.innerHTML = optHtml;
  }

  handleInput(input) {
    if (this.status !== 'running' || !input || input.type !== 'select') return;

    this.totalAnswered++;
    const isCorrect = input.index === this.currentPuzzle.correctIndex;

    const buttons = this.optionsContainer.querySelectorAll('.pr-option-btn');
    const clickedBtn = buttons[input.index];

    if (isCorrect) {
      this.correctCount++;
      this.streak++;
      const bonus = Math.min(this.streak * 5, 25);
      this.score += 50 + bonus;
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
      // Highlight correct
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

  update(dt) {
    // handled by setInterval
  }

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
