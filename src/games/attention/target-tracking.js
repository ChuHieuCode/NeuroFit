import { BaseGame } from '../base-game.js';

export class TargetTrackingGame extends BaseGame {
  constructor(container, callbacks = {}, options = {}) {
    super(container, callbacks, options);

    const diff = this.options.difficulty || 'beginner';
    if (diff === 'beginner' || diff === 'easy') {
      this.totalSpheres = 6;
      this.targetCount = 2;
    } else if (diff === 'intermediate') {
      this.totalSpheres = 8;
      this.targetCount = 3;
    } else if (diff === 'advanced') {
      this.totalSpheres = 10;
      this.targetCount = 3;
    } else {
      this.totalSpheres = 11;
      this.targetCount = 4;
    }

    this.round = 1;
    this.maxRounds = 6;
    this.score = 0;
    this.mistakes = 0;
    this.correctHits = 0;
    this.reactionTimes = [];

    this.phase = 'highlight'; // 'highlight' | 'track' | 'select' | 'feedback'
    this.spheres = [];
    this.selectedIds = new Set();
    this.canvas = null;
    this.ctx = null;
    this.rafId = null;
    this.timer = null;
    this.phaseStartTime = 0;
  }

  initialize() {
    this.container.innerHTML = `
      <div class="nf-game-shell target-tracking-game" style="text-align: center;">
        <div class="nf-status-pills" style="justify-content: center; margin-bottom: 8px;">
          <div class="nf-pill">Round: <span id="tt-round">${this.round}</span>/${this.maxRounds}</div>
          <div class="nf-pill">Score: <span id="tt-score">0</span></div>
        </div>

        <div id="tt-instruction" style="font-size: 0.95rem; font-weight: 600; color: var(--brand-primary); margin-bottom: 12px;">
          Watch the amber targets...
        </div>

        <div class="nf-canvas-box" style="display: inline-block; position: relative; border-radius: 16px; overflow: hidden; border: 2px solid var(--border-strong, #cbd5e1); background: var(--bg-surface);">
          <canvas id="tt-canvas" width="340" height="340" style="width: 340px; height: 340px; touch-action: none; display: block;"></canvas>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#tt-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.canvas.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
    }
  }

  start() {
    super.start();
    this.startRound();
  }

  pause() {
    super.pause();
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.timer) clearTimeout(this.timer);
  }

  resume() {
    super.resume();
  }

  startRound() {
    if (this.status === 'ended') return;
    this.phase = 'highlight';
    this.selectedIds.clear();

    const width = 340;
    const height = 340;
    const radius = 18;

    // Initialize spheres with random positions & velocity
    this.spheres = [];
    for (let i = 0; i < this.totalSpheres; i++) {
      let x, y, vx, vy, overlapping;
      let attempts = 0;
      do {
        x = radius + Math.random() * (width - 2 * radius);
        y = radius + Math.random() * (height - 2 * radius);
        vx = (Math.random() - 0.5) * 3.2;
        vy = (Math.random() - 0.5) * 3.2;
        overlapping = this.spheres.some(s => Math.hypot(s.x - x, s.y - y) < radius * 2.5);
        attempts++;
      } while (overlapping && attempts < 50);

      this.spheres.push({
        id: i,
        x, y, vx, vy,
        radius,
        isTarget: false
      });
    }

    // Pick T targets
    const shuffled = [...this.spheres].sort(() => Math.random() - 0.5);
    for (let i = 0; i < this.targetCount; i++) {
      shuffled[i].isTarget = true;
    }

    const instruction = this.container.querySelector('#tt-instruction');
    const lang = this.options.lang;
    if (instruction) {
      instruction.textContent = lang === 'vi' ? `Theo dõi ${this.targetCount} quả cầu màu hổ phách...` : `Track the ${this.targetCount} amber targets...`;
      instruction.style.color = '#F59E0B';
    }

    this.phaseStartTime = performance.now();
    const highlightDuration = 1800; // 1.8s highlight
    const trackingDuration = 4000; // 4.0s movement

    const runLoop = (now) => {
      if (this.status !== 'running') return;
      const elapsed = now - this.phaseStartTime;

      if (this.phase === 'highlight') {
        this.renderCanvas();
        if (elapsed >= highlightDuration) {
          this.phase = 'track';
          // Transition spheres to identical color
          this.phaseStartTime = performance.now();
        }
        this.rafId = requestAnimationFrame(runLoop);
      } else if (this.phase === 'track') {
        // Physics update
        const dt = 16;
        this.spheres.forEach(s => {
          s.x += s.vx;
          s.y += s.vy;
          if (s.x - s.radius < 0) { s.x = s.radius; s.vx *= -1; }
          if (s.x + s.radius > width) { s.x = width - s.radius; s.vx *= -1; }
          if (s.y - s.radius < 0) { s.y = s.radius; s.vy *= -1; }
          if (s.y + s.radius > height) { s.y = height - s.radius; s.vy *= -1; }
        });

        this.renderCanvas();

        const trackElapsed = now - this.phaseStartTime;
        if (trackElapsed >= trackingDuration) {
          this.phase = 'select';
          if (instruction) {
            instruction.textContent = lang === 'vi' ? `Chọn ${this.targetCount} quả cầu mục tiêu!` : `Tap the ${this.targetCount} target spheres!`;
            instruction.style.color = 'var(--brand-primary)';
          }
          this.renderCanvas();
          return; // Stop animation loop until selection
        } else {
          this.rafId = requestAnimationFrame(runLoop);
        }
      }
    };

    this.rafId = requestAnimationFrame(runLoop);
  }

  handlePointerDown(e) {
    if (this.status !== 'running' || this.phase !== 'select') return;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / (rect.width || 340);
    const scaleY = this.canvas.height / (rect.height || 340);
    const clientX = (e.clientX - rect.left) * scaleX;
    const clientY = (e.clientY - rect.top) * scaleY;

    // Check hit sphere
    const clicked = this.spheres.find(s => Math.hypot(s.x - clientX, s.y - clientY) <= s.radius + 6);
    if (!clicked || this.selectedIds.has(clicked.id)) return;

    this.selectedIds.add(clicked.id);
    if (this.callbacks.audio?.tap) this.callbacks.audio.tap();
    this.renderCanvas();

    if (this.selectedIds.size === this.targetCount) {
      this.evaluateSelections();
    }
  }

  evaluateSelections() {
    this.phase = 'feedback';
    let roundCorrect = 0;
    let roundMistakes = 0;

    this.selectedIds.forEach(id => {
      const s = this.spheres.find(item => item.id === id);
      if (s && s.isTarget) {
        roundCorrect++;
        this.correctHits++;
      } else {
        roundMistakes++;
        this.mistakes++;
      }
    });

    const isAllCorrect = (roundCorrect === this.targetCount && roundMistakes === 0);
    const earnedPts = roundCorrect * 35 - roundMistakes * 15;
    this.score = Math.max(0, this.score + earnedPts);

    if (isAllCorrect) {
      if (this.callbacks.audio?.correct) this.callbacks.audio.correct(this.round);
    } else {
      if (this.callbacks.audio?.wrong) this.callbacks.audio.wrong();
    }

    const instruction = this.container.querySelector('#tt-instruction');
    const lang = this.options.lang;
    if (instruction) {
      instruction.textContent = isAllCorrect 
        ? (lang === 'vi' ? `Chính xác hoàn hảo! (+${earnedPts} điểm)` : `Perfect match! (+${earnedPts} pts)`)
        : (lang === 'vi' ? `Đúng ${roundCorrect}/${this.targetCount} mục tiêu` : `Found ${roundCorrect}/${this.targetCount} targets`);
      instruction.style.color = isAllCorrect ? 'var(--success, #10B981)' : 'var(--danger, #EF4444)';
    }

    this.renderCanvas(true);
    this.updateHUD();

    this.timer = setTimeout(() => {
      if (this.status !== 'running') return;
      this.round++;
      if (this.round > this.maxRounds) {
        this.end();
      } else {
        this.startRound();
      }
    }, 1800);
  }

  renderCanvas(showReveal = false) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 340, 340);

    this.spheres.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);

      if (this.phase === 'highlight' || showReveal) {
        if (s.isTarget) {
          ctx.fillStyle = '#F59E0B'; // Amber
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#D97706';
          ctx.stroke();

          // Outer ring highlight
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius + 5, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          ctx.fillStyle = 'var(--brand-primary, #6366F1)';
          ctx.fill();
        }
      } else {
        // Normal track / select phase color
        ctx.fillStyle = 'var(--brand-primary, #6366F1)';
        ctx.fill();
      }

      // If selected by user
      if (this.selectedIds.has(s.id)) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#10B981';
        ctx.stroke();
      }
    });
  }

  handleInput(input) {}

  update(dt) {}

  render() {
    this.updateHUD();
  }

  updateHUD() {
    const roundEl = this.container.querySelector('#tt-round');
    const scoreEl = this.container.querySelector('#tt-score');
    if (roundEl) roundEl.textContent = this.round;
    if (scoreEl) scoreEl.textContent = this.score;

    if (this.callbacks.onScoreUpdate) {
      this.callbacks.onScoreUpdate({ score: this.score, accuracy: this.getAccuracy() });
    }
  }

  getAccuracy() {
    const total = this.correctHits + this.mistakes;
    if (total === 0) return 100;
    return Math.round((this.correctHits / total) * 100);
  }

  calculateScore() {
    return {
      score: this.score,
      accuracy: this.getAccuracy(),
      reactionMs: 0,
      mistakes: this.mistakes
    };
  }

  end() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.timer) clearTimeout(this.timer);
    super.end();
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.timer) clearTimeout(this.timer);
    super.destroy();
  }
}
