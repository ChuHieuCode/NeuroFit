import { BaseGame } from '../base-game.js';

export class CardMatchingGame extends BaseGame {
  constructor(container, callbacks = {}, options = {}) {
    super(container, callbacks, options);

    const diff = this.options.difficulty || 'beginner';
    if (diff === 'beginner' || diff === 'easy') {
      this.cols = 4;
      this.rows = 3; // 12 cards = 6 pairs
    } else if (diff === 'intermediate' || diff === 'advanced') {
      this.cols = 4;
      this.rows = 4; // 16 cards = 8 pairs
    } else {
      this.cols = 5;
      this.rows = 4; // 20 cards = 10 pairs
    }

    this.timeLeft = 75;
    this.score = 0;
    this.moves = 0;
    this.matchedPairs = 0;
    this.totalPairsTarget = (this.cols * this.rows) / 2;
    this.mistakes = 0;
    this.combo = 0;
    this.accuracy = 100;
    this.reactionTimes = [];

    this.cards = [];
    this.firstSelectedCard = null;
    this.isLocked = false;
    this.timer = null;
    this.roundStartTime = 0;
  }

  initialize() {
    this.renderShell();
    this.generateBoard();
  }

  renderShell() {
    const lang = this.options.lang;
    this.container.innerHTML = `
      <div class="nf-game-shell card-matching-game">
        <div class="nf-status-pills">
          <div class="nf-pill"><span id="cm-time-label">Time</span>: <span id="cm-time">${this.timeLeft}</span>s</div>
          <div class="nf-pill">Pairs: <span id="cm-pairs">0</span>/${this.totalPairsTarget}</div>
          <div class="nf-pill">Score: <span id="cm-score">0</span></div>
        </div>

        <div class="nf-timer-bar" style="margin: 10px 0;">
          <div class="nf-timer-fill" id="cm-timer-fill" style="width: 100%;"></div>
        </div>

        <div id="cm-grid" style="display: grid; grid-template-columns: repeat(${this.cols}, 1fr); gap: 8px; max-width: 420px; margin: 0 auto;"></div>
      </div>
    `;
  }

  generateBoard() {
    const totalCards = this.cols * this.rows;
    const numPairs = totalCards / 2;

    // Crisp inline geometric / wellness SVG symbols
    const svgs = [
      '<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="9"/></svg>',
      '<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>',
      '<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none"><polygon points="12 2 22 22 2 22"/></svg>',
      '<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
      '<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
      '<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
      '<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>',
      '<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
      '<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      '<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
    ];

    let selectedSvgs = svgs.slice(0, numPairs);
    let cardPool = [...selectedSvgs, ...selectedSvgs];
    // Shuffle
    cardPool.sort(() => Math.random() - 0.5);

    this.cards = cardPool.map((svg, index) => ({
      id: index,
      svg,
      isFlipped: false,
      isMatched: false
    }));

    const gridEl = this.container.querySelector('#cm-grid');
    if (!gridEl) return;
    gridEl.innerHTML = '';

    this.cards.forEach((card, idx) => {
      const btn = document.createElement('button');
      btn.className = 'cm-card';
      btn.dataset.index = idx;
      btn.setAttribute('aria-label', `Card ${idx + 1}`);
      btn.style.cssText = `
        aspect-ratio: 1;
        background: var(--bg-surface);
        border: 2px solid var(--border-strong, #cbd5e1);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s ease, background 0.2s ease;
        color: var(--brand-primary);
        font-size: 1.5rem;
      `;
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.handleCardClick(idx);
      });
      gridEl.appendChild(btn);
    });
  }

  start() {
    super.start();
    this.roundStartTime = performance.now();
    this.timer = setInterval(() => {
      if (this.status !== 'running') return;
      this.timeLeft--;
      const timeEl = this.container.querySelector('#cm-time');
      const timerFill = this.container.querySelector('#cm-timer-fill');
      if (timeEl) timeEl.textContent = this.timeLeft;
      if (timerFill) timerFill.style.width = `${(this.timeLeft / 75) * 100}%`;

      if (this.timeLeft <= 0) {
        this.end();
      }
    }, 1000);
  }

  pause() {
    super.pause();
    if (this.timer) clearInterval(this.timer);
  }

  resume() {
    super.resume();
  }

  handleCardClick(index) {
    if (this.status !== 'running' || this.isLocked) return;
    const card = this.cards[index];
    if (card.isFlipped || card.isMatched) return;

    const startTime = performance.now();
    card.isFlipped = true;
    this.renderCardsState();
    if (this.callbacks.audio?.tap) this.callbacks.audio.tap();

    if (!this.firstSelectedCard) {
      this.firstSelectedCard = card;
    } else {
      this.moves++;
      this.isLocked = true;
      const first = this.firstSelectedCard;
      this.firstSelectedCard = null;

      if (first.svg === card.svg) {
        // Match!
        first.isMatched = true;
        card.isMatched = true;
        this.matchedPairs++;
        this.combo++;
        this.score += 25 * this.combo;
        if (this.callbacks.audio?.correct) this.callbacks.audio.correct(this.combo);

        this.reactionTimes.push(performance.now() - startTime);
        this.isLocked = false;
        this.renderCardsState();
        this.updateHUD();

        // Check if board cleared
        if (this.matchedPairs === this.totalPairsTarget) {
          // Bonus time + fresh board
          this.timeLeft += 15;
          this.matchedPairs = 0;
          this.generateBoard();
        }
      } else {
        // Mismatch
        this.mistakes++;
        this.combo = 0;
        if (this.callbacks.audio?.wrong) this.callbacks.audio.wrong();
        this.updateHUD();

        setTimeout(() => {
          if (this.status !== 'running') return;
          first.isFlipped = false;
          card.isFlipped = false;
          this.isLocked = false;
          this.renderCardsState();
        }, 650);
      }
    }
  }

  renderCardsState() {
    const cardBtns = this.container.querySelectorAll('.cm-card');
    cardBtns.forEach((btn, idx) => {
      const card = this.cards[idx];
      if (card.isMatched) {
        btn.style.background = 'rgba(16, 185, 129, 0.15)';
        btn.style.borderColor = 'var(--success, #10B981)';
        btn.innerHTML = card.svg;
        btn.style.opacity = '0.6';
        btn.style.cursor = 'default';
      } else if (card.isFlipped) {
        btn.style.background = 'var(--bg-surface)';
        btn.style.borderColor = 'var(--brand-primary)';
        btn.innerHTML = card.svg;
      } else {
        btn.style.background = 'var(--brand-primary)';
        btn.style.borderColor = 'var(--brand-primary)';
        btn.innerHTML = '';
      }
    });
  }

  handleInput(input) {
    if (typeof input === 'number' && input >= 0 && input < this.cards.length) {
      this.handleCardClick(input);
    }
  }

  update(dt) {}

  render() {
    this.updateHUD();
  }

  updateHUD() {
    const pairsEl = this.container.querySelector('#cm-pairs');
    const scoreEl = this.container.querySelector('#cm-score');
    if (pairsEl) pairsEl.textContent = this.matchedPairs;
    if (scoreEl) scoreEl.textContent = this.score;

    if (this.callbacks.onScoreUpdate) {
      this.callbacks.onScoreUpdate({ score: this.score, accuracy: this.getAccuracy() });
    }
  }

  getAccuracy() {
    const totalAttempts = this.matchedPairs + this.mistakes;
    if (totalAttempts === 0) return 100;
    return Math.round((this.matchedPairs / totalAttempts) * 100);
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
    if (this.timer) clearInterval(this.timer);
    super.end();
  }

  destroy() {
    if (this.timer) clearInterval(this.timer);
    super.destroy();
  }
}
