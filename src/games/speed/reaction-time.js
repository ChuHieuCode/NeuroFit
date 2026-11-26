import { BaseGame } from '../base-game.js';

/**
 * ReactionTimeGame — 8-trial high-precision millisecond reflex benchmark.
 */
export class ReactionTimeGame extends BaseGame {
  constructor(container, callbacks = {}, options = {}) {
    super(container, callbacks, options);

    this.totalTrials = 8;
    this.currentTrialIndex = 0;
    this.state = 'waiting'; // 'waiting' | 'ready-signal' | 'false-start' | 'result' | 'finished'
    this.reactionTimes = [];
    this.trialScores = [];
    this.mistakes = 0;
    this.score = 0;
    this.accuracy = 100;

    this.signalTimeout = null;
    this.signalTimestamp = 0;
    this.isPaused = false;
    this.remainingWaitDelay = 0;
    this.waitStartTime = 0;
    this.currentDelay = 0;

    this.boundKeyHandler = this.handleKeyDown.bind(this);
    this.boundPointerHandler = this.handleArenaTap.bind(this);
  }

  initialize() {
    const isVi = this.options.lang === 'vi';
    const waitText = isVi ? 'Chờ tín hiệu Xanh Ngọc...' : 'Wait for Emerald Signal...';

    this.container.innerHTML = `
      <div class="reaction-game">
        <div class="rt-hud">
          <div class="rt-pill">${isVi ? 'Lượt' : 'Trial'}: <span id="rt-trial">1</span>/${this.totalTrials}</div>
          <div class="rt-pill">⭐ <span id="rt-score">0</span></div>
          <div class="rt-pill">⚠️ ${isVi ? 'Lỗi' : 'Fails'}: <span id="rt-mistakes">0</span></div>
        </div>

        <div class="rt-history-bar" id="rt-history">
          <!-- Live per-trial ms pill history -->
        </div>

        <div class="rt-arena state-waiting" id="rt-arena" role="button" aria-label="Reaction time touch arena">
          <div class="rt-arena-content" id="rt-content">
            <div class="rt-pulse-ring"></div>
            <div class="rt-icon">⚡</div>
            <div class="rt-message" id="rt-msg">${waitText}</div>
          </div>
        </div>
      </div>
    `;

    const arena = this.container.querySelector('#rt-arena');
    arena.addEventListener('pointerdown', this.boundPointerHandler);
    window.addEventListener('keydown', this.boundKeyHandler);
  }

  start() {
    super.start();
    this.currentTrialIndex = 0;
    this.reactionTimes = [];
    this.trialScores = [];
    this.mistakes = 0;
    this.score = 0;
    this.updateHUD();
    this.startNewTrial();
  }

  startNewTrial() {
    if (this.status !== 'running') return;
    if (this.currentTrialIndex >= this.totalTrials) {
      this.endGame();
      return;
    }

    this.state = 'waiting';
    this.renderArenaState();

    // Random delay 1400..3600ms
    this.currentDelay = 1400 + Math.random() * 2200;
    this.waitStartTime = performance.now();
    this.remainingWaitDelay = this.currentDelay;

    if (this.signalTimeout) clearTimeout(this.signalTimeout);
    this.signalTimeout = setTimeout(() => {
      this.triggerSignal();
    }, this.currentDelay);
  }

  triggerSignal() {
    if (this.status !== 'running' || this.state !== 'waiting') return;
    this.state = 'ready-signal';
    this.signalTimestamp = performance.now();
    this.renderArenaState();

    if (this.callbacks.audio) {
      this.callbacks.audio.tap();
    }
  }

  handleArenaTap(e) {
    if (this.status !== 'running') return;
    e.preventDefault();
    this.processTap();
  }

  handleKeyDown(e) {
    if (this.status !== 'running') return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      this.processTap();
    }
  }

  processTap() {
    if (this.state === 'waiting') {
      // False start! Tapped too early
      if (this.signalTimeout) clearTimeout(this.signalTimeout);
      this.state = 'false-start';
      this.mistakes++;
      if (this.callbacks.audio) {
        this.callbacks.audio.wrong();
      }
      this.renderArenaState();

      // Retry trial after 1s
      setTimeout(() => {
        if (this.status === 'running') {
          this.startNewTrial();
        }
      }, 1000);

    } else if (this.state === 'ready-signal') {
      // Valid reaction!
      const reactionMs = Math.round(performance.now() - this.signalTimestamp);
      this.reactionTimes.push(reactionMs);

      // Score award based on speed
      let points = 50;
      if (reactionMs < 220) points = 180;
      else if (reactionMs < 280) points = 140;
      else if (reactionMs < 360) points = 100;
      else if (reactionMs < 450) points = 80;

      this.score += points;
      this.trialScores.push({ trial: this.currentTrialIndex + 1, ms: reactionMs, pts: points });

      if (this.callbacks.audio) {
        this.callbacks.audio.correct(1);
      }

      this.state = 'result';
      this.renderArenaState();
      this.appendHistoryPill(reactionMs, points);
      this.updateHUD();

      if (this.callbacks.onScoreUpdate) {
        this.callbacks.onScoreUpdate({
          score: this.score,
          accuracy: this.getAccuracy()
        });
      }

      this.currentTrialIndex++;

      // Next trial after 1.1s
      setTimeout(() => {
        if (this.status === 'running') {
          if (this.currentTrialIndex >= this.totalTrials) {
            this.endGame();
          } else {
            this.startNewTrial();
          }
        }
      }, 1100);
    }
  }

  renderArenaState() {
    const arena = this.container.querySelector('#rt-arena');
    const msgEl = this.container.querySelector('#rt-msg');
    if (!arena || !msgEl) return;

    const isVi = this.options.lang === 'vi';

    arena.className = 'rt-arena';
    if (this.state === 'waiting') {
      arena.classList.add('state-waiting');
      msgEl.textContent = isVi ? 'Chờ tín hiệu Xanh Ngọc...' : 'Wait for Emerald Signal...';
    } else if (this.state === 'ready-signal') {
      arena.classList.add('state-signal');
      msgEl.textContent = isVi ? 'CHẠM NGAY!' : 'TAP NOW!';
    } else if (this.state === 'false-start') {
      arena.classList.add('state-false');
      msgEl.textContent = isVi ? 'Bấm quá sớm! Lỗi.' : 'Too Early! False Start.';
    } else if (this.state === 'result') {
      arena.classList.add('state-result');
      const last = this.reactionTimes[this.reactionTimes.length - 1];
      msgEl.textContent = `${last}ms 🎉`;
    }
  }

  appendHistoryPill(ms, pts) {
    const historyEl = this.container.querySelector('#rt-history');
    if (!historyEl) return;
    const pill = document.createElement('div');
    pill.className = 'rt-hist-pill';
    pill.textContent = `${ms}ms`;
    historyEl.appendChild(pill);
  }

  updateHUD() {
    const trialEl = this.container.querySelector('#rt-trial');
    const scoreEl = this.container.querySelector('#rt-score');
    const mistakesEl = this.container.querySelector('#rt-mistakes');
    if (trialEl) trialEl.textContent = Math.min(this.totalTrials, this.currentTrialIndex + 1);
    if (scoreEl) scoreEl.textContent = this.score;
    if (mistakesEl) mistakesEl.textContent = this.mistakes;
  }

  getAccuracy() {
    const successful = this.reactionTimes.length;
    const total = successful + this.mistakes;
    if (total === 0) return 100;
    return Math.round((successful / total) * 100);
  }

  pause() {
    super.pause();
    this.isPaused = true;
    if (this.signalTimeout) {
      clearTimeout(this.signalTimeout);
      const elapsed = performance.now() - this.waitStartTime;
      this.remainingWaitDelay = Math.max(200, this.remainingWaitDelay - elapsed);
    }
  }

  resume() {
    super.resume();
    this.isPaused = false;
    if (this.state === 'waiting') {
      this.waitStartTime = performance.now();
      this.signalTimeout = setTimeout(() => {
        this.triggerSignal();
      }, this.remainingWaitDelay);
    }
  }

  endGame() {
    this.status = 'ended';
    this.end();
  }

  update(dt) {}
  render() {}

  calculateScore() {
    const avgReaction = this.reactionTimes.length > 0
      ? Math.round(this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length)
      : 350;

    return {
      score: this.score,
      accuracy: this.getAccuracy(),
      reactionMs: avgReaction,
      mistakes: this.mistakes,
      trialsCompleted: this.reactionTimes.length
    };
  }

  destroy() {
    if (this.signalTimeout) clearTimeout(this.signalTimeout);
    window.removeEventListener('keydown', this.boundKeyHandler);
    super.destroy();
  }
}
