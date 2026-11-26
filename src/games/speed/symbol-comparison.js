import { BaseGame } from '../base-game.js';

/**
 * SymbolComparisonGame — 55s visual discrimination speed game.
 */
export class SymbolComparisonGame extends BaseGame {
  constructor(container, callbacks = {}, options = {}) {
    super(container, callbacks, options);

    this.duration = 55; // 55 seconds
    this.timeLeft = this.duration;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.correctCount = 0;
    this.totalCount = 0;
    this.accuracy = 100;
    this.reactionTimes = [];

    this.timerInterval = null;
    this.currentTrial = null;
    this.trialStartTime = 0;
    this.isPaused = false;

    // Glyph lexicon
    this.glyphs = ['▲', '◆', '●', '■', '★', '✦', '⬢', '▼'];
    
    // Length based on difficulty
    const diff = options.difficulty || 'beginner';
    if (diff === 'beginner') this.arrayLength = 4;
    else if (diff === 'easy' || diff === 'intermediate') this.arrayLength = 5;
    else if (diff === 'advanced') this.arrayLength = 6;
    else this.arrayLength = 7; // expert

    this.boundKeyHandler = this.handleKeyDown.bind(this);
  }

  initialize() {
    const isVi = this.options.lang === 'vi';
    const subDiff = isVi ? 'KHÁC' : 'DIFFERENT';
    const subIdentical = isVi ? 'GIỐNG' : 'IDENTICAL';
    const promptText = isVi ? 'Hai chuỗi ký tự này GIỐNG hay KHÁC nhau?' : 'Are these two symbol arrays IDENTICAL or DIFFERENT?';

    this.container.innerHTML = `
      <div class="symbol-comparison-game">
        <div class="sc-hud">
          <div class="sc-pill">⏱️ <span id="sc-time">${this.timeLeft}s</span></div>
          <div class="sc-pill">⭐ <span id="sc-score">0</span></div>
          <div class="sc-pill">🔥 <span id="sc-streak">0</span>x</div>
        </div>

        <div class="sc-instruction">${promptText}</div>

        <div class="sc-arrays-container" id="sc-arrays">
          <div class="sc-array-row" id="sc-row-1">-- -- -- --</div>
          <div class="sc-divider"></div>
          <div class="sc-array-row" id="sc-row-2">-- -- -- --</div>
        </div>

        <div class="sc-controls">
          <button class="sc-btn sc-btn-diff" id="btn-diff" aria-label="${subDiff}">
            <span class="sc-icon">✗</span>
            <span class="sc-label">${subDiff} <span class="key-hint">(A / ←)</span></span>
          </button>
          <button class="sc-btn sc-btn-ident" id="btn-ident" aria-label="${subIdentical}">
            <span class="sc-icon">✓</span>
            <span class="sc-label">${subIdentical} <span class="key-hint">(D / →)</span></span>
          </button>
        </div>
      </div>
    `;

    this.container.querySelector('#btn-diff').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (this.status === 'running') {
        this.handleInput(false); // false = different
      }
    });

    this.container.querySelector('#btn-ident').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (this.status === 'running') {
        this.handleInput(true); // true = identical
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

    this.nextTrial();
    this.startTimer();
    this.updateHUD();
  }

  pause() {
    super.pause();
    this.isPaused = true;
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  resume() {
    super.resume();
    this.isPaused = false;
    this.startTimer();
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.status !== 'running' || this.isPaused) return;
      this.timeLeft--;
      const timeEl = this.container.querySelector('#sc-time');
      if (timeEl) timeEl.textContent = `${this.timeLeft}s`;

      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.end();
      }
    }, 1000);
  }

  nextTrial() {
    if (this.status !== 'running') return;

    // 50% identical, 50% different
    const isIdentical = Math.random() < 0.5;

    // Generate array 1
    const arr1 = [];
    for (let i = 0; i < this.arrayLength; i++) {
      arr1.push(this.glyphs[Math.floor(Math.random() * this.glyphs.length)]);
    }

    let arr2 = [...arr1];

    if (!isIdentical) {
      // 50% chance substitution, 50% chance transposition of two adjacent elements
      const diffType = Math.random() < 0.5 ? 'substitution' : 'transposition';
      const idx = Math.floor(Math.random() * this.arrayLength);

      if (diffType === 'substitution') {
        const otherGlyphs = this.glyphs.filter(g => g !== arr1[idx]);
        const replacement = otherGlyphs[Math.floor(Math.random() * otherGlyphs.length)];
        arr2[idx] = replacement;
      } else {
        // transposition with next index (or previous if at end)
        const idx2 = idx === this.arrayLength - 1 ? idx - 1 : idx + 1;
        const temp = arr2[idx];
        arr2[idx] = arr2[idx2];
        arr2[idx2] = temp;
        // ensure it actually changed
        if (arr2.join('') === arr1.join('')) {
          arr2[0] = this.glyphs.find(g => g !== arr1[0]);
        }
      }
    }

    this.currentTrial = {
      arr1,
      arr2,
      isIdentical
    };

    this.trialStartTime = performance.now();
    this.renderTrial();
  }

  renderTrial() {
    if (!this.currentTrial) return;
    const row1 = this.container.querySelector('#sc-row-1');
    const row2 = this.container.querySelector('#sc-row-2');
    if (!row1 || !row2) return;

    row1.textContent = this.currentTrial.arr1.join(' ');
    row2.textContent = this.currentTrial.arr2.join(' ');

    const arraysBox = this.container.querySelector('#sc-arrays');
    arraysBox.classList.remove('pop');
    void arraysBox.offsetWidth;
    arraysBox.classList.add('pop');
  }

  handleKeyDown(e) {
    if (this.status !== 'running' || this.isPaused) return;
    const key = e.key.toLowerCase();
    if (key === 'a' || key === 'arrowleft') {
      this.handleInput(false); // different
    } else if (key === 'd' || key === 'arrowright') {
      this.handleInput(true); // identical
    }
  }

  handleInput(playerGuessedIdentical) {
    if (this.status !== 'running' || !this.currentTrial) return;

    const reactionTime = performance.now() - this.trialStartTime;
    this.reactionTimes.push(reactionTime);
    this.totalCount++;

    const isCorrect = playerGuessedIdentical === this.currentTrial.isIdentical;

    if (isCorrect) {
      this.correctCount++;
      this.streak++;
      if (this.streak > this.maxStreak) this.maxStreak = this.streak;

      const speedBonus = reactionTime < 700 ? 15 : 5;
      const points = 10 + (this.streak * 2) + speedBonus;
      this.score += points;

      if (this.callbacks.audio) {
        this.callbacks.audio.correct(this.streak);
      }
      this.flashFeedback('correct');
    } else {
      this.streak = 0;
      if (this.callbacks.audio) {
        this.callbacks.audio.wrong();
      }
      this.flashFeedback('wrong');
    }

    this.updateAccuracy();
    this.updateHUD();

    if (this.callbacks.onScoreUpdate) {
      this.callbacks.onScoreUpdate({
        score: this.score,
        accuracy: this.accuracy
      });
    }

    this.nextTrial();
  }

  flashFeedback(type) {
    const arraysBox = this.container.querySelector('#sc-arrays');
    if (!arraysBox) return;
    arraysBox.classList.add(type);
    setTimeout(() => {
      arraysBox.classList.remove(type);
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
    const scoreEl = this.container.querySelector('#sc-score');
    const streakEl = this.container.querySelector('#sc-streak');
    if (scoreEl) scoreEl.textContent = this.score;
    if (streakEl) streakEl.textContent = this.streak;
  }

  update(dt) {}
  render() {}

  calculateScore() {
    this.updateAccuracy();
    const avgReaction = this.reactionTimes.length > 0
      ? Math.round(this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length)
      : 650;

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
    window.removeEventListener('keydown', this.boundKeyHandler);
    super.destroy();
  }
}
