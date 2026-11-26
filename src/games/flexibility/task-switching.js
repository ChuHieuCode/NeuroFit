import { BaseGame } from '../base-game.js';

/**
 * TaskSwitchingGame (Game #20) — 60s Monsell Task-Switching Game (Bilingual EN/VI)
 * Rule Cue Pill: Number Rule (Even vs Odd) in Indigo OR Letter Rule (Vowel vs Consonant) in Rose.
 * Center card: Letter+Digit pair (e.g. A7, K4, E2, M9).
 * Two bottom buttons dynamically showing left vs right depending on the active rule.
 */
export class TaskSwitchingGame extends BaseGame {
  constructor(container, callbacks = {}, options = {}) {
    super(container, callbacks, options);
    this.duration = 60; // 60 seconds
    this.timeLeft = this.duration;
    this.score = 0;
    this.correctCount = 0;
    this.totalAttempts = 0;
    this.switchCount = 0;
    this.switchCorrect = 0;
    this.reactionTimes = [];
    
    this.lang = this.options.lang === 'vi' ? 'vi' : 'en';
    this.currentRule = 'number'; // 'number' (even/odd) or 'letter' (vowel/consonant)
    this.ruleTrialsRemaining = 3;
    this.currentPair = { letter: 'A', digit: 7, isEven: false, isVowel: true };
    
    this.trialStartTime = 0;
    this.timerInterval = null;
    this.isPausedOrEnded = false;

    this.letters = ['A', 'E', 'I', 'O', 'K', 'M', 'N', 'P', 'R', 'S', 'T']; // Vowels: A, E, I, O
    this.vowels = new Set(['A', 'E', 'I', 'O', 'U']);
  }

  initialize() {
    const isVi = this.lang === 'vi';
    this.container.innerHTML = `
      <div class="neuro-game task-switching-game" style="display:flex; flex-direction:column; align-items:center; justify-content:space-between; height:100%; padding:16px; background:#0f172a; color:#f8fafc; font-family:sans-serif; user-select:none;">
        <div class="ts-hud" style="display:flex; justify-content:space-between; width:100%; max-width:500px; font-size:16px; font-weight:600;">
          <div>⏱️ <span id="ts-time">${this.timeLeft}</span>s</div>
          <div>🏆 <span id="ts-score">0</span></div>
          <div>🎯 <span id="ts-acc">100</span>%</div>
        </div>

        <div id="ts-cue-pill" style="padding:10px 20px; border-radius:9999px; font-weight:bold; font-size:16px; text-transform:uppercase; letter-spacing:1px; transition:all 0.2s ease; border:3px solid transparent;">
          ${isVi ? 'Đang tải quy tắc...' : 'Loading rule...'}
        </div>

        <div id="ts-card" style="background:#1e293b; border:4px solid #334155; border-radius:24px; width:160px; height:200px; display:flex; align-items:center; justify-content:center; font-size:64px; font-weight:800; box-shadow:0 10px 25px rgba(0,0,0,0.5); transition: transform 0.15s ease;">
          A7
        </div>

        <div class="ts-buttons" style="display:grid; grid-template-columns:1fr 1fr; gap:16px; width:100%; max-width:500px; margin-bottom:12px;">
          <button id="ts-btn-left" style="min-height:56px; border-radius:16px; border:none; background:#6366f1; color:#fff; font-size:18px; font-weight:bold; cursor:pointer; box-shadow:0 4px 12px rgba(99,102,241,0.4); active:scale:0.96; transition:all 0.1s;">
            Left
          </button>
          <button id="ts-btn-right" style="min-height:56px; border-radius:16px; border:none; background:#ec4899; color:#fff; font-size:18px; font-weight:bold; cursor:pointer; box-shadow:0 4px 12px rgba(236,72,153,0.4); active:scale:0.96; transition:all 0.1s;">
            Right
          </button>
        </div>
      </div>
    `;

    this.container.querySelector('#ts-btn-left').addEventListener('click', () => this.handleAnswer('left'));
    this.container.querySelector('#ts-btn-right').addEventListener('click', () => this.handleAnswer('right'));
  }

  start() {
    super.start();
    this.isPausedOrEnded = false;
    this.nextTrial();
    this.timerInterval = setInterval(() => {
      if (this.status !== 'running') return;
      this.timeLeft--;
      const timeEl = this.container.querySelector('#ts-time');
      if (timeEl) timeEl.textContent = this.timeLeft;
      if (this.timeLeft <= 0) {
        this.end();
      }
    }, 1000);
  }

  pause() {
    super.pause();
    this.isPausedOrEnded = true;
  }

  resume() {
    super.resume();
    this.isPausedOrEnded = false;
  }

  nextTrial() {
    if (this.status !== 'running') return;

    this.ruleTrialsRemaining--;
    if (this.ruleTrialsRemaining <= 0) {
      const prevRule = this.currentRule;
      this.currentRule = Math.random() < 0.5 ? 'number' : 'letter';
      if (this.currentRule === prevRule) {
        this.currentRule = prevRule === 'number' ? 'letter' : 'number';
      }
      this.ruleTrialsRemaining = Math.floor(Math.random() * 3) + 2;
      this.switchCount++;
    }

    const letter = this.letters[Math.floor(Math.random() * this.letters.length)];
    const digit = Math.floor(Math.random() * 9) + 1;
    const isVowel = this.vowels.has(letter);
    const isEven = digit % 2 === 0;

    this.currentPair = { letter, digit, isVowel, isEven };

    const cardEl = this.container.querySelector('#ts-card');
    if (cardEl) {
      cardEl.textContent = `${letter}${digit}`;
      cardEl.style.transform = 'scale(1.05)';
      setTimeout(() => { if (cardEl) cardEl.style.transform = 'scale(1)'; }, 120);
    }

    this.updateCueAndButtons();
    this.trialStartTime = performance.now();
  }

  updateCueAndButtons() {
    const isVi = this.lang === 'vi';
    const cueEl = this.container.querySelector('#ts-cue-pill');
    const btnLeft = this.container.querySelector('#ts-btn-left');
    const btnRight = this.container.querySelector('#ts-btn-right');

    if (!cueEl || !btnLeft || !btnRight) return;

    if (this.currentRule === 'number') {
      cueEl.style.background = 'rgba(99, 102, 241, 0.2)';
      cueEl.style.borderColor = '#6366f1';
      cueEl.style.color = '#818cf8';
      cueEl.textContent = isVi ? 'QUY TẮC SỐ: CHẴN (Trái) vs LẺ (Phải)' : 'NUMBER RULE: EVEN (Left) vs ODD (Right)';
      btnLeft.textContent = isVi ? 'CHẴN (Even)' : 'EVEN';
      btnRight.textContent = isVi ? 'LẺ (Odd)' : 'ODD';
      btnLeft.style.background = '#4f46e5';
      btnRight.style.background = '#6366f1';
    } else {
      cueEl.style.background = 'rgba(236, 72, 153, 0.2)';
      cueEl.style.borderColor = '#ec4899';
      cueEl.style.color = '#f472b6';
      cueEl.textContent = isVi ? 'QUY TẮC CHỮ: NGUYÊN ÂM (Trái) vs PHỤ ÂM (Phải)' : 'LETTER RULE: VOWEL (Left) vs CONSONANT (Right)';
      btnLeft.textContent = isVi ? 'NGUYÊN ÂM (Vowel)' : 'VOWEL';
      btnRight.textContent = isVi ? 'PHỤ ÂM (Consonant)' : 'CONSONANT';
      btnLeft.style.background = '#db2777';
      btnRight.style.background = '#ec4899';
    }
  }

  handleAnswer(side) {
    if (this.status !== 'running') return;
    const rt = performance.now() - this.trialStartTime;
    this.reactionTimes.push(rt);
    this.totalAttempts++;

    let isCorrect = false;
    if (this.currentRule === 'number') {
      const correctSide = this.currentPair.isEven ? 'left' : 'right';
      isCorrect = side === correctSide;
    } else {
      const correctSide = this.currentPair.isVowel ? 'left' : 'right';
      isCorrect = side === correctSide;
    }

    if (isCorrect) {
      this.correctCount++;
      this.score += Math.max(10, Math.round(100 - rt / 10));
      if (this.callbacks.audio?.tap) this.callbacks.audio.tap();
    } else {
      this.score = Math.max(0, this.score - 5);
      if (this.callbacks.audio?.error) this.callbacks.audio.error();
    }

    const accuracy = Math.round((this.correctCount / this.totalAttempts) * 100);
    const scoreEl = this.container.querySelector('#ts-score');
    const accEl = this.container.querySelector('#ts-acc');
    if (scoreEl) scoreEl.textContent = this.score;
    if (accEl) accEl.textContent = accuracy;

    if (this.callbacks.onScoreUpdate) {
      this.callbacks.onScoreUpdate({ score: this.score, accuracy });
    }

    this.nextTrial();
  }

  handleInput(input) {
    if (input === 'left' || input === 'right') {
      this.handleAnswer(input);
    }
  }

  update(dt) {}

  render() {}

  calculateScore() {
    const accuracy = this.totalAttempts > 0 ? Math.round((this.correctCount / this.totalAttempts) * 100) : 100;
    const avgRt = this.reactionTimes.length > 0 ? Math.round(this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length) : 0;
    return {
      score: this.score,
      accuracy,
      correctCount: this.correctCount,
      totalAttempts: this.totalAttempts,
      reactionMs: avgRt
    };
  }

  end() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    super.end();
  }

  destroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    super.destroy();
  }
}
