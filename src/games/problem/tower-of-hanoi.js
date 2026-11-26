import { BaseGame } from '../base-game.js';

/**
 * TowerOfHanoiGame — 3-peg Tower of Hanoi puzzle (#15)
 * 120s timer, 3 disks (beginner) to 5 disks (expert).
 */
export class TowerOfHanoiGame extends BaseGame {
  constructor(container, callbacks = {}, options = {}) {
    super(container, callbacks, options);
    this.duration = 120;
    this.timeLeft = this.duration;
    this.score = 0;
    this.moves = 0;
    this.mistakes = 0;
    this.timerInterval = null;
    this.selectedPeg = null; // 0, 1, or 2
    this.diskCount = 3;
    this.pegs = [[], [], []];
    this.optimalMoves = 7;
    this.completedBoards = 0;
  }

  initialize() {
    const diff = this.options.difficulty;
    if (diff === 'beginner' || diff === 'easy') this.diskCount = 3;
    else if (diff === 'intermediate' || diff === 'advanced') this.diskCount = 4;
    else this.diskCount = 5;

    this.optimalMoves = Math.pow(2, this.diskCount) - 1;
    this.resetBoard();

    const lang = this.options.lang;
    const titleText = lang === 'vi' ? 'Tháp Hà Nội' : 'Tower of Hanoi';
    const timeText = lang === 'vi' ? 'Thời gian' : 'Time';
    const movesText = lang === 'vi' ? 'Số nước' : 'Moves';

    this.container.innerHTML = `
      <div class="game-container hanoi-game animate-fade-in" style="display: flex; flex-direction: column; height: 100%; max-width: 600px; margin: 0 auto; padding: 16px; font-family: inherit;">
        <div class="game-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; background: rgba(255,255,255,0.05); padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
          <div>
            <h2 style="margin: 0; font-size: 1.2rem; font-weight: 700; color: var(--color-text, #fff);">${titleText} (${this.diskCount} disks)</h2>
            <div style="font-size: 0.82rem; color: var(--color-text-muted, #aaa); margin-top: 2px;">Optimal: ${this.optimalMoves} | Completed: <span id="toh-completed">0</span></div>
          </div>
          <div style="display: flex; gap: 16px; text-align: right;">
            <div>
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted, #aaa);">${timeText}</div>
              <div id="toh-timer" style="font-size: 1.1rem; font-weight: 700; color: var(--color-primary, #6366f1); font-tabular-nums;">120s</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted, #aaa);">${movesText}</div>
              <div id="toh-moves" style="font-size: 1.1rem; font-weight: 700; color: var(--color-accent, #10b981);">0</div>
            </div>
          </div>
        </div>

        <div class="game-main" style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 16px;">
          <div style="font-size: 0.88rem; font-weight: 600; color: var(--color-text-muted, #cbd5e1); text-align: center;">
            ${lang === 'vi' ? 'Chạm cột nguồn rồi cột đích để di chuyển đĩa (Phím 1, 2, 3):' : 'Tap source peg then destination peg to move disks (Keys 1, 2, 3):'}
          </div>

          <!-- Pegs Arena -->
          <div id="toh-pegs" style="display: flex; justify-content: space-around; align-items: flex-end; width: 100%; height: 240px; background: rgba(0,0,0,0.25); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); padding: 16px 8px; position: relative;">
            <!-- Rendered via JS -->
          </div>
        </div>
      </div>
    `;

    this.timerEl = this.container.querySelector('#toh-timer');
    this.movesEl = this.container.querySelector('#toh-moves');
    this.completedEl = this.container.querySelector('#toh-completed');
    this.pegsContainer = this.container.querySelector('#toh-pegs');

    this.boundHandlePegClick = (e) => {
      const pegCol = e.target.closest('.toh-peg-col');
      if (!pegCol || this.status !== 'running') return;
      const pegIdx = parseInt(pegCol.getAttribute('data-peg'), 10);
      this.handleInput({ type: 'peg', peg: pegIdx });
    };

    this.pegsContainer.addEventListener('click', this.boundHandlePegClick);

    this.boundKeydown = (e) => {
      if (this.status !== 'running') return;
      if (e.key === '1') this.handleInput({ type: 'peg', peg: 0 });
      if (e.key === '2') this.handleInput({ type: 'peg', peg: 1 });
      if (e.key === '3') this.handleInput({ type: 'peg', peg: 2 });
    };
    window.addEventListener('keydown', this.boundKeydown);
  }

  resetBoard() {
    this.pegs = [[], [], []];
    for (let i = this.diskCount; i >= 1; i--) {
      this.pegs[0].push(i);
    }
    this.selectedPeg = null;
  }

  start() {
    super.start();
    this.timeLeft = this.duration;
    this.score = 0;
    this.moves = 0;
    this.mistakes = 0;
    this.completedBoards = 0;
    this.resetBoard();
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
    if (this.status !== 'running' || !input || input.type !== 'peg') return;
    const pegIdx = input.peg;

    if (this.selectedPeg === null) {
      if (this.pegs[pegIdx].length === 0) {
        // empty peg selected
        return;
      }
      this.selectedPeg = pegIdx;
      if (this.callbacks.audio && typeof this.callbacks.audio.tap === 'function') {
        this.callbacks.audio.tap();
      }
    } else {
      const sourcePeg = this.selectedPeg;
      const destPeg = pegIdx;
      this.selectedPeg = null;

      if (sourcePeg === destPeg) {
        // deselected
        this.render();
        return;
      }

      const disk = this.pegs[sourcePeg][this.pegs[sourcePeg].length - 1];
      const destTop = this.pegs[destPeg].length > 0 ? this.pegs[destPeg][this.pegs[destPeg].length - 1] : 999;

      if (disk < destTop) {
        // Legal move
        this.pegs[sourcePeg].pop();
        this.pegs[destPeg].push(disk);
        this.moves++;
        if (this.callbacks.audio && typeof this.callbacks.audio.correct === 'function') {
          this.callbacks.audio.correct();
        }

        // Check if peg 2 or 1 is fully completed
        if (this.pegs[1].length === this.diskCount || this.pegs[2].length === this.diskCount) {
          this.completedBoards++;
          const moveDiff = Math.abs(this.moves - this.optimalMoves);
          const efficiencyBonus = Math.max(100 - moveDiff * 10, 20);
          this.score += 300 + efficiencyBonus;
          if (this.callbacks.audio && typeof this.callbacks.audio.success === 'function') {
            this.callbacks.audio.success();
          }
          // Reset board for next round
          this.resetBoard();
        }
      } else {
        // Illegal move
        this.mistakes++;
        if (this.callbacks.audio && typeof this.callbacks.audio.wrong === 'function') {
          this.callbacks.audio.wrong();
        }
      }
    }

    if (this.callbacks.onScoreUpdate) {
      const accuracy = Math.max(100 - this.mistakes * 10, 10);
      this.callbacks.onScoreUpdate({ score: this.score, accuracy });
    }

    this.render();
  }

  render() {
    if (this.movesEl) this.movesEl.textContent = this.moves;
    if (this.completedEl) this.completedEl.textContent = this.completedBoards;

    let html = '';
    const colors = ['#f43f5e', '#fb923c', '#facc15', '#34d399', '#6366f1'];

    for (let p = 0; p < 3; p++) {
      const isSelected = (this.selectedPeg === p);
      const borderColor = isSelected ? 'var(--color-primary, #6366f1)' : 'rgba(255,255,255,0.08)';
      const bgCol = isSelected ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255,255,255,0.03)';

      let disksHtml = '';
      const stack = this.pegs[p];
      // Stack from bottom to top
      for (let i = 0; i < stack.length; i++) {
        const diskVal = stack[i];
        const widthPct = 40 + (diskVal / this.diskCount) * 50;
        const col = colors[(diskVal - 1) % colors.length];
        const isLifted = (isSelected && i === stack.length - 1);

        disksHtml += `
          <div style="width: ${widthPct}%; height: 20px; background: ${col}; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); transform: translateY(${isLifted ? '-14px' : '0'}); transition: transform 0.2s ease;"></div>
        `;
      }

      html += `
        <div class="toh-peg-col" data-peg="${p}" style="flex: 1; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; background: ${bgCol}; border: 1px solid ${borderColor}; border-radius: 12px; padding: 8px 4px; cursor: pointer; position: relative; transition: all 0.2s ease;">
          <!-- Peg vertical rod -->
          <div style="position: absolute; bottom: 8px; width: 6px; height: 170px; background: rgba(255,255,255,0.2); border-radius: 3px; z-index: 0;"></div>
          
          <!-- Disks container -->
          <div style="display: flex; flex-direction: column-reverse; align-items: center; gap: 4px; width: 100%; z-index: 1; margin-bottom: 4px; min-height: 150px; justify-content: flex-start;">
            ${disksHtml}
          </div>

          <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-text-muted, #94a3b8); z-index: 2; margin-top: 4px;">
            Peg ${String.fromCharCode(65 + p)} (${p + 1})
          </div>
        </div>
      `;
    }

    this.pegsContainer.innerHTML = html;
  }

  update(dt) {}

  calculateScore() {
    const accuracy = Math.max(100 - this.mistakes * 8, 15);
    return {
      score: this.score,
      accuracy,
      moves: this.moves,
      completedBoards: this.completedBoards,
      mistakes: this.mistakes
    };
  }

  destroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.pegsContainer && this.boundHandlePegClick) {
      this.pegsContainer.removeEventListener('click', this.boundHandlePegClick);
    }
    window.removeEventListener('keydown', this.boundKeydown);
    super.destroy();
  }
}
