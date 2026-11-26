import { BaseGame } from '../base-game.js';
import { renderNumpad, bindNumpad } from '../../ui/components/numpad.js';

/**
 * NumberSeriesGame — Mathematical sequence deduction (#18)
 * 75s timer, uses renderNumpad + bindNumpad, positive integers < 9999.
 */
export class NumberSeriesGame extends BaseGame {
  constructor(container, callbacks = {}, options = {}) {
    super(container, callbacks, options);
    this.duration = 75;
    this.timeLeft = this.duration;
    this.score = 0;
    this.correctCount = 0;
    this.totalAnswered = 0;
    this.streak = 0;
    this.timerInterval = null;
    this.currentPuzzle = null;
    this.inputStr = '';
    this.cleanupNumpad = null;
  }

  initialize() {
    const lang = this.options.lang;
    const titleText = lang === 'vi' ? 'Dãy Số Toán Học' : 'Number Series';
    const timeText = lang === 'vi' ? 'Thời gian' : 'Time';
    const scoreText = lang === 'vi' ? 'Điểm' : 'Score';
    const submitLabel = lang === 'vi' ? 'Xác nhận' : 'Submit';

    this.container.innerHTML = `
      <div class="game-container number-series-game animate-fade-in" style="display: flex; flex-direction: column; height: 100%; max-width: 500px; margin: 0 auto; padding: 16px; font-family: inherit;">
        <div class="game-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; background: rgba(255,255,255,0.05); padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
          <div>
            <h2 style="margin: 0; font-size: 1.2rem; font-weight: 700; color: var(--color-text, #fff);">${titleText}</h2>
            <div style="font-size: 0.82rem; color: var(--color-text-muted, #aaa); margin-top: 2px;">Streak: <span id="ns-streak">0</span></div>
          </div>
          <div style="display: flex; gap: 16px; text-align: right;">
            <div>
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted, #aaa);">${timeText}</div>
              <div id="ns-timer" style="font-size: 1.1rem; font-weight: 700; color: var(--color-primary, #6366f1); font-tabular-nums;">75s</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted, #aaa);">${scoreText}</div>
              <div id="ns-score" style="font-size: 1.1rem; font-weight: 700; color: var(--color-accent, #10b981);">0</div>
            </div>
          </div>
        </div>

        <div class="game-main" style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 16px;">
          <div style="font-size: 0.88rem; font-weight: 600; color: var(--color-text-muted, #cbd5e1); text-align: center;">
            ${lang === 'vi' ? 'Điền số còn thiếu vào dấu [ ? ]:' : 'Find the missing number in the sequence:'}
          </div>

          <!-- Series Row -->
          <div id="ns-series" style="display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; background: rgba(0,0,0,0.25); padding: 16px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); width: 100%;">
            <!-- Dynamically populated -->
          </div>

          <!-- Input Display -->
          <div id="ns-input-display" style="font-size: 1.8rem; font-weight: 700; color: var(--color-primary, #6366f1); background: rgba(99, 102, 241, 0.1); padding: 10px; border-radius: 12px; border: 2px solid var(--color-primary, #6366f1); text-align: center; width: 100%; tabular-nums: true; min-height: 52px; display: flex; align-items: center; justify-content: center;">
            <span style="opacity: 0.4;">...</span>
          </div>

          <!-- Numpad Container -->
          <div id="ns-numpad-container" style="width: 100%;">
            ${renderNumpad({ showNegative: false, submitLabel })}
          </div>
        </div>
      </div>
    `;

    this.timerEl = this.container.querySelector('#ns-timer');
    this.scoreEl = this.container.querySelector('#ns-score');
    this.streakEl = this.container.querySelector('#ns-streak');
    this.seriesContainer = this.container.querySelector('#ns-series');
    this.inputDisplayEl = this.container.querySelector('#ns-input-display');
    this.numpadContainer = this.container.querySelector('#ns-numpad-container');

    this.cleanupNumpad = bindNumpad(this.numpadContainer, {
      onDigit: (d) => {
        if (this.status !== 'running') return;
        if (this.inputStr.length < 5) {
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
    this.currentPuzzle = this.generateSeries();
    this.inputStr = '';
    this.render();
  }

  generateSeries() {
    const types = ['arithmetic', 'geom', 'squares', 'fib'];
    const type = types[Math.floor(Math.random() * types.length)];

    let terms = [];
    let answer = 0;

    if (type === 'arithmetic') {
      const start = Math.floor(Math.random() * 20) + 3;
      const step = Math.floor(Math.random() * 8) + 2;
      for (let i = 0; i < 6; i++) {
        terms.push(start + i * step);
      }
      answer = terms.pop();
    } else if (type === 'geom') {
      const start = Math.floor(Math.random() * 5) + 2;
      const mult = Math.random() > 0.5 ? 2 : 3;
      let curr = start;
      for (let i = 0; i < 6; i++) {
        terms.push(curr);
        curr *= mult;
      }
      answer = terms.pop();
    } else if (type === 'squares') {
      const start = Math.floor(Math.random() * 3) + 1;
      const k = Math.floor(Math.random() * 5);
      for (let i = 0; i < 6; i++) {
        const n = start + i;
        terms.push(n * n + k);
      }
      answer = terms.pop();
    } else {
      // Fibonacci-style
      let a = Math.floor(Math.random() * 5) + 1;
      let b = Math.floor(Math.random() * 5) + 2;
      terms.push(a, b);
      for (let i = 2; i < 6; i++) {
        const next = terms[i - 1] + terms[i - 2];
        terms.push(next);
      }
      answer = terms.pop();
    }

    // Ensure answer < 9999
    if (answer > 9999) {
      return this.generateSeries();
    }

    return { terms, answer };
  }

  renderInput() {
    if (this.inputDisplayEl) {
      this.inputDisplayEl.innerHTML = this.inputStr ? `<span style="font-tabular-nums: true;">${this.inputStr}</span>` : `<span style="opacity: 0.4;">...</span>`;
    }
  }

  render() {
    if (!this.currentPuzzle) return;
    if (this.scoreEl) this.scoreEl.textContent = this.score;
    if (this.streakEl) this.streakEl.textContent = this.streak;

    let html = '';
    this.currentPuzzle.terms.forEach((term) => {
      html += `
        <div style="background: rgba(255,255,255,0.06); padding: 12px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.12); font-size: 1.3rem; font-weight: 700; color: var(--color-text, #fff); min-width: 50px; text-align: center; tabular-nums: true;">
          ${term}
        </div>
      `;
    });

    html += `
      <div style="background: rgba(99, 102, 241, 0.15); padding: 12px 16px; border-radius: 10px; border: 2px dashed var(--color-primary, #6366f1); font-size: 1.3rem; font-weight: 800; color: var(--color-primary, #6366f1); min-width: 50px; text-align: center;">
        ?
      </div>
    `;

    this.seriesContainer.innerHTML = html;
    this.renderInput();
  }

  handleInput(input) {
    if (this.status !== 'running' || !input || input.type !== 'submit') return;

    this.totalAnswered++;
    const isCorrect = input.value === this.currentPuzzle.answer;

    if (isCorrect) {
      this.correctCount++;
      this.streak++;
      const bonus = Math.min(this.streak * 5, 25);
      this.score += 50 + bonus;
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
        this.nextPuzzle();
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
