import { BaseGame } from '../base-game.js';

/**
 * DeductiveGridGame (Game #26) — 105s Interactive 3x3 Constraint Logic Deduction Grid (Bilingual EN/VI)
 * Subjects: Aria, Kai, Nova. Artifacts: Prism, Orb, Compass (Lăng kính, Quả cầu, La bàn).
 * Matrix 3x3 tap with auto-clearing ✓ + Submit button.
 */
export class DeductiveGridGame extends BaseGame {
  constructor(container, callbacks = {}, options = {}) {
    super(container, callbacks, options);
    this.duration = 105;
    this.timeLeft = this.duration;
    this.score = 0;
    this.correctCount = 0;
    this.totalAttempts = 0;
    this.lang = this.options.lang === 'vi' ? 'vi' : 'en';

    this.subjectsEn = ['Aria', 'Kai', 'Nova'];
    this.artifactsEn = ['Prism', 'Orb', 'Compass'];
    this.subjectsVi = ['Aria', 'Kai', 'Nova'];
    this.artifactsVi = ['Lăng kính', 'Quả cầu', 'La bàn'];

    this.secretMapping = {}; // subject -> artifact
    this.clues = [];
    this.playerMatrix = {}; // `${subject}-${artifact}` -> '✓' | 'X' | null

    this.timerInterval = null;
  }

  initialize() {
    const isVi = this.lang === 'vi';
    this.subjects = isVi ? this.subjectsVi : this.subjectsEn;
    this.artifacts = isVi ? this.artifactsVi : this.artifactsEn;

    this.container.innerHTML = `
      <div class="neuro-game deductive-grid-game" style="display:flex; flex-direction:column; align-items:center; justify-content:space-between; height:100%; padding:16px; background:#0f172a; color:#f8fafc; font-family:sans-serif; user-select:none;">
        <div class="dg-hud" style="display:flex; justify-content:space-between; width:100%; max-width:500px; font-size:16px; font-weight:600;">
          <div>⏱️ <span id="dg-time">${this.timeLeft}</span>s</div>
          <div>🏆 <span id="dg-score">0</span></div>
          <div>🎯 <span id="dg-solved">0</span></div>
        </div>

        <div id="dg-clues-card" style="background:#1e293b; border:3px solid #334155; border-radius:16px; padding:12px 16px; width:100%; max-width:500px; font-size:14px; line-height:1.5; color:#cbd5e1;">
          <div style="font-weight:bold; color:#818cf8; margin-bottom:4px; text-transform:uppercase; font-size:12px; letter-spacing:1px;">${isVi ? 'Manh mối suy luận' : 'Deductive Clues'}</div>
          <div id="dg-clues-text"></div>
        </div>

        <div class="dg-matrix-wrapper" style="width:100%; max-width:360px; overflow-x:auto;">
          <table id="dg-table" style="width:100%; border-collapse:collapse; text-align:center; background:#1e293b; border-radius:16px; overflow:hidden; border:2px solid #334155;">
            <thead>
              <tr style="background:#334155; color:#f8fafc; font-size:14px;">
                <th style="padding:10px;"></th>
                ${this.artifacts.map(art => `<th style="padding:10px; font-weight:bold;">${art}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${this.subjects.map(sub => `
                <tr style="border-bottom:1px solid #334155;">
                  <td style="padding:12px; font-weight:bold; background:#1e293b; color:#818cf8; text-align:left; padding-left:16px;">${sub}</td>
                  ${this.artifacts.map(art => `
                    <td style="padding:12px; border:1px solid #334155;">
                      <button class="dg-cell-btn" data-sub="${sub}" data-art="${art}" style="width:40px; height:40px; border-radius:8px; border:2px solid #475569; background:#0f172a; color:#38bdf8; font-size:18px; font-weight:bold; cursor:pointer; transition:all 0.1s ease;"></button>
                    </td>
                  `).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <button id="dg-submit-btn" style="width:100%; max-width:500px; min-height:56px; border-radius:16px; border:none; background:#10b981; color:#fff; font-size:18px; font-weight:bold; cursor:pointer; box-shadow:0 4px 12px rgba(16,185,129,0.4); margin-bottom:8px;">
          ✓ ${isVi ? 'Kiểm tra suy luận (Submit)' : 'Submit Deduction'}
        </button>
      </div>
    `;

    this.container.querySelectorAll('.dg-cell-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sub = e.currentTarget.dataset.sub;
        const art = e.currentTarget.dataset.art;
        this.handleCellTap(sub, art);
      });
    });

    this.container.querySelector('#dg-submit-btn').addEventListener('click', () => this.checkSolution());

    this.generateNewPuzzle();
  }

  start() {
    super.start();
    this.timerInterval = setInterval(() => {
      if (this.status !== 'running') return;
      this.timeLeft--;
      const timeEl = this.container.querySelector('#dg-time');
      if (timeEl) timeEl.textContent = this.timeLeft;
      if (this.timeLeft <= 0) {
        this.end();
      }
    }, 1000);
  }

  pause() { super.pause(); }
  resume() { super.resume(); }

  generateNewPuzzle() {
    this.playerMatrix = {};
    const subs = [...this.subjects];
    const arts = [...this.artifacts].sort(() => Math.random() - 0.5);

    this.secretMapping = {
      [subs[0]]: arts[0],
      [subs[1]]: arts[1],
      [subs[2]]: arts[2]
    };

    // Generate 2-3 clues
    const cluesList = [];
    // Clue 1: Negative
    const negativeSub = subs[0];
    const wrongArt = arts[1] === this.secretMapping[negativeSub] ? arts[2] : arts[1];
    cluesList.push(
      this.lang === 'vi' 
        ? `1. ${negativeSub} KHÔNG chọn ${wrongArt}.` 
        : `1. ${negativeSub} did NOT choose the ${wrongArt}.`
    );

    // Clue 2: Positive or direct
    const positiveSub = subs[1];
    const correctArt = this.secretMapping[positiveSub];
    cluesList.push(
      this.lang === 'vi' 
        ? `2. ${positiveSub} đã chọn ${correctArt}.` 
        : `2. ${positiveSub} chose the ${correctArt}.`
    );

    this.clues = cluesList;
    const cluesTextEl = this.container.querySelector('#dg-clues-text');
    if (cluesTextEl) cluesTextEl.innerHTML = cluesList.join('<br>');

    // Reset table UI
    this.container.querySelectorAll('.dg-cell-btn').forEach(btn => {
      btn.textContent = '';
      btn.style.background = '#0f172a';
      btn.style.borderColor = '#475569';
    });
  }

  handleCellTap(sub, art) {
    if (this.status !== 'running') return;
    const key = `${sub}-${art}`;
    const currentVal = this.playerMatrix[key];

    // Toggle: null -> '✓' -> null (simplifying for quick mobile play)
    if (!currentVal) {
      // Auto-clear other ✓ in same row and column
      this.subjects.forEach(s => {
        const k = `${s}-${art}`;
        if (this.playerMatrix[k] === '✓') {
          this.playerMatrix[k] = null;
          this.updateButtonUI(s, art);
        }
      });
      this.artifacts.forEach(a => {
        const k = `${sub}-${a}`;
        if (this.playerMatrix[k] === '✓') {
          this.playerMatrix[k] = null;
          this.updateButtonUI(sub, a);
        }
      });

      this.playerMatrix[key] = '✓';
    } else {
      this.playerMatrix[key] = null;
    }

    this.updateButtonUI(sub, art);
    if (this.callbacks.audio?.tap) this.callbacks.audio.tap();
  }

  updateButtonUI(sub, art) {
    const btn = this.container.querySelector(`.dg-cell-btn[data-sub="${sub}"][data-art="${art}"]`);
    if (!btn) return;
    const val = this.playerMatrix[`${sub}-${art}`];
    btn.textContent = val || '';
    btn.style.background = val === '✓' ? '#10b981' : '#0f172a';
    btn.style.borderColor = val === '✓' ? '#34d399' : '#475569';
    btn.style.color = val === '✓' ? '#fff' : '#38bdf8';
  }

  checkSolution() {
    if (this.status !== 'running') return;
    this.totalAttempts++;

    // Check if player mapped all 3 correctly
    let isFullyCorrect = true;
    for (const sub of this.subjects) {
      const correctArt = this.secretMapping[sub];
      if (this.playerMatrix[`${sub}-${correctArt}`] !== '✓') {
        isFullyCorrect = false;
        break;
      }
    }

    const scoreEl = this.container.querySelector('#dg-score');
    const solvedEl = this.container.querySelector('#dg-solved');

    if (isFullyCorrect) {
      this.correctCount++;
      this.score += 150;
      if (this.callbacks.audio?.tap) this.callbacks.audio.tap();

      if (scoreEl) scoreEl.textContent = this.score;
      if (solvedEl) solvedEl.textContent = this.correctCount;

      if (this.callbacks.onScoreUpdate) {
        this.callbacks.onScoreUpdate({ score: this.score, accuracy: Math.round((this.correctCount / this.totalAttempts) * 100) });
      }

      this.generateNewPuzzle();
    } else {
      this.score = Math.max(0, this.score - 20);
      if (this.callbacks.audio?.error) this.callbacks.audio.error();
      if (scoreEl) scoreEl.textContent = this.score;
    }
  }

  handleInput(input) {}
  update(dt) {}
  render() {}

  calculateScore() {
    const accuracy = this.totalAttempts > 0 ? Math.round((this.correctCount / this.totalAttempts) * 100) : 100;
    return {
      score: this.score,
      accuracy,
      correctCount: this.correctCount,
      totalAttempts: this.totalAttempts
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
