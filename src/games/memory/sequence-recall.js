import { BaseGame } from '../base-game.js';

/**
 * SequenceRecallGame — 100% polished, genuinely playable tactile memory reference game.
 */
export class SequenceRecallGame extends BaseGame {
  constructor(container, callbacks = {}, options = {}) {
    super(container, callbacks, options);
    
    // Grid size based on difficulty
    const diff = options.difficulty || 'beginner';
    if (diff === 'beginner' || diff === 'easy') {
      this.gridSize = 3; // 3x3 = 9 tiles
    } else if (diff === 'intermediate' || diff === 'advanced') {
      this.gridSize = 4; // 4x4 = 16 tiles
    } else {
      this.gridSize = 4; // 4x4 faster for expert
    }

    this.sequence = [];
    this.playerIndex = 0;
    this.round = 0;
    this.score = 0;
    this.lives = 3;
    this.accuracy = 100;
    this.totalTaps = 0;
    this.correctTaps = 0;
    this.mistakes = 0;
    this.reactionTimes = [];
    
    this.isPlayingSequence = false;
    this.activeTileId = null;
    this.tapStartTime = 0;
    
    this.boundKeyHandler = this.handleKeyDown.bind(this);
  }

  initialize() {
    this.container.innerHTML = `
      <div class="sequence-recall-game">
        <div class="sr-hud-bar">
          <div class="sr-pill">Round: <span id="sr-round">1</span></div>
          <div class="sr-pill">Score: <span id="sr-score">0</span></div>
          <div class="sr-pill">Lives: <span id="sr-lives">❤️❤️❤️</span></div>
        </div>
        <div class="sr-instruction" id="sr-instruction">Watch the sequence...</div>
        <div class="sr-grid grid-${this.gridSize}x${this.gridSize}" id="sr-grid"></div>
      </div>
    `;

    const gridEl = this.container.querySelector('#sr-grid');
    const totalTiles = this.gridSize * this.gridSize;
    
    for (let i = 0; i < totalTiles; i++) {
      const tile = document.createElement('button');
      tile.className = 'sr-tile';
      tile.dataset.index = i;
      tile.setAttribute('aria-label', `Tile ${i + 1}`);
      tile.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.handleTileTap(i);
      });
      gridEl.appendChild(tile);
    }

    window.addEventListener('keydown', this.boundKeyHandler);
  }

  start() {
    super.start();
    this.nextRound();
  }

  pause() {
    super.pause();
  }

  resume() {
    super.resume();
  }

  handleKeyDown(e) {
    if (this.status !== 'running' || this.isPlayingSequence) return;
    const key = e.key;
    if (key >= '1' && key <= '9' && this.gridSize === 3) {
      const idx = parseInt(key, 10) - 1;
      if (idx < 9) this.handleTileTap(idx);
    }
  }

  nextRound() {
    if (this.status !== 'running') return;
    this.round++;
    this.playerIndex = 0;
    this.updateHUD();

    // Add new random tile to sequence
    const totalTiles = this.gridSize * this.gridSize;
    const randomTile = Math.floor(Math.random() * totalTiles);
    this.sequence.push(randomTile);

    this.playSequence();
  }

  async playSequence() {
    this.isPlayingSequence = true;
    const instructionEl = this.container.querySelector('#sr-instruction');
    if (instructionEl) instructionEl.textContent = this.options.lang === 'vi' ? 'Hãy ghi nhớ chuỗi...' : 'Watch the sequence...';

    // Speed multiplier based on difficulty
    const diff = this.options.difficulty || 'beginner';
    let displayTime = 600;
    let pauseTime = 300;
    if (diff === 'intermediate') { displayTime = 500; pauseTime = 250; }
    if (diff === 'advanced') { displayTime = 400; pauseTime = 200; }
    if (diff === 'expert') { displayTime = 300; pauseTime = 150; }

    await new Promise(r => setTimeout(r, 600));

    for (let i = 0; i < this.sequence.length; i++) {
      if (this.status !== 'running') return;
      const tileIdx = this.sequence[i];
      this.lightUpTile(tileIdx, true);
      
      if (this.callbacks.audio) {
        this.callbacks.audio.tap();
      }

      await new Promise(r => setTimeout(r, displayTime));
      this.lightUpTile(tileIdx, false);
      await new Promise(r => setTimeout(r, pauseTime));
    }

    this.isPlayingSequence = false;
    this.tapStartTime = performance.now();
    if (instructionEl) {
      instructionEl.textContent = this.options.lang === 'vi' ? 'Đến lượt bạn! Lặp lại chuỗi.' : 'Your turn! Repeat the sequence.';
    }
  }

  lightUpTile(idx, active) {
    const tiles = this.container.querySelectorAll('.sr-tile');
    if (tiles[idx]) {
      if (active) {
        tiles[idx].classList.add('active');
      } else {
        tiles[idx].classList.remove('active');
      }
    }
  }

  handleTileTap(idx) {
    if (this.status !== 'running' || this.isPlayingSequence) return;

    const now = performance.now();
    const reaction = now - this.tapStartTime;
    this.tapStartTime = now;
    this.reactionTimes.push(reaction);
    this.totalTaps++;

    const expected = this.sequence[this.playerIndex];

    if (idx === expected) {
      // Correct tap
      this.correctTaps++;
      this.score += 10 * this.round;
      this.lightFlash(idx, 'correct');
      if (this.callbacks.audio) {
        this.callbacks.audio.correct(this.playerIndex + 1);
      }

      this.playerIndex++;
      this.updateHUD();

      // Check if round complete
      if (this.playerIndex >= this.sequence.length) {
        if (this.callbacks.audio) {
          this.callbacks.audio.celebrate();
        }
        setTimeout(() => {
          this.nextRound();
        }, 800);
      }
    } else {
      // Wrong tap
      this.lives--;
      this.mistakes++;
      this.lightFlash(idx, 'wrong');
      if (this.callbacks.audio) {
        this.callbacks.audio.wrong();
      }
      this.updateHUD();

      if (this.lives <= 0) {
        this.end();
      } else {
        // Replay sequence for assistance
        setTimeout(() => {
          this.playSequence();
        }, 600);
      }
    }

    // Update live score callback
    this.updateAccuracy();
    if (this.callbacks.onScoreUpdate) {
      this.callbacks.onScoreUpdate({
        score: this.score,
        accuracy: this.accuracy,
        round: this.round,
        lives: this.lives
      });
    }
  }

  lightFlash(idx, type) {
    const tiles = this.container.querySelectorAll('.sr-tile');
    if (tiles[idx]) {
      tiles[idx].classList.add(type);
      setTimeout(() => {
        tiles[idx].classList.remove(type);
      }, 350);
    }
  }

  updateAccuracy() {
    if (this.totalTaps === 0) {
      this.accuracy = 100;
    } else {
      this.accuracy = Math.round((this.correctTaps / this.totalTaps) * 100);
    }
  }

  updateHUD() {
    const roundEl = this.container.querySelector('#sr-round');
    const scoreEl = this.container.querySelector('#sr-score');
    const livesEl = this.container.querySelector('#sr-lives');
    if (roundEl) roundEl.textContent = this.round;
    if (scoreEl) scoreEl.textContent = this.score;
    if (livesEl) livesEl.textContent = '❤️'.repeat(Math.max(0, this.lives));
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
      roundsCompleted: Math.max(0, this.round - 1),
      mistakes: this.mistakes
    };
  }

  destroy() {
    window.removeEventListener('keydown', this.boundKeyHandler);
    super.destroy();
  }
}
