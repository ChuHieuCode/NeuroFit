import { BaseGame } from '../base-game.js';

/**
 * SetLogicGame (Game #27) — 90s Visual Triad Logic Game (Bilingual EN/VI)
 * 3x2 grid of 6 cards. Attributes: count (1,2,3), shape (circle, triangle, diamond), color (indigo, emerald, amber).
 * Guaranteed valid set on board. Hint button (-10 pts).
 */
export class SetLogicGame extends BaseGame {
  constructor(container, callbacks = {}, options = {}) {
    super(container, callbacks, options);
    this.duration = 90;
    this.timeLeft = this.duration;
    this.score = 0;
    this.correctCount = 0;
    this.totalAttempts = 0;
    this.lang = this.options.lang === 'vi' ? 'vi' : 'en';

    this.cards = []; // array of 6 cards { count, shape, color, id }
    this.selectedCardIds = new Set();
    this.timerInterval = null;
  }

  initialize() {
    const isVi = this.lang === 'vi';
    this.container.innerHTML = `
      <div class="neuro-game set-logic-game" style="display:flex; flex-direction:column; align-items:center; justify-content:space-between; height:100%; padding:16px; background:#0f172a; color:#f8fafc; font-family:sans-serif; user-select:none;">
        <div class="set-hud" style="display:flex; justify-content:space-between; width:100%; max-width:500px; font-size:16px; font-weight:600;">
          <div>⏱️ <span id="set-time">${this.timeLeft}</span>s</div>
          <div>🏆 <span id="set-score">0</span></div>
          <div>🎯 <span id="set-sets">0</span> Triads</div>
        </div>

        <div style="display:flex; justify-content:space-between; width:100%; max-width:500px; align-items:center;">
          <div id="set-banner" style="font-size:13px; color:#94a3b8; font-weight:600;">
            ${isVi ? 'Chọn 3 thẻ tạo thành 1 bộ ba hợp lệ!' : 'Select 3 cards forming a valid triad!'}
          </div>
          <button id="set-hint-btn" style="background:#334155; border:none; color:#38bdf8; padding:6px 12px; border-radius:8px; font-weight:bold; cursor:pointer; font-size:12px;">
            💡 ${isVi ? 'Gợi ý (-10đ)' : 'Hint (-10 pts)'}
          </button>
        </div>

        <!-- 3x2 Card Grid -->
        <div class="set-grid" style="display:grid; grid-template-columns:repeat(3, 1fr); grid-template-rows:repeat(2, 1fr); gap:12px; width:100%; max-width:450px;">
        </div>

        <div style="font-size:12px; color:#64748b; text-align:center;">
          ${isVi ? 'Thuộc tính: Giống hệt hoặc Khác hoàn toàn trên mọi đặc điểm' : 'Rule: All attributes must be All Same or All Different'}
        </div>
      </div>
    `;

    this.container.querySelector('#set-hint-btn').addEventListener('click', () => this.giveHint());
    this.dealValidBoard();
  }

  start() {
    super.start();
    this.timerInterval = setInterval(() => {
      if (this.status !== 'running') return;
      this.timeLeft--;
      const timeEl = this.container.querySelector('#set-time');
      if (timeEl) timeEl.textContent = this.timeLeft;
      if (this.timeLeft <= 0) {
        this.end();
      }
    }, 1000);
  }

  pause() { super.pause(); }
  resume() { super.resume(); }

  dealValidBoard() {
    this.selectedCardIds.clear();
    const counts = [0, 1, 2];
    const shapes = ['circle', 'triangle', 'diamond'];
    const colors = ['#6366f1', '#10b981', '#f59e0b']; // Indigo, Emerald, Amber

    // Generate a guaranteed valid Triad triple (c1, c2, c3)
    const c1 = { count: Math.floor(Math.random() * 3), shape: Math.floor(Math.random() * 3), color: Math.floor(Math.random() * 3), id: 0 };
    const c2 = { count: Math.floor(Math.random() * 3), shape: Math.floor(Math.random() * 3), color: Math.floor(Math.random() * 3), id: 1 };
    
    // c3 is uniquely determined by c1 and c2 for a Triad
    const c3 = {
      count: (3 - ((c1.count + c2.count) % 3)) % 3,
      shape: (3 - ((c1.shape + c2.shape) % 3)) % 3,
      color: (3 - ((c1.color + c2.color) % 3)) % 3,
      id: 2
    };

    // Add 3 random filler cards to make 6 total
    const fillers = [];
    for (let i = 3; i < 6; i++) {
      fillers.push({
        count: Math.floor(Math.random() * 3),
        shape: Math.floor(Math.random() * 3),
        color: Math.floor(Math.random() * 3),
        id: i
      });
    }

    this.cards = [c1, c2, c3, ...fillers].sort(() => Math.random() - 0.5);
    this.renderBoard();
  }

  renderBoard() {
    const gridEl = this.container.querySelector('.set-grid');
    if (!gridEl) return;

    const shapes = ['circle', 'triangle', 'diamond'];
    const colors = ['#6366f1', '#10b981', '#f59e0b'];

    gridEl.innerHTML = this.cards.map(card => {
      const colorHex = colors[card.color];
      const shapeType = shapes[card.shape];
      const countVal = card.count + 1;

      let svgShape = `<circle cx="16" cy="16" r="10" fill="${colorHex}"/>`;
      if (shapeType === 'triangle') svgShape = `<polygon points="16,6 26,26 6,26" fill="${colorHex}"/>`;
      if (shapeType === 'diamond') svgShape = `<polygon points="16,4 28,16 16,28 4,16" fill="${colorHex}"/>`;

      const isSelected = this.selectedCardIds.has(card.id);

      return `
        <button class="set-card-btn" data-id="${card.id}" style="background:#1e293b; border:3px solid ${isSelected ? '#38bdf8' : '#334155'}; border-radius:16px; padding:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; cursor:pointer; min-height:100px; box-shadow:0 4px 12px rgba(0,0,0,0.4); transition:all 0.15s ease;">
          <div style="display:flex; gap:4px; align-items:center; justify-content:center;">
            ${svgShape.repeat(countVal)}
          </div>
        </button>
      `;
    }).join('');

    gridEl.querySelectorAll('.set-card-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.dataset.id, 10);
        this.toggleCardSelection(id);
      });
    });
  }

  toggleCardSelection(id) {
    if (this.status !== 'running') return;
    if (this.selectedCardIds.has(id)) {
      this.selectedCardIds.delete(id);
    } else {
      if (this.selectedCardIds.size >= 3) {
        this.selectedCardIds.clear();
      }
      this.selectedCardIds.add(id);
      if (this.callbacks.audio?.tap) this.callbacks.audio.tap();
    }

    this.renderBoard();

    if (this.selectedCardIds.size === 3) {
      this.evaluateSelectedSet();
    }
  }

  evaluateSelectedSet() {
    const selected = Array.from(this.selectedCardIds).map(id => this.cards.find(c => c.id === id));
    this.totalAttempts++;

    const attr1Valid = (selected[0].count + selected[1].count + selected[2].count) % 3 === 0;
    const attr2Valid = (selected[0].shape + selected[1].shape + selected[2].shape) % 3 === 0;
    const attr3Valid = (selected[0].color + selected[1].color + selected[2].color) % 3 === 0;

    const isSet = attr1Valid && attr2Valid && attr3Valid;
    const banner = this.container.querySelector('#set-banner');
    const isVi = this.lang === 'vi';

    if (isSet) {
      this.correctCount++;
      this.score += 60;
      if (this.callbacks.audio?.tap) this.callbacks.audio.tap();

      if (banner) {
        banner.style.color = '#34d399';
        banner.textContent = isVi ? '✨ Bộ ba hoàn hảo! (+60đ)' : '✨ Valid triad found! (+60 pts)';
      }

      const scoreEl = this.container.querySelector('#set-score');
      const setsEl = this.container.querySelector('#set-sets');
      if (scoreEl) scoreEl.textContent = this.score;
      if (setsEl) setsEl.textContent = this.correctCount;

      if (this.callbacks.onScoreUpdate) {
        this.callbacks.onScoreUpdate({ score: this.score, accuracy: Math.round((this.correctCount / this.totalAttempts) * 100) });
      }

      setTimeout(() => { this.dealValidBoard(); }, 800);
    } else {
      this.score = Math.max(0, this.score - 10);
      if (this.callbacks.audio?.error) this.callbacks.audio.error();

      if (banner) {
        banner.style.color = '#f87171';
        banner.textContent = isVi ? '✗ Không phải bộ ba! Hãy kiểm tra lại đặc điểm.' : '✗ Not a triad! Check attributes.';
      }
      this.selectedCardIds.clear();
      setTimeout(() => { this.renderBoard(); }, 800);
    }
  }

  giveHint() {
    if (this.status !== 'running') return;
    this.score = Math.max(0, this.score - 10);
    const scoreEl = this.container.querySelector('#set-score');
    if (scoreEl) scoreEl.textContent = this.score;

    // Find one card that belongs to a valid set
    // Since c1, c2, c3 are guaranteed valid, select c1 if not already
    this.selectedCardIds.clear();
    this.selectedCardIds.add(this.cards[0].id);
    this.renderBoard();
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
