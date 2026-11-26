import { BaseGame } from '../base-game.js';
import { renderNumpad, bindNumpad } from '../../ui/components/numpad.js';

export class NumberMemoryGame extends BaseGame {
  constructor(container, callbacks = {}, options = {}) {
    super(container, callbacks, options);
    
    const diff = this.options.difficulty || 'beginner';
    if (diff === 'beginner' || diff === 'easy') {
      this.digitLength = 3;
    } else if (diff === 'intermediate') {
      this.digitLength = 4;
    } else {
      this.digitLength = 5;
    }

    this.score = 0;
    this.round = 1;
    this.maxRounds = 12;
    this.lives = 3;
    this.mistakes = 0;
    this.correctCount = 0;
    this.reactionTimes = [];

    this.targetNumber = '';
    this.typedNumber = '';
    this.phase = 'memorize'; // 'memorize' | 'recall' | 'feedback'
    this.timer = null;
    this.rafId = null;
    this.progressWidth = 100;
    this.feedbackState = null; // 'correct' | 'wrong'

    this.unbindNumpad = null;
    this.roundStartTime = 0;
  }

  initialize() {
    this.renderShell();
    this.startRound();
  }

  renderShell() {
    const lang = this.options.lang;
    const memorizeText = lang === 'vi' ? 'Hãy ghi nhớ con số...' : 'Memorize the number...';
    
    this.container.innerHTML = `
      <div class="nf-game-shell number-memory-game">
        <div class="nf-status-pills">
          <div class="nf-pill"><span id="nm-round-label">${lang === 'vi' ? 'Vòng' : 'Round'}</span>: <span id="nm-round">${this.round}</span>/${this.maxRounds}</div>
          <div class="nf-pill"><span id="nm-score-label">Score</span>: <span id="nm-score">${this.score}</span></div>
          <div class="nf-pill"><span id="nm-lives-label">Lives</span>: <span id="nm-lives">${'❤️'.repeat(this.lives)}</span></div>
        </div>
        
        <div class="nf-timer-bar" style="margin: 12px 0;">
          <div class="nf-timer-fill" id="nm-timer-fill" style="width: 100%;"></div>
        </div>

        <div class="nf-prompt-card" style="text-align: center; padding: 24px; margin-bottom: 16px;">
          <div id="nm-instruction" style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 12px; font-weight: 600;">${memorizeText}</div>
          <div id="nm-display-area" style="font-size: 2.4rem; letter-spacing: 0.14em; font-weight: 800; font-family: monospace; color: var(--brand-primary); min-height: 60px; display: flex; align-items: center; justify-content: center;"></div>
        </div>

        <div id="nm-input-area" style="display: none;">
          <div style="background: var(--bg-surface); border: 2px solid var(--border-strong, #e2e8f0); border-radius: 12px; padding: 12px; margin-bottom: 16px; text-align: center;">
            <div style="font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">${lang === 'vi' ? 'Số bạn nhập' : 'Your Input'}</div>
            <div id="nm-typed-display" style="font-size: 2rem; font-weight: 700; letter-spacing: 0.12em; font-family: monospace; min-height: 44px; color: var(--text-primary);">&#8203;</div>
          </div>
          <div id="nm-numpad-container">
            ${renderNumpad({ submitLabel: lang === 'vi' ? 'Gửi / Xác nhận' : 'Submit' })}
          </div>
        </div>
      </div>
    `;

    const numpadEl = this.container.querySelector('#nm-numpad-container');
    if (numpadEl) {
      this.unbindNumpad = bindNumpad(numpadEl, {
        onDigit: (d) => this.handleDigitInput(d),
        onBackspace: () => this.handleBackspace(),
        onClear: () => this.handleClear(),
        onSubmit: () => this.handleSubmit()
      });
    }
  }

  start() {
    super.start();
  }

  pause() {
    super.pause();
    if (this.timer) clearTimeout(this.timer);
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  resume() {
    super.resume();
  }

  startRound() {
    if (this.status === 'ended') return;
    this.phase = 'memorize';
    this.typedNumber = '';
    this.feedbackState = null;

    // Generate random number of length this.digitLength
    let min = Math.pow(10, this.digitLength - 1);
    let max = Math.pow(10, this.digitLength) - 1;
    if (this.digitLength === 1) { min = 0; max = 9; }
    const numVal = Math.floor(min + Math.random() * (max - min + 1));
    this.targetNumber = String(numVal);

    const displayArea = this.container.querySelector('#nm-display-area');
    const inputArea = this.container.querySelector('#nm-input-area');
    const instruction = this.container.querySelector('#nm-instruction');
    const lang = this.options.lang;

    if (displayArea) displayArea.textContent = this.targetNumber;
    if (inputArea) inputArea.style.display = 'none';
    if (instruction) {
      instruction.textContent = lang === 'vi' ? `Vòng ${this.round}: Hãy ghi nhớ con số...` : `Round ${this.round}: Memorize the number...`;
      instruction.style.color = 'var(--text-secondary)';
    }

    this.updateHUD();

    // Memorization duration: 1800ms + length * 380ms
    const memorizeDuration = 1800 + this.digitLength * 380;
    const startTime = performance.now();
    const timerFill = this.container.querySelector('#nm-timer-fill');

    const animateBar = (now) => {
      if (this.status !== 'running' || this.phase !== 'memorize') return;
      const elapsed = now - startTime;
      const progress = Math.max(0, 100 - (elapsed / memorizeDuration) * 100);
      if (timerFill) timerFill.style.width = `${progress}%`;

      if (elapsed < memorizeDuration) {
        this.rafId = requestAnimationFrame(animateBar);
      } else {
        this.enterRecallPhase();
      }
    };

    this.rafId = requestAnimationFrame(animateBar);
  }

  enterRecallPhase() {
    this.phase = 'recall';
    this.roundStartTime = performance.now();

    const displayArea = this.container.querySelector('#nm-display-area');
    const inputArea = this.container.querySelector('#nm-input-area');
    const instruction = this.container.querySelector('#nm-instruction');
    const timerFill = this.container.querySelector('#nm-timer-fill');
    const lang = this.options.lang;

    if (displayArea) displayArea.textContent = '•'.repeat(this.digitLength);
    if (inputArea) inputArea.style.display = 'block';
    if (instruction) {
      instruction.textContent = lang === 'vi' ? 'Nhập lại con số bạn vừa thấy:' : 'Enter the number you just saw:';
      instruction.style.color = 'var(--brand-primary)';
    }
    if (timerFill) timerFill.style.width = '100%';
  }

  handleDigitInput(digit) {
    if (this.status !== 'running' || this.phase !== 'recall') return;
    if (this.typedNumber.length < this.digitLength + 4) { // allow some buffer
      this.typedNumber += digit;
      this.updateTypedDisplay();
      if (this.callbacks.audio?.tap) this.callbacks.audio.tap();
    }
  }

  handleBackspace() {
    if (this.status !== 'running' || this.phase !== 'recall') return;
    if (this.typedNumber.length > 0) {
      this.typedNumber = this.typedNumber.slice(0, -1);
      this.updateTypedDisplay();
      if (this.callbacks.audio?.tap) this.callbacks.audio.tap();
    }
  }

  handleClear() {
    if (this.status !== 'running' || this.phase !== 'recall') return;
    this.typedNumber = '';
    this.updateTypedDisplay();
  }

  updateTypedDisplay() {
    const typedDisplay = this.container.querySelector('#nm-typed-display');
    if (typedDisplay) {
      typedDisplay.textContent = this.typedNumber || '\u200B';
    }
  }

  handleSubmit() {
    if (this.status !== 'running' || this.phase !== 'recall') return;
    if (!this.typedNumber) return;

    const reactionTime = performance.now() - this.roundStartTime;
    this.reactionTimes.push(reactionTime);

    const isCorrect = this.typedNumber === this.targetNumber;
    this.phase = 'feedback';

    const displayArea = this.container.querySelector('#nm-display-area');
    const inputArea = this.container.querySelector('#nm-input-area');
    const instruction = this.container.querySelector('#nm-instruction');
    const lang = this.options.lang;

    if (inputArea) inputArea.style.display = 'none';

    if (isCorrect) {
      this.correctCount++;
      const earnedPts = 25 * this.digitLength;
      this.score += earnedPts;
      if (this.callbacks.audio?.correct) this.callbacks.audio.correct(this.correctCount);

      if (displayArea) {
        displayArea.innerHTML = `<span style="color: var(--success, #10B981);">✓ ${this.targetNumber} (+${earnedPts} pts)</span>`;
      }
      if (instruction) {
        instruction.textContent = lang === 'vi' ? 'Chính xác! Tuyệt vời!' : 'Correct! Excellent!';
        instruction.style.color = 'var(--success, #10B981)';
      }

      // Grow digit length if successful
      if (this.digitLength < 12) {
        this.digitLength++;
      }
    } else {
      this.mistakes++;
      this.lives--;
      if (this.callbacks.audio?.wrong) this.callbacks.audio.wrong();

      if (displayArea) {
        displayArea.innerHTML = `<span style="color: var(--danger, #EF4444);">✗ ${this.targetNumber} <span style="font-size:1.4rem; color:var(--text-secondary);">(nhập: ${this.typedNumber})</span></span>`;
      }
      if (instruction) {
        instruction.textContent = lang === 'vi' ? 'Sai rồi! Đáp án đúng ở trên.' : 'Incorrect! Correct answer shown above.';
        instruction.style.color = 'var(--danger, #EF4444)';
      }
    }

    this.updateHUD();

    // Wait 1500ms then next round or end
    this.timer = setTimeout(() => {
      if (this.status !== 'running') return;
      this.round++;
      if (this.lives <= 0 || this.round > this.maxRounds) {
        this.end();
      } else {
        this.startRound();
      }
    }, 1600);
  }

  handleInput(input) {
    if (typeof input === 'string') {
      if (input >= '0' && input <= '9') {
        this.handleDigitInput(input);
      } else if (input === 'Backspace') {
        this.handleBackspace();
      } else if (input === 'Enter') {
        this.handleSubmit();
      }
    }
  }

  update(dt) {
    // handled via requestAnimationFrame
  }

  render() {
    this.updateHUD();
  }

  updateHUD() {
    const roundEl = this.container.querySelector('#nm-round');
    const scoreEl = this.container.querySelector('#nm-score');
    const livesEl = this.container.querySelector('#nm-lives');

    if (roundEl) roundEl.textContent = this.round;
    if (scoreEl) scoreEl.textContent = this.score;
    if (livesEl) livesEl.textContent = '❤️'.repeat(Math.max(0, this.lives));

    if (this.callbacks.onScoreUpdate) {
      this.callbacks.onScoreUpdate({ score: this.score, accuracy: this.getAccuracy() });
    }
  }

  getAccuracy() {
    const total = this.correctCount + this.mistakes;
    if (total === 0) return 100;
    return Math.round((this.correctCount / total) * 100);
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
    if (this.timer) clearTimeout(this.timer);
    if (this.rafId) cancelAnimationFrame(this.rafId);
    super.end();
  }

  destroy() {
    if (this.timer) clearTimeout(this.timer);
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.unbindNumpad) this.unbindNumpad();
    super.destroy();
  }
}
