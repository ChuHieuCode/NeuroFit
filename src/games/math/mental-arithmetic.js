import { BaseGame } from '../base-game.js';
import { renderNumpad, bindNumpad } from '../../ui/components/numpad.js';

/**
 * MentalArithmeticGame — 60s mental math workout (#17)
 * Uses renderNumpad and bindNumpad, bilingual vi support.
 */
export class MentalArithmeticGame extends BaseGame {
  constructor(container, callbacks = {}, options = {}) {
    super(container, callbacks, options);
    this.duration = 60;
    this.timeLeft = this.duration;
    this.score = 0;
    this.correctCount = 0;
    this.totalAnswered = 0;
    this.streak = 0;
    this.timerInterval = null;
    this.currentProblem = null;
    this.inputStr = '';
    this.cleanupNumpad = null;
  }

  initialize() {
    const lang = this.options.lang;
    const titleText = lang === 'vi' ? 'Toán Học Tâm Thần' : 'Mental Arithmetic';
    const timeText = lang === 'vi' ? 'Thời gian' : 'Time';
    const scoreText = lang === 'vi' ? 'Điểm' : 'Score';
    const submitLabel = lang === 'vi' ? 'Xác nhận' : 'Submit';

    this.container.innerHTML = `
      <div class="game-container mental-arithmetic-game animate-fade-in" style="display: flex; flex-direction: column; height: 100%; max-width: 500px; margin: 0 auto; padding: 16px; font-family: inherit;">
        <div class="game-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; background: rgba(255,255,255,0.05); padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
          <div>
            <h2 style="margin: 0; font-size: 1.2rem; font-weight: 700; color: var(--color-text, #fff);">${titleText}</h2>
            <div style="font-size: 0.82rem; color: var(--color-text-muted, #aaa); margin-top: 2px;">Streak: <span id="ma-streak">0</span></div>
          </div>
          <div style="display: flex; gap: 16px; text-align: right;">
            <div>
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted, #aaa);">${timeText}</div>
              <div id="ma-timer" style="font-size: 1.1rem; font-weight: 700; color: var(--color-primary, #6366f1); font-tabular-nums;">60s</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted, #aaa);">${scoreText}</div>
              <div id="ma-score" style="font-size: 1.1rem; font-weight: 700; color: var(--color-accent, #10b981);">0</div>
            </div>
          </div>
        </div>

        <div class="game-main" style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 16px;">
          <!-- Expression display -->
          <div id="ma-expr" style="font-size: 2.2rem; font-weight: 800; color: var(--color-text, #fff); background: rgba(0,0,0,0.25); padding: 16px 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); text-align: center; width: 100%; letter-spacing: 1px;">
            --
          </div>

          <!-- Input Display -->
          <div id="ma-input-display" style="font-size: 1.8rem; font-weight: 700; color: var(--color-primary, #6366f1); background: rgba(99, 102, 241, 0.1); padding: 10px; border-radius: 12px; border: 2px solid var(--color-primary, #6366f1); text-align: center; width: 100%; tabular-nums: true; min-height: 52px; display: flex; align-items: center; justify-content: center;">
            <span style="opacity: 0.4;">...</span>
          </div>

          <!-- Numpad Container -->
          <div id="ma-numpad-container" style="width: 100%;">
            ${renderNumpad({ showNegative: false, submitLabel })}
          </div>
        </div>
      </div>
    `;

    this.timerEl = this.container.querySelector('#ma-timer');
    this.scoreEl = this.container.querySelector('#ma-score');
    this.streakEl = this.container.querySelector('#ma-streak');
    this.exprEl = this.container.querySelector('#ma-expr');
    this.inputDisplayEl = this.container.querySelector('#ma-input-display');
    this.numpadContainer = this.container.querySelector('#ma-numpad-container');

    this.cleanupNumpad = bindNumpad(this.numpadContainer, {
      onDigit: (d) => {
        if (this.status !== 'running') return;
        if (this.inputStr.length < 6) {
          this.inputStr += d;
          this.renderInput();
        }
      },
      onBackspace: () => {
        if (this.status !== 'running') return;
        this.inputStr = this.inputStr.slice(0, -1);
        this.renderInput();
      },
      onClear: () => {
        if (this.status !== 'running') return;
        this.inputStr = '';
        this.renderInput();
      },
      onSubmit: () => {
        if (this.status !== 'running' || !this.inputStr) return;
        this.handleInput({ type: 'submit', value: parseInt(this.inputStr, 10) });
      }
    });
  }

  start() {
    super.start();
    this.timeLeft = this.duration;
    this.score = 0;
    this.correctCount = 0;
    this.totalAnswered = 0;
    this.streak = 0;
    this.inputStr = '';
    this.nextProblem();

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

  nextProblem() {
    this.currentProblem = this.generateProblem();
    this.inputStr = '';
    this.render();
  }

  generateProblem() {
    const diff = this.options.difficulty;
    const ops = (diff === 'advanced' || diff === 'expert') ? ['+', '-', '×', '÷', 'expr'] : ['+', '-', '×', '÷'];
    const op = ops[Math.floor(Math.random() * ops.length)];

    let expr = '';
    let answer = 0;

    if (op === '+') {
      const a = Math.floor(Math.random() * 80) + 12;
      const b = Math.floor(Math.random() * 80) + 12;
      expr = `${a} + ${b}`;
      answer = a + b;
    } else if (op === '-') {
      const a = Math.floor(Math.random() * 90) + 20;
      const b = Math.floor(Math.random() * a) + 1;
      expr = `${a} − ${b}`;
      answer = a - b;
    } else if (op === '×') {
      const a = Math.floor(Math.random() * 12) + 3;
      const b = Math.floor(Math.random() * 12) + 3;
      expr = `${a} × ${b}`;
      answer = a * b;
    } else if (op === '÷') {
      const b = Math.floor(Math.random() * 10) + 2;
      const mult = Math.floor(Math.random() * 12) + 2;
      const a = b * mult;
      expr = `${a} ÷ ${b}`;
      answer = mult;
    } else {
      // Two-operator expression e.g. (12 × 4) - 15
      const a = Math.floor(Math.random() * 10) + 2;
      const b = Math.floor(Math.random() * 10) + 2;
      const c = Math.floor(Math.random() * 30) + 5;
      expr = `(${a} × ${b}) − ${c}`;
      answer = (a * b) - c;
      if (answer < 0) {
        expr = `${c} + (${a} × ${b})`;
        answer = c + (a * b);
      }
    }

    return { expr, answer };
  }

  renderInput() {
    if (this.inputDisplayEl) {
      this.inputDisplayEl.innerHTML = this.inputStr ? `<span style="font-tabular-nums: true;">${this.inputStr}</span>` : `<span style="opacity: 0.4;">...</span>`;
    }
  }

  render() {
    if (!this.currentProblem) return;
    if (this.scoreEl) this.scoreEl.textContent = this.score;
    if (this.streakEl) this.streakEl.textContent = this.streak;
    if (this.exprEl) this.exprEl.textContent = this.currentProblem.expr;
    this.renderInput();
  }

  handleInput(input) {
    if (this.status !== 'running' || !input || input.type !== 'submit') return;

    this.totalAnswered++;
    const isCorrect = input.value === this.currentProblem.answer;

    if (isCorrect) {
      this.correctCount++;
      this.streak++;
      const bonus = Math.min(this.streak * 4, 20);
      this.score += 40 + bonus;
      if (this.callbacks.audio && typeof this.callbacks.audio.correct === 'function') {
        this.callbacks.audio.correct();
      }
      if (this.inputDisplayEl) {
        this.inputDisplayEl.style.background = 'rgba(16, 185, 129, 0.25)';
        this.inputDisplayEl.style.borderColor = '#10b981';
      }
    } else {
      this.streak = 0;
      if (this.callbacks.audio && typeof this.callbacks.audio.wrong === 'function') {
        this.callbacks.audio.wrong();
      }
      if (this.inputDisplayEl) {
        this.inputDisplayEl.style.background = 'rgba(239, 68, 68, 0.25)';
        this.inputDisplayEl.style.borderColor = '#ef4444';
      }
    }

    if (this.callbacks.onScoreUpdate) {
      const accuracy = this.totalAnswered > 0 ? Math.round((this.correctCount / this.totalAnswered) * 100) : 100;
      this.callbacks.onScoreUpdate({ score: this.score, accuracy });
    }

    setTimeout(() => {
      if (this.status === 'running') {
        if (this.inputDisplayEl) {
          this.inputDisplayEl.style.background = 'rgba(99, 102, 241, 0.1)';
          this.inputDisplayEl.style.borderColor = 'var(--color-primary, #6366f1)';
        }
        this.nextProblem();
      }
    }, 400);
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
    if (this.cleanupNumpad) {
      this.cleanupNumpad();
    }
    super.destroy();
  }
}
