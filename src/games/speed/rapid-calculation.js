import { BaseGame } from '../base-game.js';

/**
 * RapidCalculationGame — 60s lightning math velocity game with 4 tactile choice buttons.
 */
export class RapidCalculationGame extends BaseGame {
  constructor(container, callbacks = {}, options = {}) {
    super(container, callbacks, options);

    this.duration = 60; // 60 seconds
    this.timeLeft = this.duration;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.correctCount = 0;
    this.totalCount = 0;
    this.accuracy = 100;
    this.reactionTimes = [];

    this.timerInterval = null;
    this.currentProblem = null;
    this.trialStartTime = 0;
    this.isPaused = false;

    this.questionDuration = 4000; // 4s per question for speed bonus bar
    this.questionTimerStart = 0;
    this.progressInterval = null;

    this.boundKeyHandler = this.handleKeyDown.bind(this);
  }

  initialize() {
    const isVi = this.options.lang === 'vi';
    const instructionText = isVi ? 'Tính nhanh kết quả đúng nhất!' : 'Calculate quickly and pick the correct answer!';

    this.container.innerHTML = `
      <div class="rapid-calc-game">
        <div class="rc-hud">
          <div class="rc-pill">⏱️ <span id="rc-time">${this.timeLeft}s</span></div>
          <div class="rc-pill">⭐ <span id="rc-score">0</span></div>
          <div class="rc-pill">🔥 <span id="rc-streak">0</span>x</div>
        </div>

        <div class="rc-speed-bar-container">
          <div class="rc-speed-bar" id="rc-speed-bar"></div>
        </div>

        <div class="rc-instruction">${instructionText}</div>

        <div class="rc-equation-box" id="rc-equation">
          <span id="rc-expr">-- + --</span> = ?
        </div>

        <div class="rc-buttons-grid" id="rc-buttons">
          <!-- 4 choice buttons -->
          <button class="rc-choice-btn" data-index="0"><span class="rc-btn-val">--</span> <span class="key-hint">(1)</span></button>
          <button class="rc-choice-btn" data-index="1"><span class="rc-btn-val">--</span> <span class="key-hint">(2)</span></button>
          <button class="rc-choice-btn" data-index="2"><span class="rc-btn-val">--</span> <span class="key-hint">(3)</span></button>
          <button class="rc-choice-btn" data-index="3"><span class="rc-btn-val">--</span> <span class="key-hint">(4)</span></button>
        </div>
      </div>
    `;

    const buttons = this.container.querySelectorAll('.rc-choice-btn');
    buttons.forEach((btn, idx) => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (this.status === 'running') {
          this.handleInput(idx);
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

    this.nextProblem();
    this.startTimer();
    this.startProgressTimer();
    this.updateHUD();
  }

  pause() {
    super.pause();
    this.isPaused = true;
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.progressInterval) clearInterval(this.progressInterval);
  }

  resume() {
    super.resume();
    this.isPaused = false;
    this.startTimer();
    this.startProgressTimer();
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.status !== 'running' || this.isPaused) return;
      this.timeLeft--;
      const timeEl = this.container.querySelector('#rc-time');
      if (timeEl) timeEl.textContent = `${this.timeLeft}s`;

      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.end();
      }
    }, 1000);
  }

  startProgressTimer() {
    if (this.progressInterval) clearInterval(this.progressInterval);
    this.questionTimerStart = performance.now();

    this.progressInterval = setInterval(() => {
      if (this.status !== 'running' || this.isPaused) return;
      const elapsed = performance.now() - this.questionTimerStart;
      const pct = Math.max(0, 100 - (elapsed / this.questionDuration) * 100);
      const barEl = this.container.querySelector('#rc-speed-bar');
      if (barEl) barEl.style.width = `${pct}%`;
    }, 50);
  }

  nextProblem() {
    if (this.status !== 'running') return;

    // Difficulty scaling for number ranges
    const diff = this.options.difficulty || 'beginner';
    let maxNum = 12;
    if (diff === 'easy') maxNum = 20;
    if (diff === 'intermediate') maxNum = 50;
    if (diff === 'advanced' || diff === 'expert') maxNum = 100;

    const ops = ['+', '-', '×', '÷'];
    const op = ops[Math.floor(Math.random() * ops.length)];

    let a = 1, b = 1, correctAnswer = 0;

    if (op === '+') {
      a = Math.floor(Math.random() * maxNum) + 1;
      b = Math.floor(Math.random() * maxNum) + 1;
      correctAnswer = a + b;
    } else if (op === '-') {
      a = Math.floor(Math.random() * maxNum) + 5;
      b = Math.floor(Math.random() * maxNum) + 1;
      if (a < b) { const temp = a; a = b; b = temp; }
      correctAnswer = a - b;
    } else if (op === '×') {
      const mMax = diff === 'beginner' ? 9 : 12;
      a = Math.floor(Math.random() * mMax) + 2;
      b = Math.floor(Math.random() * mMax) + 2;
      correctAnswer = a * b;
    } else if (op === '÷') {
      b = Math.floor(Math.random() * 10) + 2;
      const multiplier = Math.floor(Math.random() * 10) + 1;
      a = b * multiplier;
      correctAnswer = a / b;
    }

    // Generate 3 plausible near-miss distractors (±1, ±2, ±10, etc.)
    const distractorSet = new Set([correctAnswer]);
    const offsets = [-1, 1, -2, 2, -10, 10, 3, -3];
    
    while (distractorSet.size < 4) {
      const offset = offsets[Math.floor(Math.random() * offsets.length)];
      const candidate = correctAnswer + offset;
      if (candidate >= 0 && candidate !== correctAnswer) {
        distractorSet.add(candidate);
      } else {
        distractorSet.add(correctAnswer + Math.floor(Math.random() * 5) + 1);
      }
    }

    const choices = Array.from(distractorSet).sort(() => Math.random() - 0.5);
    const correctButtonIndex = choices.indexOf(correctAnswer);

    this.currentProblem = {
      exprStr: `${a} ${op} ${b}`,
      correctAnswer,
      choices,
      correctButtonIndex
    };

    this.trialStartTime = performance.now();
    this.startProgressTimer();
    this.renderProblem();
  }

  renderProblem() {
    if (!this.currentProblem) return;
    const exprEl = this.container.querySelector('#rc-expr');
    if (exprEl) exprEl.textContent = this.currentProblem.exprStr;

    const btnVals = this.container.querySelectorAll('.rc-btn-val');
    btnVals.forEach((el, idx) => {
      el.textContent = this.currentProblem.choices[idx];
    });
  }

  handleKeyDown(e) {
    if (this.status !== 'running' || this.isPaused) return;
    const key = e.key;
    if (key >= '1' && key <= '4') {
      const idx = parseInt(key, 10) - 1;
      this.handleInput(idx);
    }
  }

  handleInput(btnIndex) {
    if (this.status !== 'running' || !this.currentProblem) return;

    const reactionTime = performance.now() - this.trialStartTime;
    this.reactionTimes.push(reactionTime);
    this.totalCount++;

    const isCorrect = btnIndex === this.currentProblem.correctButtonIndex;

    if (isCorrect) {
      this.correctCount++;
      this.streak++;
      if (this.streak > this.maxStreak) this.maxStreak = this.streak;

      // Speed bonus based on progress bar completion
      const speedBonus = reactionTime < 2000 ? 15 : 5;
      const points = 10 + (this.streak * 2) + speedBonus;
      this.score += points;

      if (this.callbacks.audio) {
        this.callbacks.audio.correct(this.streak);
      }
      this.flashButton(btnIndex, 'correct');
    } else {
      this.streak = 0;
      if (this.callbacks.audio) {
        this.callbacks.audio.wrong();
      }
      this.flashButton(btnIndex, 'wrong');
      // Highlight correct button too
      this.flashButton(this.currentProblem.correctButtonIndex, 'correct-highlight');
    }

    this.updateAccuracy();
    this.updateHUD();

    if (this.callbacks.onScoreUpdate) {
      this.callbacks.onScoreUpdate({
        score: this.score,
        accuracy: this.accuracy
      });
    }

    setTimeout(() => {
      if (this.status === 'running') {
        this.nextProblem();
      }
    }, 300);
  }

  flashButton(index, className) {
    const buttons = this.container.querySelectorAll('.rc-choice-btn');
    if (buttons[index]) {
      buttons[index].classList.add(className);
      setTimeout(() => {
        buttons[index].classList.remove(className);
      }, 300);
    }
  }

  updateAccuracy() {
    if (this.totalCount === 0) {
      this.accuracy = 100;
    } else {
      this.accuracy = Math.round((this.correctCount / this.totalCount) * 100);
    }
  }

  updateHUD() {
    const scoreEl = this.container.querySelector('#rc-score');
    const streakEl = this.container.querySelector('#rc-streak');
    if (scoreEl) scoreEl.textContent = this.score;
    if (streakEl) streakEl.textContent = this.streak;
  }

  update(dt) {}
  render() {}

  calculateScore() {
    this.updateAccuracy();
    const avgReaction = this.reactionTimes.length > 0
      ? Math.round(this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length)
      : 800;

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
    if (this.progressInterval) clearInterval(this.progressInterval);
    window.removeEventListener('keydown', this.boundKeyHandler);
    super.destroy();
  }
}
