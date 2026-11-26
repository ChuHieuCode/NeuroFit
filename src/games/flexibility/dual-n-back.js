import { BaseGame } from '../base-game.js';

/**
 * DualNBackGame (Game #22) — Authentic Dual N-Back (22 step sequence per session, 2500ms per step)
 * N=1 beginner, N=2 easy/intermediate/advanced, N=3 expert.
 * Grid 3x3 + Letter Cues ['C', 'H', 'K', 'L', 'Q', 'R', 'S', 'T'] + audio & speaker badge.
 * Position Match (A) & Sound Match (L).
 */
export class DualNBackGame extends BaseGame {
  constructor(container, callbacks = {}, options = {}) {
    super(container, callbacks, options);
    const diff = options.difficulty || 'easy';
    this.nLevel = diff === 'beginner' ? 1 : (diff === 'expert' ? 3 : 2);
    this.totalSteps = 22;
    this.stepIntervalMs = 2500;

    this.letters = ['C', 'H', 'K', 'L', 'Q', 'R', 'S', 'T'];
    this.sequence = []; // array of { pos: 0..8, letter: string }
    this.currentStepIndex = -1;
    this.score = 0;
    this.hits = 0;
    this.misses = 0;
    this.falseAlarms = 0;
    this.totalOpportunities = 0;

    // Player inputs for current step
    this.posMatchedThisStep = false;
    this.soundMatchedThisStep = false;
    this.posAnsweredThisStep = false;
    this.soundAnsweredThisStep = false;

    this.stepTimer = null;
    this.lang = this.options.lang === 'vi' ? 'vi' : 'en';
  }

  initialize() {
    const isVi = this.lang === 'vi';
    const nLabel = `${this.nLevel}-BACK`;

    this.container.innerHTML = `
      <div class="neuro-game dual-n-back-game" style="display:flex; flex-direction:column; align-items:center; justify-content:space-between; height:100%; padding:16px; background:#0f172a; color:#f8fafc; font-family:sans-serif; user-select:none;">
        <div class="dnb-hud" style="display:flex; justify-content:space-between; width:100%; max-width:400px; font-size:16px; font-weight:600;">
          <div>Step: <span id="dnb-step">0</span>/${this.totalSteps}</div>
          <div style="background:#4f46e5; padding:2px 10px; border-radius:8px; font-weight:bold;">${nLabel}</div>
          <div>🏆 <span id="dnb-score">0</span></div>
        </div>

        <div id="dnb-speaker-badge" style="background:#1e293b; border:2px solid #334155; padding:8px 16px; border-radius:12px; font-size:18px; font-weight:bold; color:#38bdf8; display:flex; align-items:center; gap:8px; min-height:44px;">
          🔊 <span id="dnb-letter-display">—</span>
        </div>

        <!-- 3x3 Grid -->
        <div class="dnb-grid" style="display:grid; grid-template-columns:repeat(3, 80px); grid-template-rows:repeat(3, 80px); gap:12px;">
          ${Array.from({ length: 9 }, (_, i) => `
            <div class="dnb-cell" data-index="${i}" style="background:#1e293b; border:3px solid #334155; border-radius:16px; transition:all 0.1s ease;"></div>
          `).join('')}
        </div>

        <!-- Two large toggleable thumb buttons -->
        <div class="dnb-buttons" style="display:grid; grid-template-columns:1fr 1fr; gap:16px; width:100%; max-width:400px; margin-bottom:8px;">
          <button id="dnb-btn-pos" style="min-height:64px; border-radius:16px; border:none; background:#3b82f6; color:#fff; font-size:16px; font-weight:bold; cursor:pointer; box-shadow:0 4px 12px rgba(59,130,246,0.4); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px;">
            <span>📍 ${isVi ? 'Vị trí (Pos)' : 'Position Match'}</span>
            <span style="font-size:11px; opacity:0.8;">[Key: A]</span>
          </button>
          <button id="dnb-btn-snd" style="min-height:64px; border-radius:16px; border:none; background:#ec4899; color:#fff; font-size:16px; font-weight:bold; cursor:pointer; box-shadow:0 4px 12px rgba(236,72,153,0.4); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px;">
            <span>🔊 ${isVi ? 'Âm thanh (Snd)' : 'Sound Match'}</span>
            <span style="font-size:11px; opacity:0.8;">[Key: L]</span>
          </button>
        </div>
      </div>
    `;

    this.container.querySelector('#dnb-btn-pos').addEventListener('click', () => this.handlePlayerMatch('pos'));
    this.container.querySelector('#dnb-btn-snd').addEventListener('click', () => this.handlePlayerMatch('snd'));

    window.addEventListener('keydown', (e) => {
      if (this.status !== 'running') return;
      if (e.key.toLowerCase() === 'a') this.handlePlayerMatch('pos');
      if (e.key.toLowerCase() === 'l') this.handlePlayerMatch('snd');
    });

    this.generateSequence();
  }

  generateSequence() {
    this.sequence = [];
    for (let i = 0; i < this.totalSteps; i++) {
      let pos = Math.floor(Math.random() * 9);
      let letter = this.letters[Math.floor(Math.random() * this.letters.length)];

      // ~30-35% match probability if i >= nLevel
      if (i >= this.nLevel) {
        if (Math.random() < 0.33) {
          pos = this.sequence[i - this.nLevel].pos;
        }
        if (Math.random() < 0.33) {
          letter = this.sequence[i - this.nLevel].letter;
        }
      }
      this.sequence.push({ pos, letter });
    }
  }

  start() {
    super.start();
    this.nextStep();
  }

  pause() { super.pause(); }
  resume() { super.resume(); }

  nextStep() {
    if (this.status !== 'running') return;
    this.currentStepIndex++;

    if (this.currentStepIndex >= this.totalSteps) {
      this.end();
      return;
    }

    // Reset input flags for this step
    this.posMatchedThisStep = false;
    this.soundMatchedThisStep = false;
    this.posAnsweredThisStep = false;
    this.soundAnsweredThisStep = false;

    const stepData = this.sequence[this.currentStepIndex];
    const stepEl = this.container.querySelector('#dnb-step');
    if (stepEl) stepEl.textContent = this.currentStepIndex + 1;

    // Highlight cell
    const cells = this.container.querySelectorAll('.dnb-cell');
    cells.forEach((c, idx) => {
      if (idx === stepData.pos) {
        c.style.background = '#6366f1';
        c.style.borderColor = '#818cf8';
        c.style.boxShadow = '0 0 20px rgba(99,102,241,0.8)';
      } else {
        c.style.background = '#1e293b';
        c.style.borderColor = '#334155';
        c.style.boxShadow = 'none';
      }
    });

    // Display letter badge & play audio/speech
    const letterDisplay = this.container.querySelector('#dnb-letter-display');
    if (letterDisplay) letterDisplay.textContent = stepData.letter;

    if (this.callbacks.audio?.tap) this.callbacks.audio.tap();

    if ('speechSynthesis' in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(stepData.letter);
        utterance.rate = 1.1;
        window.speechSynthesis.speak(utterance);
      } catch (e) {}
    }

    // Schedule next step
    this.stepTimer = setTimeout(() => {
      this.evaluateStepCompletion();
      this.nextStep();
    }, this.stepIntervalMs);
  }

  evaluateStepCompletion() {
    if (this.currentStepIndex < this.nLevel) return; // No N-Back comparison possible yet

    const target = this.sequence[this.currentStepIndex];
    const nBackTarget = this.sequence[this.currentStepIndex - this.nLevel];

    const isPosMatch = target.pos === nBackTarget.pos;
    const isSoundMatch = target.letter === nBackTarget.letter;

    this.totalOpportunities += 2;

    // Evaluate Position
    if (isPosMatch) {
      if (this.posMatchedThisStep) {
        this.hits++;
        this.score += 50;
      } else {
        this.misses++;
      }
    } else {
      if (this.posMatchedThisStep) {
        this.falseAlarms++;
        this.score = Math.max(0, this.score - 20);
      }
    }

    // Evaluate Sound
    if (isSoundMatch) {
      if (this.soundMatchedThisStep) {
        this.hits++;
        this.score += 50;
      } else {
        this.misses++;
      }
    } else {
      if (this.soundMatchedThisStep) {
        this.falseAlarms++;
        this.score = Math.max(0, this.score - 20);
      }
    }

    const accuracy = Math.max(0, Math.round(((this.hits) / (this.hits + this.misses + this.falseAlarms || 1)) * 100));
    const scoreEl = this.container.querySelector('#dnb-score');
    if (scoreEl) scoreEl.textContent = this.score;

    if (this.callbacks.onScoreUpdate) {
      this.callbacks.onScoreUpdate({ score: this.score, accuracy });
    }
  }

  handlePlayerMatch(type) {
    if (this.status !== 'running') return;
    if (this.currentStepIndex < this.nLevel) return;

    if (type === 'pos' && !this.posAnsweredThisStep) {
      this.posMatchedThisStep = true;
      this.posAnsweredThisStep = true;
      const btn = this.container.querySelector('#dnb-btn-pos');
      if (btn) {
        btn.style.background = '#2563eb';
        setTimeout(() => { if (btn) btn.style.background = '#3b82f6'; }, 200);
      }
    } else if (type === 'snd' && !this.soundAnsweredThisStep) {
      this.soundMatchedThisStep = true;
      this.soundAnsweredThisStep = true;
      const btn = this.container.querySelector('#dnb-btn-snd');
      if (btn) {
        btn.style.background = '#db2777';
        setTimeout(() => { if (btn) btn.style.background = '#ec4899'; }, 200);
      }
    }
  }

  handleInput(input) {
    if (input === 'pos' || input === 'snd') this.handlePlayerMatch(input);
  }

  update(dt) {}
  render() {}

  calculateScore() {
    const totalPossible = this.totalOpportunities || 1;
    const accuracy = Math.max(0, Math.round((this.hits / totalPossible) * 100));
    return {
      score: this.score,
      accuracy,
      hits: this.hits,
      misses: this.misses,
      falseAlarms: this.falseAlarms
    };
  }

  end() {
    if (this.stepTimer) clearTimeout(this.stepTimer);
    super.end();
  }

  destroy() {
    if (this.stepTimer) clearTimeout(this.stepTimer);
    super.destroy();
  }
}
