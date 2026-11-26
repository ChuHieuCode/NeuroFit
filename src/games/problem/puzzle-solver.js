import { BaseGame } from '../base-game.js';

/**
 * PuzzleSolverGame — Solvable Sliding Tile Puzzle (#16)
 * 3x3 (beginner/easy/intermediate) or 4x4 (advanced/expert), 120s timer.
 */
export class PuzzleSolverGame extends BaseGame {
  constructor(container, callbacks = {}, options = {}) {
    super(container, callbacks, options);
    this.duration = 120;
    this.timeLeft = this.duration;
    this.score = 0;
    this.moves = 0;
    this.mistakes = 0;
    this.timerInterval = null;
    this.gridSize = 3; // 3x3
    this.board = [];
    this.emptyIdx = 8;
    this.solvedBoards = 0;
  }

  initialize() {
    const diff = this.options.difficulty;
    if (diff === 'advanced' || diff === 'expert') {
      this.gridSize = 4;
    } else {
      this.gridSize = 3;
    }

    this.generateSolvableBoard();

    const lang = this.options.lang;
    const titleText = lang === 'vi' ? 'Xếp Hình Trượt' : 'Sliding Puzzle';
    const timeText = lang === 'vi' ? 'Thời gian' : 'Time';
    const movesText = lang === 'vi' ? 'Số nước' : 'Moves';

    this.container.innerHTML = `
      <div class="game-container puzzle-solver-game animate-fade-in" style="display: flex; flex-direction: column; height: 100%; max-width: 600px; margin: 0 auto; padding: 16px; font-family: inherit;">
        <div class="game-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; background: rgba(255,255,255,0.05); padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
          <div>
            <h2 style="margin: 0; font-size: 1.2rem; font-weight: 700; color: var(--color-text, #fff);">${titleText} (${this.gridSize}x${this.gridSize})</h2>
            <div style="font-size: 0.82rem; color: var(--color-text-muted, #aaa); margin-top: 2px;">Solved: <span id="ps-solved">0</span></div>
          </div>
          <div style="display: flex; gap: 16px; text-align: right;">
            <div>
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted, #aaa);">${timeText}</div>
              <div id="ps-timer" style="font-size: 1.1rem; font-weight: 700; color: var(--color-primary, #6366f1); font-tabular-nums;">120s</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted, #aaa);">${movesText}</div>
              <div id="ps-moves" style="font-size: 1.1rem; font-weight: 700; color: var(--color-accent, #10b981);">0</div>
            </div>
          </div>
        </div>

        <div class="game-main" style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 16px;">
          <div style="font-size: 0.88rem; font-weight: 600; color: var(--color-text-muted, #cbd5e1); text-align: center;">
            ${lang === 'vi' ? 'Trượt các ô số về thứ tự đúng (1 đến N):' : 'Slide tiles into correct numerical order:'}
          </div>

          <!-- Board Grid -->
          <div id="ps-board" style="display: grid; grid-template-columns: repeat(${this.gridSize}, 1fr); gap: 8px; background: rgba(0,0,0,0.25); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); padding: 12px; width: 300px; height: 300px; max-width: 100%;">
            <!-- Dynamically populated -->
          </div>
        </div>
      </div>
    `;

    this.timerEl = this.container.querySelector('#ps-timer');
    this.movesEl = this.container.querySelector('#ps-moves');
    this.solvedEl = this.container.querySelector('#ps-solved');
    this.boardContainer = this.container.querySelector('#ps-board');

    this.boundHandleTileClick = (e) => {
      const tile = e.target.closest('.ps-tile');
      if (!tile || this.status !== 'running') return;
      const idx = parseInt(tile.getAttribute('data-index'), 10);
      this.handleInput({ type: 'tile', index: idx });
    };

    this.boardContainer.addEventListener('click', this.boundHandleTileClick);

    this.boundKeydown = (e) => {
      if (this.status !== 'running') return;
      const r = Math.floor(this.emptyIdx / this.gridSize);
      const c = this.emptyIdx % this.gridSize;
      let targetIdx = -1;

      if (e.key === 'ArrowUp' && r < this.gridSize - 1) targetIdx = (r + 1) * this.gridSize + c;
      if (e.key === 'ArrowDown' && r > 0) targetIdx = (r - 1) * this.gridSize + c;
      if (e.key === 'ArrowLeft' && c < this.gridSize - 1) targetIdx = r * this.gridSize + (c + 1);
      if (e.key === 'ArrowRight' && c > 0) targetIdx = r * this.gridSize + (c - 1);

      if (targetIdx !== -1) {
        e.preventDefault();
        this.handleInput({ type: 'tile', index: targetIdx });
      }
    };
    window.addEventListener('keydown', this.boundKeydown);
  }

  generateSolvableBoard() {
    const totalCells = this.gridSize * this.gridSize;
    // Solved array: [1, 2, ..., N*N-1, 0]
    this.board = [];
    for (let i = 1; i < totalCells; i++) this.board.push(i);
    this.board.push(0);
    this.emptyIdx = totalCells - 1;

    // Perform valid random swaps from empty slot to guarantee solvability
    const swapCount = this.gridSize === 3 ? 25 : 50;
    let lastEmpty = -1;

    for (let s = 0; s < swapCount; s++) {
      const r = Math.floor(this.emptyIdx / this.gridSize);
      const c = this.emptyIdx % this.gridSize;
      const neighbors = [];
      if (r > 0) neighbors.push((r - 1) * this.gridSize + c);
      if (r < this.gridSize - 1) neighbors.push((r + 1) * this.gridSize + c);
      if (c > 0) neighbors.push(r * this.gridSize + (c - 1));
      if (c < this.gridSize - 1) neighbors.push(r * this.gridSize + (c + 1));

      // Filter out immediate undo
      const validNeighbors = neighbors.filter(n => n !== lastEmpty);
      const chosen = validNeighbors[Math.floor(Math.random() * validNeighbors.length)] || neighbors[0];

      lastEmpty = this.emptyIdx;
      // Swap emptyIdx and chosen
      this.board[this.emptyIdx] = this.board[chosen];
      this.board[chosen] = 0;
      this.emptyIdx = chosen;
    }
  }

  isSolved() {
    const totalCells = this.gridSize * this.gridSize;
    for (let i = 0; i < totalCells - 1; i++) {
      if (this.board[i] !== i + 1) return false;
    }
    return this.board[totalCells - 1] === 0;
  }

  start() {
    super.start();
    this.timeLeft = this.duration;
    this.score = 0;
    this.moves = 0;
    this.mistakes = 0;
    this.solvedBoards = 0;
    this.generateSolvableBoard();
    this.render();

    this.timerInterval = setInterval(() => {
      if (this.status !== 'running') return;
      this.timeLeft--;
      if (this.timerEl) this.timerEl.textContent = `${this.timeLeft}s`;
      if (this.timeLeft <= 0) {
        this.end();
      }
    }, 1000);
  }

  pause() {
    super.pause();
  }

  resume() {
    super.resume();
  }

  handleInput(input) {
    if (this.status !== 'running' || !input || input.type !== 'tile') return;
    const idx = input.index;

    // Check if idx is adjacent to emptyIdx
    const r1 = Math.floor(idx / this.gridSize);
    const c1 = idx % this.gridSize;
    const r2 = Math.floor(this.emptyIdx / this.gridSize);
    const c2 = this.emptyIdx % this.gridSize;

    const isAdjacent = (Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1);
    if (!isAdjacent) {
      this.mistakes++;
      if (this.callbacks.audio && typeof this.callbacks.audio.wrong === 'function') {
        this.callbacks.audio.wrong();
      }
      return;
    }

    // Slide tile into empty spot
    this.board[this.emptyIdx] = this.board[idx];
    this.board[idx] = 0;
    this.emptyIdx = idx;
    this.moves++;

    if (this.callbacks.audio && typeof this.callbacks.audio.tap === 'function') {
      this.callbacks.audio.tap();
    }

    if (this.isSolved()) {
      this.solvedBoards++;
      this.score += 400 + Math.max(100 - this.moves * 3, 20);
      if (this.callbacks.audio && typeof this.callbacks.audio.success === 'function') {
        this.callbacks.audio.success();
      }
      this.generateSolvableBoard();
    }

    if (this.callbacks.onScoreUpdate) {
      const accuracy = Math.max(100 - this.mistakes * 5, 20);
      this.callbacks.onScoreUpdate({ score: this.score, accuracy });
    }

    this.render();
  }

  render() {
    if (this.movesEl) this.movesEl.textContent = this.moves;
    if (this.solvedEl) this.solvedEl.textContent = this.solvedBoards;

    let html = '';
    const totalCells = this.gridSize * this.gridSize;

    for (let i = 0; i < totalCells; i++) {
      const val = this.board[i];
      if (val === 0) {
        html += `<div style="background: rgba(0,0,0,0.1); border-radius: 12px;"></div>`;
      } else {
        const isHome = (val === i + 1);
        const bg = isHome ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)';
        const border = isHome ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.15)';

        html += `
          <button type="button" class="ps-tile" data-index="${i}" style="background: ${bg}; border: ${border}; border-radius: 12px; font-size: 1.5rem; font-weight: 800; color: var(--color-text, #fff); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s ease; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
            ${val}
          </button>
        `;
      }
    }

    this.boardContainer.innerHTML = html;
  }

  update(dt) {}

  calculateScore() {
    const accuracy = Math.max(100 - this.mistakes * 5, 20);
    return {
      score: this.score,
      accuracy,
      moves: this.moves,
      solvedBoards: this.solvedBoards,
      mistakes: this.mistakes
    };
  }

  destroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.boardContainer && this.boundHandleTileClick) {
      this.boardContainer.removeEventListener('click', this.boundHandleTileClick);
    }
    window.removeEventListener('keydown', this.boundKeydown);
    super.destroy();
  }
}
