import { BaseGame } from '../base-game.js';

/**
 * QuickEstimateGame — Rapid numerical magnitude estimation (#19)
 * 55s timer, 4.5s shot clock per round, tap card with higher value.
 */
export class QuickEstimateGame extends BaseGame {
  constructor(container, callbacks = {}, options = {}) {
    super(container, callbacks, options);
    this.duration = 55;
    this.timeLeft = this.duration;
    this.score = 0;
    this.correctCount = 0;
    this.totalAnswered = 0;
    this.streak = 0;
    this.timerInterval = null;
    this.shotClockInterval = null;
    this.shotClockTime = 4.5;
    this.currentRound = null;
  }

  initialize() {
    const lang = this.options.lang;
    const titleText = lang === 'vi' ? 'Ước Tính Nhanh' : 'Quick Estimate';
    const timeText = lang === 'vi' ? 'Thời gian' : 'Time';
    const scoreText = lang === 'vi' ? 'Điểm' : 'Score';
    const promptText = lang === 'vi' ? 'CHỌN BIỂU THỨC CÓ GIÁ TRỊ LỚN HƠN:' : 'TAP THE EXPRESSION WITH THE HIGHER VALUE:';

    this.container.innerHTML = `
      <div class="game-container quick-estimate-game animate-fade-in" style="display: flex; flex-direction: column; height: 100%; max-width: 600px; margin: 0 auto; padding: 16px; font-family: inherit;">
        <div class="game-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; background: rgba(255,255,255,0.05); padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
          <div>
            <h2 style="margin: 0; font-size: 1.2rem; font-weight: 700; color: var(--color-text, #fff);">${titleText}</h2>
            <div style="font-size: 0.82rem; color: var(--color-text-muted, #aaa); margin-top: 2px;">Streak: <span id="qe-streak">0</span></div>
          </div>
          <div style="display: flex; gap: 16px; text-align: right;">
            <div>
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted, #aaa);">${timeText}</div>
              <div id="qe-timer" style="font-size: 1.1rem; font-weight: 700; color: var(--color-primary, #6366f1); font-tabular-nums;">55s</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted, #aaa);">${scoreText}</div>
              <div id="qe-score" style="font-size: 1.1rem; font-weight: 700; color: var(--color-accent, #10b981);">0</div>
            </div>
          </div>
        </div>

        <!-- Shot clock progress bar -->
        <div style="width: 100%; background: rgba(255,255,255,0.1); height: 6px; border-radius: 3px; overflow: hidden; margin-bottom: 16px;">
          <div id="qe-shotbar" style="width: 100%; height: 100%; background: var(--color-primary, #6366f1); transition: width 0.1s linear;"></div>
        </div>

        <div class="game-main" style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 16px;">
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--color-accent, #10b981); text-align: center; letter-spacing: 0.5px;">
            ${promptText}
          </div>

          <!-- Comparison Cards Grid (Side-by-side or Stacked) -->
          <div id="qe-cards" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; width: 100%;">
            <!-- Dynamically populated -->
          </div>
        </div>
      </div>
    `;

    this.timerEl = this.container.querySelector('#qe-timer');
    this.scoreEl = this.container.querySelector('#qe-score');
    this.streakEl = this.container.querySelector('#qe-streak');
    this.shotBarEl = this.container.querySelector('#qe-shotbar');
    this.cardsContainer = this.container.querySelector('#qe-cards');

    this.boundHandleCardClick = (e) => {
      const card = e.target.closest('.qe-card');
      if (!card || this.status !== 'running') return;
      const side = card.getAttribute('data-side');
      this.handleInput({ type: 'choice', side });
    };

    this.cardsContainer.addEventListener('click', this.boundHandleCardClick);

    this.boundKeydown = (e) => {
      if (this.status !== 'running') return;
      if (e.key === 'ArrowLeft' || e.key === '1') this.handleInput({ type: 'choice', side: 'left' });
      if (e.key === 'ArrowRight' || e.key === '2') this.handleInput({ type: 'choice', side: 'right' });
    };
    window.addEventListener('keydown', this.boundKeydown);
  }

  start() {
    super.start();
    this.timeLeft = this.duration;
    this.score = 0;
    this.correctCount = 0;
    this.totalAnswered = 0;
    this.streak = 0;
    this.nextRound();

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

  nextRound() {
    this.currentRound = this.generatePair();
    this.shotClockTime = 4.5;
    this.render();
    this.startShotClock();
  }

  startShotClock() {
    if (this.shotClockInterval) clearInterval(this.shotClockInterval);

    const intervalMs = 50;
    const decrement = intervalMs / 4500;

    this.shotClockInterval = setInterval(() => {
      if (this.status !== 'running') return;
      this.shotClockTime -= (intervalMs / 1000);
      const pct = Math.max((this.shotClockTime / 4.5) * 100, 0);
      if (this.shotBarEl) this.shotBarEl.style.width = `${pct}%`;

      if (this.shotClockTime <= 0) {
        clearInterval(this.shotClockInterval);
        this.handleTimeout();
      }
    }, intervalMs);
  }

  handleTimeout() {
    this.totalAnswered++;
    this.streak = 0;
    if (this.callbacks.audio && typeof this.callbacks.audio.wrong === 'function') {
      this.callbacks.audio.wrong();
    }
    if (this.callbacks.onScoreUpdate) {
      const accuracy = this.totalAnswered > 0 ? Math.round((this.correctCount / this.totalAnswered) * 100) : 100;
      this.callbacks.onScoreUpdate({ score: this.score, accuracy });
    }
    if (this.status === 'running') {
      this.nextRound();
    }
  }

  generatePair() {
    let valA = 0, valB = 0, exprA = '', exprB = '';
    let isValid = false;

    while (!isValid) {
      const type = Math.random();
      if (type < 0.35) {
        // Multiplication vs Addition
        const m1 = Math.floor(Math.random() * 40) + 15;
        const m2 = Math.floor(Math.random() * 30) + 12;
        valA = m1 * m2;
        exprA = `${m1} × ${m2}`;

        const a1 = Math.floor(Math.random() * 400) + 100;
        const a2 = Math.floor(Math.random() * 400) + 100;
        valB = a1 + a2;
        exprB = `${a1} + ${a2}`;
      } else if (type < 0.7) {
        // Two multiplications
        const m1 = Math.floor(Math.random() * 30) + 10;
        const m2 = Math.floor(Math.random() * 30) + 10;
        valA = m1 * m2;
        exprA = `${m1} × ${m2}`;

        const n1 = Math.floor(Math.random() * 30) + 10;
        const n2 = Math.floor(Math.random() * 30) + 10;
        valB = n1 * n2;
        exprB = `${n1} × ${n2}`;
      } else {
        // Large addition vs subtraction
        const a1 = Math.floor(Math.random() * 500) + 200;
        const a2 = Math.floor(Math.random() * 500) + 200;
        valA = a1 + a2;
        exprA = `${a1} + ${a2}`;

        const s1 = Math.floor(Math.random() * 1000) + 500;
        const s2 = Math.floor(Math.random() * 400) + 100;
        valB = s1 - s2;
        exprB = `${s1} − ${s2}`;
      }

      const diffRatio = Math.abs(valA - valB) / Math.max(valA, valB);
      if (valA !== valB && diffRatio >= 0.12 && diffRatio <= 0.65) {
        isValid = true;
      }
    }

    const higher = valA > valB ? 'left' : 'right';
    return { exprA, exprB, valA, valB, higher };
  }

  render() {
    if (!this.currentRound) return;
    if (this.scoreEl) this.scoreEl.textContent = this.score;
    if (this.streakEl) this.streakEl.textContent = this.streak;

    this.cardsContainer.innerHTML = `
      <button type="button" class="qe-card" data-side="left" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; padding: 24px 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; min-height: 140px;">
        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted, #aaa); margin-bottom: 8px;">Option A</div>
        <div style="font-size: 1.5rem; font-weight: 800; color: var(--color-text, #fff); text-align: center; tabular-nums: true;">${this.currentRound.exprA}</div>
      </button>

      <button type="button" class="qe-card" data-side="right" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; padding: 24px 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; min-height: 140px;">
        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted, #aaa); margin-bottom: 8px;">Option B</div>
        <div style="font-size: 1.5rem; font-weight: 800; color: var(--color-text, #fff); text-align: center; tabular-nums: true;">${this.currentRound.exprB}</div>
      </button>
    `;
  }

  handleInput(input) {
    if (this.status !== 'running' || !input || input.type !== 'choice') return;
    if (this.shotClockInterval) clearInterval(this.shotClockInterval);

    this.totalAnswered++;
    const isCorrect = input.side === this.currentRound.higher;
    const cards = this.cardsContainer.querySelectorAll('.qe-card');
    const chosenCard = this.cardsContainer.querySelector(`[data-side="${input.side}"]`);

    if (isCorrect) {
      this.correctCount++;
      this.streak++;
      const bonus = Math.min(this.streak * 5, 25);
      this.score += 50 + bonus;
      if (this.callbacks.audio && typeof this.callbacks.audio.correct === 'function') {
        this.callbacks.audio.correct();
      }
      if (chosenCard) {
        chosenCard.style.background = 'rgba(16, 185, 129, 0.25)';
        chosenCard.style.borderColor = '#10b981';
      }
    } else {
      this.streak = 0;
      if (this.callbacks.audio && typeof this.callbacks.audio.wrong === 'function') {
        this.callbacks.audio.wrong();
      }
      if (chosenCard) {
        chosenCard.style.background = 'rgba(239, 68, 68, 0.25)';
        chosenCard.style.borderColor = '#ef4444';
      }
      const correctCard = this.cardsContainer.querySelector(`[data-side="${this.currentRound.higher}"]`);
      if (correctCard) {
        correctCard.style.background = 'rgba(16, 185, 129, 0.2)';
        correctCard.style.borderColor = '#10b981';
      }
    }

    if (this.callbacks.onScoreUpdate) {
      const accuracy = this.totalAnswered > 0 ? Math.round((this.correctCount / this.totalAnswered) * 100) : 100;
      this.callbacks.onScoreUpdate({ score: this.score, accuracy });
    }

    setTimeout(() => {
      if (this.status === 'running') {
        this.nextRound();
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
    if (this.shotClockInterval) {
      clearInterval(this.shotClockInterval);
      this.shotClockInterval = null;
    }
    if (this.cardsContainer && this.boundHandleCardClick) {
      this.cardsContainer.removeEventListener('click', this.boundHandleCardClick);
    }
    window.removeEventListener('keydown', this.boundKeydown);
    super.destroy();
  }
}
