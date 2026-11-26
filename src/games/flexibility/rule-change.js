import { BaseGame } from '../base-game.js';

/**
 * RuleChangeGame (Game #21) — 65s Dynamic Multi-Attribute Hidden-Rule Adaptation Game (Bilingual EN/VI)
 */
export class RuleChangeGame extends BaseGame {
  constructor(container, callbacks = {}, options = {}) {
    super(container, callbacks, options);
    this.duration = 65;
    this.timeLeft = this.duration;
    this.score = 0;
    this.correctCount = 0;
    this.totalAttempts = 0;
    this.consecutiveCorrect = 0;
    
    this.lang = this.options.lang === 'vi' ? 'vi' : 'en';
    this.rules = ['color', 'shape', 'count'];
    this.currentRuleIndex = Math.floor(Math.random() * this.rules.length);
    this.activeRule = this.rules[this.currentRuleIndex];

    this.piles = [
      { id: 0, color: 'red', shape: 'circle', count: 1, labelEn: '1 Red Circle', labelVi: '1 Vòng tròn Đỏ', svg: `<circle cx="24" cy="24" r="14" fill="#ef4444"/>` },
      { id: 1, color: 'blue', shape: 'triangle', count: 2, labelEn: '2 Blue Triangles', labelVi: '2 Tam giác Xanh', svg: `<polygon points="24,8 38,36 10,36" fill="#3b82f6"/><polygon points="24,14 36,38 12,38" fill="#3b82f6" opacity="0.6"/>` },
      { id: 2, color: 'emerald', shape: 'square', count: 3, labelEn: '3 Emerald Squares', labelVi: '3 Hình vuông Lục', svg: `<rect x="12" y="12" width="24" height="24" rx="4" fill="#10b981"/>` },
      { id: 3, color: 'amber', shape: 'star', count: 4, labelEn: '4 Amber Stars', labelVi: '4 Ngôi sao Vàng', svg: `<polygon points="24,6 28,18 40,18 30,26 34,38 24,30 14,38 18,26 8,18 20,18" fill="#f59e0b"/>` }
    ];

    this.stimulus = { color: 'blue', shape: 'circle', count: 2 };
    this.timerInterval = null;
  }

  initialize() {
    const isVi = this.lang === 'vi';
    this.container.innerHTML = `
      <div class="neuro-game rule-change-game" style="display:flex; flex-direction:column; align-items:center; justify-content:space-between; height:100%; padding:16px; background:#0f172a; color:#f8fafc; font-family:sans-serif; user-select:none;">
        <div class="rc-hud" style="display:flex; justify-content:space-between; width:100%; max-width:500px; font-size:16px; font-weight:600;">
          <div>⏱️ <span id="rc-time">${this.timeLeft}</span>s</div>
          <div>🏆 <span id="rc-score">0</span></div>
          <div>🎯 <span id="rc-acc">100</span>%</div>
        </div>

        <div id="rc-banner" style="background:rgba(99,102,241,0.2); border:2px solid #6366f1; color:#818cf8; padding:8px 16px; border-radius:12px; font-size:14px; font-weight:600; text-align:center; min-height:36px; display:flex; align-items:center; justify-content:center;">
          ${isVi ? 'Tìm quy tắc ẩn (Màu, Hình, hoặc Số lượng) qua phản hồi!' : 'Discover the hidden rule (Color, Shape, or Count) through feedback!'}
        </div>

        <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
          <div style="font-size:13px; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">${isVi ? 'Thẻ hiện tại' : 'Stimulus Card'}</div>
          <div id="rc-stimulus-card" style="background:#1e293b; border:4px solid #6366f1; border-radius:20px; width:130px; height:130px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; box-shadow:0 10px 25px rgba(0,0,0,0.5);">
            <div id="rc-stim-svg" style="display:flex; gap:4px; align-items:center; justify-content:center;"></div>
            <div id="rc-stim-text" style="font-size:12px; font-weight:bold; color:#cbd5e1;"></div>
          </div>
        </div>

        <div style="font-size:13px; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">${isVi ? 'Chọn cọc mục tiêu phù hợp' : 'Tap matching target pile'}</div>
        <div class="rc-piles-grid" style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; width:100%; max-width:400px; margin-bottom:12px;">
          ${this.piles.map(p => `
            <button class="rc-pile-btn" data-pile="${p.id}" style="background:#1e293b; border:3px solid #334155; border-radius:16px; padding:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; cursor:pointer; min-height:80px; transition:all 0.15s ease; color:#f8fafc;">
              <div style="display:flex; gap:2px; align-items:center;">${p.svg.repeat(p.count > 2 ? 2 : p.count)}</div>
              <span style="font-size:12px; font-weight:600; color:#94a3b8;">${isVi ? p.labelVi : p.labelEn}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    this.container.querySelectorAll('.rc-pile-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pileId = parseInt(e.currentTarget.dataset.pile, 10);
        this.handlePileSelection(pileId);
      });
    });

    this.generateNewStimulus();
  }

  start() {
    super.start();
    this.timerInterval = setInterval(() => {
      if (this.status !== 'running') return;
      this.timeLeft--;
      const timeEl = this.container.querySelector('#rc-time');
      if (timeEl) timeEl.textContent = this.timeLeft;
      if (this.timeLeft <= 0) {
        this.end();
      }
    }, 1000);
  }

  pause() { super.pause(); }
  resume() { super.resume(); }

  generateNewStimulus() {
    const colors = ['red', 'blue', 'emerald', 'amber'];
    const shapes = ['circle', 'triangle', 'square', 'star'];
    this.stimulus = {
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      count: Math.floor(Math.random() * 4) + 1
    };

    const stimSvgContainer = this.container.querySelector('#rc-stim-svg');
    const stimTextContainer = this.container.querySelector('#rc-stim-text');
    if (stimSvgContainer && stimTextContainer) {
      const samplePile = this.piles.find(p => p.shape === this.stimulus.shape);
      const colorHex = this.stimulus.color === 'red' ? '#ef4444' : this.stimulus.color === 'blue' ? '#3b82f6' : this.stimulus.color === 'emerald' ? '#10b981' : '#f59e0b';
      
      let singleSvg = `<circle cx="16" cy="16" r="10" fill="${colorHex}"/>`;
      if (this.stimulus.shape === 'triangle') singleSvg = `<polygon points="16,6 26,26 6,26" fill="${colorHex}"/>`;
      if (this.stimulus.shape === 'square') singleSvg = `<rect x="8" y="8" width="16" height="16" rx="3" fill="${colorHex}"/>`;
      if (this.stimulus.shape === 'star') singleSvg = `<polygon points="16,4 19,13 28,13 21,18 24,27 16,22 8,27 11,18 4,13 13,13" fill="${colorHex}"/>`;

      stimSvgContainer.innerHTML = singleSvg.repeat(this.stimulus.count);
      stimTextContainer.textContent = `${this.stimulus.count} ${this.stimulus.color} ${this.stimulus.shape}`;
    }
  }

  handlePileSelection(pileId) {
    if (this.status !== 'running') return;
    const selectedPile = this.piles.find(p => p.id === pileId);
    if (!selectedPile) return;

    this.totalAttempts++;
    let isCorrect = false;

    if (this.activeRule === 'color') {
      isCorrect = selectedPile.color === this.stimulus.color;
    } else if (this.activeRule === 'shape') {
      isCorrect = selectedPile.shape === this.stimulus.shape;
    } else if (this.activeRule === 'count') {
      isCorrect = selectedPile.count === this.stimulus.count;
    }

    const banner = this.container.querySelector('#rc-banner');
    const isVi = this.lang === 'vi';

    if (isCorrect) {
      this.correctCount++;
      this.consecutiveCorrect++;
      this.score += 50;
      if (this.callbacks.audio?.tap) this.callbacks.audio.tap();

      if (banner) {
        banner.style.background = 'rgba(16, 185, 129, 0.2)';
        banner.style.borderColor = '#10b981';
        banner.style.color = '#34d399';
        banner.textContent = isVi ? '✓ Khớp quy tắc!' : '✓ Rule Match!';
      }

      // Shift rule after 5 consecutive correct sorts
      if (this.consecutiveCorrect >= 5) {
        this.consecutiveCorrect = 0;
        let prevRule = this.activeRule;
        while (this.activeRule === prevRule) {
          this.activeRule = this.rules[Math.floor(Math.random() * this.rules.length)];
        }
        if (banner) {
          banner.style.background = 'rgba(245, 158, 11, 0.2)';
          banner.style.borderColor = '#f59e0b';
          banner.style.color = '#fbbf24';
          banner.textContent = isVi ? '🔄 Quy tắc vừa đổi! Hãy thích nghi!' : '🔄 Rule Shifted! Adapt!';
        }
      }
    } else {
      this.consecutiveCorrect = 0;
      this.score = Math.max(0, this.score - 10);
      if (this.callbacks.audio?.error) this.callbacks.audio.error();

      if (banner) {
        banner.style.background = 'rgba(239, 68, 68, 0.2)';
        banner.style.borderColor = '#ef4444';
        banner.style.color = '#f87171';
        banner.textContent = isVi ? '✗ Sai quy tắc, thử thuộc tính khác!' : '✗ Try another attribute!';
      }
    }

    const accuracy = Math.round((this.correctCount / this.totalAttempts) * 100);
    const scoreEl = this.container.querySelector('#rc-score');
    const accEl = this.container.querySelector('#rc-acc');
    if (scoreEl) scoreEl.textContent = this.score;
    if (accEl) accEl.textContent = accuracy;

    if (this.callbacks.onScoreUpdate) {
      this.callbacks.onScoreUpdate({ score: this.score, accuracy });
    }

    this.generateNewStimulus();
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
