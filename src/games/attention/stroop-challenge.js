import { BaseGame } from '../base-game.js';

/**
 * StroopChallengeGame — 50s timed Stroop interference game.
 */
export class StroopChallengeGame extends BaseGame {
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
    this.currentTrial = null;
    this.trialStartTime = 0;
    this.isPaused = false;
    
    // Colors definition: EN name, VI name, hex, css class
    this.colors = [
      { id: 'red', nameEn: 'RED', nameVi: 'ĐỎ', hex: '#EF4444' },
      { id: 'blue', nameEn: 'BLUE', nameVi: 'DƯƠNG', hex: '#3B82F6' },
      { id: 'green', nameEn: 'GREEN', nameVi: 'LÁ', hex: '#10B981' },
      { id: 'amber', nameEn: 'AMBER', nameVi: 'VÀNG', hex: '#F59E0B' }
    ];

    this.boundKeyHandler = this.handleKeyDown.bind(this);
  }

  initialize() {
    const isVi = this.options.lang === 'vi';
    const promptText = isVi 
      ? 'Chọn MÀU MỰC (bỏ qua nghĩa chữ)' 
      : 'Tap the INK COLOR (ignore the word)';

    this.container.innerHTML = `
      <div class="stroop-game">
        <div class="stroop-hud">
          <div class="stroop-pill">⏱️ <span id="stroop-time">${this.timeLeft}s</span></div>
          <div class="stroop-pill">⭐ <span id="stroop-score">0</span></div>
          <div class="stroop-pill">🔥 <span id="stroop-streak">0</span>x</div>
        </div>

        <div class="stroop-instruction">${promptText}</div>

        <div class="stroop-display-area" id="stroop-display">
          <div class="stroop-word" id="stroop-word">READY</div>
        </div>

        <div class="stroop-buttons-grid" id="stroop-buttons">
          ${this.colors.map((c, idx) => `
            <button class="stroop-choice-btn" data-color="${c.id}" aria-label="${isVi ? c.nameVi : c.nameEn}">
              <span class="color-swatch" style="background-color: ${c.hex}"></span>
              <span class="color-label">${isVi ? c.nameVi : c.nameEn} <span class="key-hint">(${idx + 1})</span></span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    // Attach button listeners
    const buttons = this.container.querySelectorAll('.stroop-choice-btn');
    buttons.forEach(btn => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (this.status === 'running') {
          this.handleInput(btn.dataset.color);
        }
      });
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
      const timeEl = this.container.querySelector('#stroop-time');
      if (timeEl) timeEl.textContent = `${this.timeLeft}s`;

      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.end();
      }
    }, 1000);
  }

  nextTrial() {
    if (this.status !== 'running') return;

    // 75% incongruent, 25% congruent
    const isCongruent = Math.random() < 0.25;
    
    const wordObj = this.colors[Math.floor(Math.random() * this.colors.length)];
    let inkObj;

    if (isCongruent) {
      inkObj = wordObj;
    } else {
      const otherColors = this.colors.filter(c => c.id !== wordObj.id);
      inkObj = otherColors[Math.floor(Math.random() * otherColors.length)];
    }

    this.currentTrial = {
      word: wordObj,
      ink: inkObj
    };

    this.trialStartTime = performance.now();
    this.renderTrial();
  }

  renderTrial() {
    if (!this.currentTrial) return;
    const wordEl = this.container.querySelector('#stroop-word');
    if (!wordEl) return;

    const isVi = this.options.lang === 'vi';
    const wordText = isVi ? this.currentTrial.word.nameVi : this.currentTrial.word.nameEn;
    
    wordEl.textContent = wordText;
    wordEl.style.color = this.currentTrial.ink.hex;
    
    // Add micro-pop animation class
    wordEl.classList.remove('pop');
    void wordEl.offsetWidth; // trigger reflow
    wordEl.classList.add('pop');
  }

  handleKeyDown(e) {
    if (this.status !== 'running' || this.isPaused) return;
    const key = e.key;
    if (key >= '1' && key <= '4') {
      const idx = parseInt(key, 10) - 1;
      if (this.colors[idx]) {
        this.handleInput(this.colors[idx].id);
      }
    }
  }

  handleInput(inputColor) {
    if (this.status !== 'running' || !this.currentTrial) return;

    const reactionTime = performance.now() - this.trialStartTime;
    this.reactionTimes.push(reactionTime);
    this.totalCount++;

    const correctInkId = this.currentTrial.ink.id;
    const isCorrect = inputColor === correctInkId;

    if (isCorrect) {
      this.correctCount++;
      this.streak++;
      if (this.streak > this.maxStreak) this.maxStreak = this.streak;

      // Score calculation with streak bonus & speed bonus
      const speedBonus = reactionTime < 500 ? 5 : 0;
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
    const displayArea = this.container.querySelector('#stroop-display');
    if (!displayArea) return;
    displayArea.classList.add(type);
    setTimeout(() => {
      displayArea.classList.remove(type);
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
    const scoreEl = this.container.querySelector('#stroop-score');
    const streakEl = this.container.querySelector('#stroop-streak');
    if (scoreEl) scoreEl.textContent = this.score;
    if (streakEl) streakEl.textContent = this.streak;
  }

  update(dt) {
    // Handled by setInterval timer
  }

  render() {
    // DOM updated reactively in handlers
  }

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
    window.removeEventListener('keydown', this.boundKeyHandler);
    super.destroy();
  }
}
