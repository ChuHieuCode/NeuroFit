import { BaseGame } from '../base-game.js';

/**
 * WordAssociationGame (Game #23) — 60s Semantic Association & Verbal Analogy Game
 * Bilingual EN_BANK & VI_BANK (>=32 items each).
 */
export class WordAssociationGame extends BaseGame {
  constructor(container, callbacks = {}, options = {}) {
    super(container, callbacks, options);
    this.duration = 60;
    this.timeLeft = this.duration;
    this.score = 0;
    this.streak = 0;
    this.correctCount = 0;
    this.totalAttempts = 0;
    this.reactionTimes = [];
    this.lang = this.options.lang === 'vi' ? 'vi' : 'en';

    this.currentQuestion = null;
    this.trialStartTime = 0;
    this.timerInterval = null;
    this.usedIndices = new Set();

    this.EN_BANK = [
      { type: 'analogy', prompt: 'Book : Read :: Music : ?', options: ['Listen', 'Draw', 'Write', 'Sing'], answer: 'Listen' },
      { type: 'bridge', prompt: 'Ocean — Tide — ?', options: ['Wave', 'Sand', 'Fish', 'Shell'], answer: 'Wave' },
      { type: 'analogy', prompt: 'Doctor : Hospital :: Teacher : ?', options: ['School', 'Library', 'Office', 'Park'], answer: 'School' },
      { type: 'bridge', prompt: 'Fire — Smoke — ?', options: ['Ash', 'Heat', 'Light', 'Coal'], answer: 'Ash' },
      { type: 'analogy', prompt: 'Bird : Fly :: Fish : ?', options: ['Swim', 'Walk', 'Run', 'Jump'], answer: 'Swim' },
      { type: 'bridge', prompt: 'Seed — Plant — ?', options: ['Tree', 'Soil', 'Water', 'Root'], answer: 'Tree' },
      { type: 'analogy', prompt: 'Eye : See :: Ear : ?', options: ['Hear', 'Touch', 'Taste', 'Smell'], answer: 'Hear' },
      { type: 'bridge', prompt: 'Winter — Cold — ?', options: ['Snow', 'Rain', 'Wind', 'Ice'], answer: 'Snow' },
      { type: 'analogy', prompt: 'Knife : Cut :: Pen : ?', options: ['Write', 'Read', 'Draw', 'Erase'], answer: 'Write' },
      { type: 'bridge', prompt: 'Day — Night — ?', options: ['Sun', 'Dark', 'Moon', 'Star'], answer: 'Dark' },
      { type: 'analogy', prompt: 'Clock : Time :: Thermometer : ?', options: ['Temperature', 'Pressure', 'Speed', 'Weight'], answer: 'Temperature' },
      { type: 'bridge', prompt: 'Cloud — Rain — ?', options: ['Storm', 'Sky', 'Sun', 'Wind'], answer: 'Storm' },
      { type: 'analogy', prompt: 'Bee : Honey :: Cow : ?', options: ['Milk', 'Meat', 'Leather', 'Grass'], answer: 'Milk' },
      { type: 'bridge', prompt: 'Metal — Rust — ?', options: ['Corrode', 'Break', 'Bend', 'Melt'], answer: 'Corrode' },
      { type: 'analogy', prompt: 'Artist : Brush :: Writer : ?', options: ['Pen', 'Book', 'Paper', 'Desk'], answer: 'Pen' },
      { type: 'bridge', prompt: 'Stone — Mountain — ?', options: ['Rock', 'Sand', 'Peak', 'Valley'], answer: 'Rock' },
      { type: 'analogy', prompt: 'Lion : Pride :: Wolf : ?', options: ['Pack', 'Herd', 'Flock', 'Swarm'], answer: 'Pack' },
      { type: 'bridge', prompt: 'River — Delta — ?', options: ['Ocean', 'Lake', 'Stream', 'Bank'], answer: 'Ocean' },
      { type: 'analogy', prompt: 'Hot : Cold :: Fast : ?', options: ['Slow', 'Quick', 'Rapid', 'Swift'], answer: 'Slow' },
      { type: 'bridge', prompt: 'Bread — Flour — ?', options: ['Wheat', 'Water', 'Yeast', 'Bake'], answer: 'Wheat' },
      { type: 'analogy', prompt: 'Hand : Glove :: Foot : ?', options: ['Sock', 'Shoe', 'Boot', 'Sandal'], answer: 'Sock' },
      { type: 'bridge', prompt: 'Egg — Shell — ?', options: ['Yolk', 'Bird', 'Nest', 'Hatch'], answer: 'Yolk' },
      { type: 'analogy', prompt: 'Car : Road :: Train : ?', options: ['Track', 'Rail', 'Station', 'Bridge'], answer: 'Track' },
      { type: 'bridge', prompt: 'Fruit — Seed — ?', options: ['Core', 'Tree', 'Leaf', 'Root'], answer: 'Core' },
      { type: 'analogy', prompt: 'Ship : Sea :: Plane : ?', options: ['Air', 'Sky', 'Cloud', 'Flight'], answer: 'Air' },
      { type: 'bridge', prompt: 'Book — Chapter — ?', options: ['Page', 'Title', 'Author', 'Word'], answer: 'Page' },
      { type: 'analogy', prompt: 'Root : Tree :: Foundation : ?', options: ['Building', 'Wall', 'Roof', 'Door'], answer: 'Building' },
      { type: 'bridge', prompt: 'Milk — Butter — ?', options: ['Cheese', 'Cream', 'Cows', 'Grass'], answer: 'Cheese' },
      { type: 'analogy', prompt: 'Key : Lock :: Password : ?', options: ['Account', 'Computer', 'Door', 'Safe'], answer: 'Account' },
      { type: 'bridge', prompt: 'Tree — Forest — ?', options: ['Wood', 'Leaf', 'Branch', 'Root'], answer: 'Wood' },
      { type: 'analogy', prompt: 'Smile : Happy :: Frown : ?', options: ['Sad', 'Angry', 'Tired', 'Bored'], answer: 'Sad' },
      { type: 'bridge', prompt: 'Spark — Fire — ?', options: ['Flame', 'Smoke', 'Heat', 'Ash'], answer: 'Flame' }
    ];

    this.VI_BANK = [
      { type: 'analogy', prompt: 'Sách : Đọc :: Nhạc : ?', options: ['Nghe', 'Viết', 'Hát', 'Đàn'], answer: 'Nghe' },
      { type: 'bridge', prompt: 'Đại dương — Thủy triều — ?', options: ['Sóng', 'Cát', 'Cá', 'Vỏ ốc'], answer: 'Sóng' },
      { type: 'analogy', prompt: 'Bác sĩ : Bệnh viện :: Giáo viên : ?', options: ['Trường học', 'Thư viện', 'Văn phòng', 'Công viên'], answer: 'Trường học' },
      { type: 'bridge', prompt: 'Lửa — Khói — ?', options: ['Tro', 'Nhiệt', 'Ánh sáng', 'Than'], answer: 'Tro' },
      { type: 'analogy', prompt: 'Chim : Bay :: Cá : ?', options: ['Bơi', 'Đi', 'Chạy', 'Nhảy'], answer: 'Bơi' },
      { type: 'bridge', prompt: 'Hạt giống — Cây — ?', options: ['Gỗ', 'Đất', 'Nước', 'Rễ'], answer: 'Gỗ' },
      { type: 'analogy', prompt: 'Mắt : Thấy :: Tai : ?', options: ['Nghe', 'Chạm', 'Nếm', 'Ngửi'], answer: 'Nghe' },
      { type: 'bridge', prompt: 'Mùa đông — Lạnh — ?', options: ['Tuyết', 'Mưa', 'Gió', 'Băng'], answer: 'Tuyết' },
      { type: 'analogy', prompt: 'Dao : Cắt :: Bút : ?', options: ['Viết', 'Đọc', 'Vẽ', 'Tẩy'], answer: 'Viết' },
      { type: 'bridge', prompt: 'Ngày — Đêm — ?', options: ['Tối', 'Mặt trời', 'Mặt trăng', 'Sao'], answer: 'Tối' },
      { type: 'analogy', prompt: 'Đồng hồ : Thời gian :: Nhiệt kế : ?', options: ['Nhiệt độ', 'Áp suất', 'Tốc độ', 'Trọng lượng'], answer: 'Nhiệt độ' },
      { type: 'bridge', prompt: 'Mây — Mưa — ?', options: ['Bão', 'Trời', 'Nắng', 'Gió'], answer: 'Bão' },
      { type: 'analogy', prompt: 'Ong : Mật :: Bò : ?', options: ['Sữa', 'Thịt', 'Da', 'Cỏ'], answer: 'Sữa' },
      { type: 'bridge', prompt: 'Kim loại — Gỉ — ?', options: ['Ăn mòn', 'Gãy', 'Uốn', 'Chảy'], answer: 'Ăn mòn' },
      { type: 'analogy', prompt: 'Họa sĩ : Cọ :: Nhà văn : ?', options: ['Bút', 'Sách', 'Giấy', 'Bàn'], answer: 'Bút' },
      { type: 'bridge', prompt: 'Đá — Núi — ?', options: ['Sỏi', 'Cát', 'Đỉnh', 'Thung lũng'], answer: 'Sỏi' },
      { type: 'analogy', prompt: 'Sư tử : Bầy :: Sói : ?', options: ['Đàn', 'Bầy', 'Đội', 'Nhóm'], answer: 'Đàn' },
      { type: 'bridge', prompt: 'Sông — Đồng bằng — ?', options: ['Biển', 'Hồ', 'Suối', 'Bờ'], answer: 'Biển' },
      { type: 'analogy', prompt: 'Nóng : Lạnh :: Nhanh : ?', options: ['Chậm', 'Mau', 'Gấp', 'Vội'], answer: 'Chậm' },
      { type: 'bridge', prompt: 'Bánh mỳ — Bột — ?', options: ['Lúa mì', 'Nước', 'Men', 'Nướng'], answer: 'Lúa mì' },
      { type: 'analogy', prompt: 'Tay : Găng tay :: Chân : ?', options: ['Tất', 'Giày', 'Bốt', 'Dép'], answer: 'Tất' },
      { type: 'bridge', prompt: 'Trứng — Vỏ — ?', options: ['Lòng đỏ', 'Chim', 'Tổ', 'Nở'], answer: 'Lòng đỏ' },
      { type: 'analogy', prompt: 'Ô tô : Đường :: Tàu hỏa : ?', options: ['Đường ray', 'Đường sắt', 'Ga', 'Cầu'], answer: 'Đường ray' },
      { type: 'bridge', prompt: 'Quả — Hạt — ?', options: ['Cùi', 'Cây', 'Lá', 'Rễ'], answer: 'Cùi' },
      { type: 'analogy', prompt: 'Tàu : Biển :: Máy bay : ?', options: ['Không khí', 'Trời', 'Mây', 'Bay'], answer: 'Không khí' },
      { type: 'bridge', prompt: 'Sách — Chương — ?', options: ['Trang', 'Tiêu đề', 'Tác giả', 'Từ'], answer: 'Trang' },
      { type: 'analogy', prompt: 'Rễ : Cây :: Móng : ?', options: ['Nhà', 'Tường', 'Mái', 'Cửa'], answer: 'Nhà' },
      { type: 'bridge', prompt: 'Sữa — Bơ — ?', options: ['Phô mai', 'Kem', 'Bò', 'Cỏ'], answer: 'Phô mai' },
      { type: 'analogy', prompt: 'Chìa khóa : Khóa :: Mật khẩu : ?', options: ['Tài khoản', 'Máy tính', 'Cửa', 'Két'], answer: 'Tài khoản' },
      { type: 'bridge', prompt: 'Cây — Rừng — ?', options: ['Gỗ', 'Lá', 'Cành', 'Rễ'], answer: 'Gỗ' },
      { type: 'analogy', prompt: 'Cười : Vui :: Buồn : ?', options: ['Khóc', 'Giận', 'Mệt', 'Buồn'], answer: 'Khóc' },
      { type: 'bridge', prompt: 'Tia lửa — Lửa — ?', options: ['Ngọn lửa', 'Khói', 'Nhiệt', 'Tro'], answer: 'Ngọn lửa' }
    ];
  }

  initialize() {
    const isVi = this.lang === 'vi';
    this.container.innerHTML = `
      <div class="neuro-game word-association-game" style="display:flex; flex-direction:column; align-items:center; justify-content:space-between; height:100%; padding:16px; background:#0f172a; color:#f8fafc; font-family:sans-serif; user-select:none;">
        <div class="wa-hud" style="display:flex; justify-content:space-between; width:100%; max-width:500px; font-size:16px; font-weight:600;">
          <div>⏱️ <span id="wa-time">${this.timeLeft}</span>s</div>
          <div>🏆 <span id="wa-score">0</span></div>
          <div>🔥 <span id="wa-streak">0</span></div>
        </div>

        <div id="wa-prompt-box" style="background:#1e293b; border:4px solid #6366f1; border-radius:24px; padding:24px; width:100%; max-width:500px; text-align:center; box-shadow:0 10px 25px rgba(0,0,0,0.5);">
          <div style="font-size:13px; color:#818cf8; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:8px;">${isVi ? 'Liên kết & Tương tự từ vựng' : 'Word Analogy & Semantic Bridge'}</div>
          <div id="wa-prompt-text" style="font-size:24px; font-weight:800; color:#f8fafc;"></div>
        </div>

        <div class="wa-options-grid" style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; width:100%; max-width:500px; margin-bottom:12px;">
          ${[0, 1, 2, 3].map(i => `
            <button class="wa-option-btn" data-index="${i}" style="min-height:64px; border-radius:16px; border:3px solid #334155; background:#1e293b; color:#f8fafc; font-size:18px; font-weight:bold; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.3); transition:all 0.15s ease;"></button>
          `).join('')}
        </div>
      </div>
    `;

    this.container.querySelectorAll('.wa-option-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selectedText = e.currentTarget.textContent;
        this.handleAnswer(selectedText);
      });
    });

    this.nextQuestion();
  }

  start() {
    super.start();
    this.timerInterval = setInterval(() => {
      if (this.status !== 'running') return;
      this.timeLeft--;
      const timeEl = this.container.querySelector('#wa-time');
      if (timeEl) timeEl.textContent = this.timeLeft;
      if (this.timeLeft <= 0) {
        this.end();
      }
    }, 1000);
  }

  pause() { super.pause(); }
  resume() { super.resume(); }

  nextQuestion() {
    if (this.status !== 'running') return;
    const bank = this.lang === 'vi' ? this.VI_BANK : this.EN_BANK;

    if (this.usedIndices.size >= bank.length) {
      this.usedIndices.clear(); // Reset if all items used
    }

    let idx;
    do {
      idx = Math.floor(Math.random() * bank.length);
    } while (this.usedIndices.has(idx));

    this.usedIndices.add(idx);
    const item = bank[idx];

    // Shuffle options
    const shuffledOptions = [...item.options].sort(() => Math.random() - 0.5);
    this.currentQuestion = { ...item, shuffledOptions };

    const promptEl = this.container.querySelector('#wa-prompt-text');
    if (promptEl) promptEl.textContent = item.prompt;

    const optionBtns = this.container.querySelectorAll('.wa-option-btn');
    optionBtns.forEach((btn, i) => {
      btn.textContent = shuffledOptions[i];
      btn.style.background = '#1e293b';
      btn.style.borderColor = '#334155';
    });

    this.trialStartTime = performance.now();
  }

  handleAnswer(selectedText) {
    if (this.status !== 'running' || !this.currentQuestion) return;
    const rt = performance.now() - this.trialStartTime;
    this.reactionTimes.push(rt);
    this.totalAttempts++;

    const isCorrect = selectedText === this.currentQuestion.answer;

    if (isCorrect) {
      this.correctCount++;
      this.streak++;
      this.score += Math.max(10, Math.round(100 - rt / 15) + this.streak * 5);
      if (this.callbacks.audio?.tap) this.callbacks.audio.tap();
    } else {
      this.streak = 0;
      this.score = Math.max(0, this.score - 10);
      if (this.callbacks.audio?.error) this.callbacks.audio.error();
    }

    const accuracy = Math.round((this.correctCount / this.totalAttempts) * 100);
    const scoreEl = this.container.querySelector('#wa-score');
    const streakEl = this.container.querySelector('#wa-streak');
    if (scoreEl) scoreEl.textContent = this.score;
    if (streakEl) streakEl.textContent = this.streak;

    if (this.callbacks.onScoreUpdate) {
      this.callbacks.onScoreUpdate({ score: this.score, accuracy });
    }

    this.nextQuestion();
  }

  handleInput(input) {}
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
