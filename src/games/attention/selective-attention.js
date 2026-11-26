import { BaseGame } from '../base-game.js';

export class SelectiveAttentionGame extends BaseGame {
  constructor(container, callbacks = {}, options = {}) {
    super(container, callbacks, options);

    const diff = this.options.difficulty || 'beginner';
    if (diff === 'beginner' || diff === 'easy') {
      this.stimulusIntervalMs = 1400;
    } else if (diff === 'intermediate') {
      this.stimulusIntervalMs = 1200;
    } else if (diff === 'advanced') {
      this.stimulusIntervalMs = 1000;
    } else {
      this.stimulusIntervalMs = 850;
    }

    this.timeLeft = 45;
    this.score = 0;
    this.correctHits = 0;
    this.falseAlarms = 0;
    this.correctInhibitions = 0;
    this.misses = 0;
    this.mistakes = 0;
    this.combo = 0;
    this.reactionTimes = [];

    this.targetRule = null; // { shape, color }
    this.currentStimulus = null; // { shape, color, isTarget, svg }
    this.hasRespondedThisStimulus = false;

    this.timer = null;
    this.stimulusTimer = null;
    this.boundKeyHandler = this.handleKeyDown.bind(this);
  }

  initialize() {
    this.setupRules();
    this.renderShell();
    window.addEventListener('keydown', this.boundKeyHandler);
  }

  setupRules() {
    const shapes = ['circle', 'triangle', 'square', 'diamond'];
    const colors = [
      { name: 'emerald', hex: '#10B981', vi: 'xanh lá' },
      { name: 'indigo', hex: '#6366F1', vi: 'chàm' },
      { name: 'amber', hex: '#F59E0B', vi: 'hổ phách' },
      { name: 'rose', hex: '#F43F5E', vi: 'hồng' }
    ];
    const shapeNamesVi = { circle: 'hình tròn', triangle: 'tam giác', square: 'hình vuông', diamond: 'hình thoi' };

    const targetShape = shapes[Math.floor(Math.random() * shapes.length)];
    const targetColor = colors[Math.floor(Math.random() * colors.length)];

    this.targetRule = {
      shape: targetShape,
      colorName: targetColor.name,
      colorHex: targetColor.hex,
      viText: `CHỈ CHẠM ${shapeNamesVi[targetShape].toUpperCase()} ${targetColor.vi.toUpperCase()}`,
      enText: `TAP ONLY ${targetColor.name.toUpperCase()} ${targetShape.toUpperCase()}S`
    };

    this.shapesList = shapes;
    this.colorsList = colors;
  }

  renderShell() {
    const lang = this.options.lang;
    const ruleText = lang === 'vi' ? this.targetRule.viText : this.targetRule.enText;

    this.container.innerHTML = `
      <div class="nf-game-shell selective-attention-game" style="text-align: center; max-width: 440px; margin: 0 auto;">
        <div class="nf-status-pills" style="justify-content: center; margin-bottom: 8px;">
          <div class="nf-pill">Time: <span id="sa-time">${this.timeLeft}</span>s</div>
          <div class="nf-pill">Score: <span id="sa-score">0</span></div>
        </div>

        <div class="nf-timer-bar" style="margin: 8px 0 16px 0;">
          <div class="nf-timer-fill" id="sa-timer-fill" style="width: 100%;"></div>
        </div>

        <div class="nf-prompt-card" style="padding: 14px; margin-bottom: 16px; background: var(--bg-surface); border: 2px solid var(--border-strong, #cbd5e1); border-radius: 12px;">
          <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 0.05em; margin-bottom: 4px;">${lang === 'vi' ? 'Quy tắc mục tiêu' : 'Target Rule'}</div>
          <div style="font-size: 1.05rem; font-weight: 800; color: ${this.targetRule.colorHex};">${ruleText}</div>
        </div>

        <div class="nf-canvas-box" style="height: 140px; display: flex; align-items: center; justify-content: center; background: var(--bg-surface); border: 2px solid var(--border-strong, #cbd5e1); border-radius: 16px; margin-bottom: 16px;">
          <div id="sa-stimulus-display" style="font-size: 3.5rem;"></div>
        </div>

        <button type="button" id="sa-tap-btn" class="btn btn-primary btn-block" style="width: 100%; padding: 18px; font-size: 1.15rem; font-weight: 800; border-radius: 14px; background: var(--brand-primary); color: white; border: none; cursor: pointer;">
          ${lang === 'vi' ? 'TAP TARGET / CHẠM MỤC TIÊU (Space)' : 'TAP TARGET / CHẠM MỤC TIÊU (Space)'}
        </button>
      </div>
    `;

    const tapBtn = this.container.querySelector('#sa-tap-btn');
    if (tapBtn) {
      tapBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.handleTapAction();
      });
    }
  }

  start() {
    super.start();
    this.startCountdownTimer();
    this.nextStimulus();
  }

  startCountdownTimer() {
    this.timer = setInterval(() => {
      if (this.status !== 'running') return;
      this.timeLeft--;
      const timeEl = this.container.querySelector('#sa-time');
      const timerFill = this.container.querySelector('#sa-timer-fill');
      if (timeEl) timeEl.textContent = this.timeLeft;
      if (timerFill) timerFill.style.width = `${(this.timeLeft / 45) * 100}%`;

      if (this.timeLeft <= 0) {
        this.end();
      }
    }, 1000);
  }

  nextStimulus() {
    if (this.status !== 'running') return;

    // Check if previous stimulus was ignored target (miss)
    if (this.currentStimulus && this.currentStimulus.isTarget && !this.hasRespondedThisStimulus) {
      this.misses++;
      this.mistakes++;
      this.combo = 0;
    }

    this.hasRespondedThisStimulus = false;

    // 45% true target, 55% lure distractor
    const isTarget = Math.random() < 0.45;
    let shape, color;

    if (isTarget) {
      shape = this.targetRule.shape;
      color = this.colorsList.find(c => c.name === this.targetRule.colorName);
    } else {
      // Pick distractor
      shape = this.shapesList[Math.floor(Math.random() * this.shapesList.length)];
      color = this.colorsList[Math.floor(Math.random() * this.colorsList.length)];
      if (shape === this.targetRule.shape && color.name === this.targetRule.colorName) {
        // force non-target
        shape = this.shapesList.filter(s => s !== this.targetRule.shape)[0];
      }
    }

    this.currentStimulus = { shape, color, isTarget, startTime: performance.now() };

    // Generate SVG
    const svgHTML = this.renderShapeSvg(shape, color.hex);
    const displayEl = this.container.querySelector('#sa-stimulus-display');
    if (displayEl) displayEl.innerHTML = svgHTML;

    this.stimulusTimer = setTimeout(() => {
      this.nextStimulus();
    }, this.stimulusIntervalMs);
  }

  renderShapeSvg(shape, hexColor) {
    if (shape === 'circle') {
      return `<svg viewBox="0 0 24 24" width="72" height="72" fill="${hexColor}"><circle cx="12" cy="12" r="10"/></svg>`;
    } else if (shape === 'triangle') {
      return `<svg viewBox="0 0 24 24" width="72" height="72" fill="${hexColor}"><polygon points="12 2 22 22 2 22"/></svg>`;
    } else if (shape === 'square') {
      return `<svg viewBox="0 0 24 24" width="72" height="72" fill="${hexColor}"><rect x="2" y="2" width="20" height="20" rx="3"/></svg>`;
    } else {
      // diamond
      return `<svg viewBox="0 0 24 24" width="72" height="72" fill="${hexColor}"><polygon points="12 2 22 12 12 22 2 12"/></svg>`;
    }
  }

  handleTapAction() {
    if (this.status !== 'running' || !this.currentStimulus || this.hasRespondedThisStimulus) return;
    this.hasRespondedThisStimulus = true;

    const reactionTime = performance.now() - this.currentStimulus.startTime;
    this.reactionTimes.push(reactionTime);

    if (this.currentStimulus.isTarget) {
      // Correct hit!
      this.correctHits++;
      this.combo++;
      const earnedPts = 15 + Math.max(0, Math.round(20 - reactionTime / 50)) + this.combo * 3;
      this.score += earnedPts;
      if (this.callbacks.audio?.correct) this.callbacks.audio.correct(this.combo);
      this.flashFeedback(true);
    } else {
      // False alarm (tapped distractor)
      this.falseAlarms++;
      this.mistakes++;
      this.combo = 0;
      this.score = Math.max(0, this.score - 10);
      if (this.callbacks.audio?.wrong) this.callbacks.audio.wrong();
      this.flashFeedback(false);
    }

    this.updateHUD();
  }

  flashFeedback(isCorrect) {
    const box = this.container.querySelector('.nf-canvas-box');
    if (!box) return;
    box.style.borderColor = isCorrect ? 'var(--success, #10B981)' : 'var(--danger, #EF4444)';
    setTimeout(() => {
      box.style.borderColor = 'var(--border-strong, #cbd5e1)';
    }, 250);
  }

  handleKeyDown(e) {
    if (e.code === 'Space') {
      e.preventDefault();
      this.handleTapAction();
    }
  }

  handleInput(input) {
    if (input === 'tap' || input === 'Space') {
      this.handleTapAction();
    }
  }

  update(dt) {}

  render() {
    this.updateHUD();
  }

  updateHUD() {
    const scoreEl = this.container.querySelector('#sa-score');
    if (scoreEl) scoreEl.textContent = this.score;

    if (this.callbacks.onScoreUpdate) {
      this.callbacks.onScoreUpdate({ score: this.score, accuracy: this.getAccuracy() });
    }
  }

  getAccuracy() {
    const total = this.correctHits + this.falseAlarms + this.misses;
    if (total === 0) return 100;
    return Math.round(((this.correctHits) / total) * 100);
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
    if (this.timer) clearInterval(this.timer);
    if (this.stimulusTimer) clearTimeout(this.stimulusTimer);
    window.removeEventListener('keydown', this.boundKeyHandler);
    super.end();
  }

  destroy() {
    if (this.timer) clearInterval(this.timer);
    if (this.stimulusTimer) clearTimeout(this.stimulusTimer);
    window.removeEventListener('keydown', this.boundKeyHandler);
    super.destroy();
  }
}
