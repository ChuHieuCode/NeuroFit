import { BaseGame } from '../base-game.js';

/**
 * SpeedMatchGame — 50s rapid 1-back symbol matching sprint.
 */
export class SpeedMatchGame extends BaseGame {
  constructor(container, callbacks = {}, options = {}) {
    super(container, callbacks, options);

    this.duration = 50; // 50 seconds
    this.timeLeft = this.duration;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.correctCount = 0;
    this.totalCount = 0;
    this.accuracy = 100;
    this.reactionTimes = [];

    this.timerInterval = null;
    this.state = 'memorize'; // 'memorize' | 'playing' | 'card-transition'
    this.memorizeTimeLeft = 1.3; // 1.3s
    this.memorizeTimerInterval = null;

    this.currentSymbol = null;
    this.previousSymbol = null;
    this.isMatch = false;
    this.trialStartTime = 0;
    this.isPaused = false;

    // Geometric SVG symbol shapes library
    this.symbols = [
      { id: 'circle', svg: '<circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="8"/>' },
      { id: 'square', svg: '<rect x="20" y="20" width="60" height="60" rx="10" fill="none" stroke="currentColor" stroke-width="8"/>' },
      { id: 'triangle', svg: '<polygon points="50,15 85,85 15,85" fill="none" stroke="currentColor" stroke-width="8" stroke-linejoin="round"/>' },
      { id: 'star', svg: '<polygon points="50,10 61,35 88,38 68,56 74,82 50,68 26,82 32,56 12,38 39,35" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round"/>' },
      { id: 'diamond', svg: '<polygon points="50,10 85,50 50,90 15,50" fill="none" stroke="currentColor" stroke-width="8" stroke-linejoin="round"/>' },
      { id: 'hexagon', svg: '<polygon points="35,15 65,15 85,50 65,85 35,85 15,50" fill="none" stroke="currentColor" stroke-width="8" stroke-linejoin="round"/>' }
    ];

    this.boundKeyHandler = this.handleKeyDown.bind(this);
  }

  initialize() {
    const isVi = this.options.lang === 'vi';
    const subNo = isVi ? 'KHÁC' : 'NO';
    const subMatch = isVi ? 'TRÙNG' : 'MATCH';

    this.container.innerHTML = `
      <div class="speed-match-game">
        <div class="sm-hud">
          <div class="sm-pill">⏱️ <span id="sm-time">${this.timeLeft}s</span></div>
          <div class="sm-pill">⭐ <span id="sm-score">0</span></div>
          <div class="sm-pill">🔥 <span id="sm-streak">0</span>x</div>
        </div>

        <div class="sm-instruction" id="sm-instruction">
          ${isVi ? 'Đang nhớ biểu tượng ban đầu...' : 'Memorize this symbol!'}
        </div>

        <div class="sm-card-container">
          <div class="sm-card" id="sm-card">
            <svg class="sm-svg" viewBox="0 0 100 100" id="sm-svg-content"></svg>
          </div>
        </div>

        <div class="sm-controls">
          <button class="sm-btn sm-btn-no" id="btn-no" aria-label="${subNo}">
            <span class="sm-icon">✗</span>
            <span class="sm-label">${subNo} <span class="key-hint">(A / ←)</span></span>
          </button>
          <button class="sm-btn sm-btn-match" id="btn-match" aria-label="${subMatch}">
            <span class="sm-icon">✓</span>
            <span class="sm-label">${subMatch} <span class="key-hint">(D / →)</span></span>
          </button>
        </div>
      </div>
    `;

    this.container.querySelector('#btn-no').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (this.status === 'running' && this.state === 'playing') {
        this.handleInput(false);
      }
    });

    this.container.querySelector('#btn-match').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (this.status === 'running' && this.state === 'playing') {
        this.handleInput(true);
      }
    });

    window.addEventListener('keydown', this.boundKeyHandler);
  }

  start() {
    super.start();
    this.timeLeft = this.duration;
    this.score = 0;
    this.streak = 0;
    this.correctCount = 0;
    this.totalCount = 0;
    this.reactionTimes = [];
    this.state = 'memorize';

    // Pick initial symbol
    this.previousSymbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
    this.currentSymbol = this.previousSymbol;
    this.renderSymbol();

    // Start 1.3s memorize countdown
    this.startMemorizePhase();
    this.startTimer();
    this.updateHUD();
  }

  startMemorizePhase() {
    this.state = 'memorize';
    const instructionEl = this.container.querySelector('#sm-instruction');
    const isVi = this.options.lang === 'vi';
    if (instructionEl) instructionEl.textContent = isVi ? 'Ghi nhớ biểu tượng đầu tiên!' : 'Memorize this symbol!';

    let memoTime = 1300;
    if (this.memorizeTimerInterval) clearTimeout(this.memorizeTimerInterval);
    
    this.memorizeTimerInterval = setTimeout(() => {
      if (this.status !== 'running') return;
      this.nextTrial();
    }, memoTime);
  }

  nextTrial() {
    if (this.status !== 'running') return;
    this.state = 'playing';

    const isVi = this.options.lang === 'vi';
    const instructionEl = this.container.querySelector('#sm-instruction');
    if (instructionEl) {
      instructionEl.textContent = isVi 
        ? 'Biểu tượng này có TRÙNG với cái trước không?' 
        : 'Does this match the PREVIOUS symbol?';
    }

    // 48% match, 52% different
    const matchChance = Math.random() < 0.48;

    if (matchChance) {
      this.currentSymbol = this.previousSymbol;
      this.isMatch = true;
    } else {
      const otherSymbols = this.symbols.filter(s => s.id !== this.previousSymbol.id);
      this.currentSymbol = otherSymbols[Math.floor(Math.random() * otherSymbols.length)];
      this.isMatch = false;
    }

    this.renderSymbolWithAnimation();
    this.trialStartTime = performance.now();
  }

  renderSymbol() {
    const svgEl = this.container.querySelector('#sm-svg-content');
    if (svgEl && this.currentSymbol) {
      svgEl.innerHTML = this.currentSymbol.svg || this.currentSymbol.x;
    }
  }

  renderSymbolWithAnimation() {
    const cardEl = this.container.querySelector('#sm-card');
    if (!cardEl) return;

    cardEl.classList.remove('slide-in');
    void cardEl.offsetWidth; // trigger reflow
    this.renderSymbol();
    cardEl.classList.add('slide-in');
  }

  pause() {
    super.pause();
    this.isPaused = true;
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.memorizeTimerInterval) clearTimeout(this.memorizeTimerInterval);
  }

  resume() {
    super.resume();
    this.isPaused = false;
    this.startTimer();
    if (this.state === 'memorize') {
      this.startMemorizePhase();
    }
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.status !== 'running' || this.isPaused) return;
      this.timeLeft--;
      const timeEl = this.container.querySelector('#sm-time');
      if (timeEl) timeEl.textContent = `${this.timeLeft}s`;

      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.end();
      }
    }, 1000);
  }

  handleKeyDown(e) {
    if (this.status !== 'running' || this.isPaused || this.state !== 'playing') return;
    const key = e.key.toLowerCase();
    if (key === 'a' || key === 'arrowleft') {
      this.handleInput(false);
    } else if (key === 'd' || key === 'arrowright') {
      this.handleInput(true);
    }
  }

  handleInput(playerGuessedMatch) {
    if (this.status !== 'running' || this.state !== 'playing') return;

    const reactionTime = performance.now() - this.trialStartTime;
    this.reactionTimes.push(reactionTime);
    this.totalCount++;

    const isCorrect = playerGuessedMatch === this.isMatch;

    if (isCorrect) {
      this.correctCount++;
      this.streak++;
      if (this.streak > this.maxStreak) this.maxStreak = this.streak;

      // Speed bonus for <650ms responses
      const speedBonus = reactionTime < 650 ? 15 : 5;
      const points = 10 + (this.streak * 2) + speedBonus;
      this.score += points;

      if (this.callbacks.audio) {
        this.callbacks.audio.correct(this.streak);
      }
      this.flashCard('correct');
    } else {
      this.streak = 0;
      if (this.callbacks.audio) {
        this.callbacks.audio.wrong();
      }
      this.flashCard('wrong');
    }

    this.updateAccuracy();
    this.updateHUD();

    if (this.callbacks.onScoreUpdate) {
      this.callbacks.onScoreUpdate({
        score: this.score,
        accuracy: this.accuracy
      });
    }

    // Set previous symbol to current before next trial
    this.previousSymbol = this.currentSymbol;
    this.nextTrial();
  }

  flashCard(type) {
    const cardEl = this.container.querySelector('#sm-card');
    if (!cardEl) return;
    cardEl.classList.add(type);
    setTimeout(() => {
      cardEl.classList.remove(type);
    }, 250);
  }

  updateAccuracy() {
    if (this.totalCount === 0) {
      this.accuracy = 100;
    } else {
      this.accuracy = Math.round((this.correctCount / this.totalCount) * 100);
    }
  }

  updateHUD() {
    const scoreEl = this.container.querySelector('#sm-score');
    const streakEl = this.container.querySelector('#sm-streak');
    if (scoreEl) scoreEl.textContent = this.score;
    if (streakEl) streakEl.textContent = this.streak;
  }

  update(dt) {}
  render() {}

  calculateScore() {
    this.updateAccuracy();
    const avgReaction = this.reactionTimes.length > 0
      ? Math.round(this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length)
      : 450;

    return {
      score: this.score,
      accuracy: this.accuracy,
      reactionMs: avgReaction,
      maxStreak: this.maxStreak,
      correctCount: this.correctCount,
      totalCount: this.totalCount
    };
  }

  destroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.memorizeTimerInterval) clearTimeout(this.memorizeTimerInterval);
    window.removeEventListener('keydown', this.boundKeyHandler);
    super.destroy();
  }
}
