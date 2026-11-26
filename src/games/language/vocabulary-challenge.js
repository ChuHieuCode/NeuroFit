import { BaseGame } from '../base-game.js';

/**
 * VocabularyChallengeGame (Game #24) — 60s Lexicon Mastery Game (Bilingual EN/VI, >=36 items each)
 * Modes: SYNONYM (Similar) / TỪ ĐỒNG NGHĨA, ANTONYM (Opposite) / TỪ TRÁI NGHĨA, MEANING / ĐỊNH NGHĨA.
 */
export class VocabularyChallengeGame extends BaseGame {
  constructor(container, callbacks = {}, options = {}) {
    super(container, callbacks, options);
    this.duration = 60;
    this.timeLeft = this.duration;
    this.score = 0;
    this.correctCount = 0;
    this.totalAttempts = 0;
    this.streak = 0;
    this.lang = this.options.lang === 'vi' ? 'vi' : 'en';

    this.currentQuestion = null;
    this.usedIndices = new Set();
    this.timerInterval = null;

    this.EN_BANK = [
      { mode: 'synonym', word: 'Benevolent', promptEn: 'SYNONYM (Similar)', promptVi: 'TỪ ĐỒNG NGHĨA', answer: 'Kind', options: ['Kind', 'Hostile', 'Greedy', 'Lazy'] },
      { mode: 'antonym', word: 'Ephemeral', promptEn: 'ANTONYM (Opposite)', promptVi: 'TỪ TRÁI NGHĨA', answer: 'Permanent', options: ['Permanent', 'Transient', 'Brief', 'Fleeting'] },
      { mode: 'meaning', word: 'Meticulous', promptEn: 'MEANING', promptVi: 'ĐỊNH NGHĨA', answer: 'Showing great attention to detail', options: ['Showing great attention to detail', 'Careless and sloppy', 'Fast and reckless', 'Quiet and reserved'] },
      { mode: 'synonym', word: 'Audacious', promptEn: 'SYNONYM (Similar)', promptVi: 'TỪ ĐỒNG NGHĨA', answer: 'Bold', options: ['Bold', 'Timid', 'Cautious', 'Fearful'] },
      { mode: 'antonym', word: 'Abundant', promptEn: 'ANTONYM (Opposite)', promptVi: 'TỪ TRÁI NGHĨA', answer: ScarceOption => 'Scarce', options: ['Scarce', 'Plentiful', 'Ample', 'Copious'] },
      { mode: 'meaning', word: 'Pragmatic', promptEn: 'MEANING', promptVi: 'ĐỊNH NGHĨA', answer: 'Dealing with things sensibly and realistically', options: ['Dealing with things sensibly and realistically', 'Based on abstract theory', 'Driven purely by wild emotion', 'Unrealistic and dreamy'] },
      { mode: 'synonym', word: 'Candid', promptEn: 'SYNONYM (Similar)', promptVi: 'TỪ ĐỒNG NGHĨA', answer: 'Honest', options: ['Honest', 'Deceitful', 'Evasive', 'Secretive'] },
      { mode: 'antonym', word: 'Ancient', promptEn: 'ANTONYM (Opposite)', promptVi: 'TỪ TRÁI NGHĨA', answer: 'Modern', options: ['Modern', 'Antique', 'Primitive', 'Venerable'] },
      { mode: 'meaning', word: 'Resilient', promptEn: 'MEANING', promptVi: 'ĐỊNH NGHĨA', answer: 'Able to withstand or recover quickly from difficult conditions', options: ['Able to withstand or recover quickly from difficult conditions', 'Fragile and easily broken', 'Rigid and unyielding', 'Slow to adapt'] },
      { mode: 'synonym', word: 'Diligent', promptEn: 'SYNONYM (Similar)', promptVi: 'TỪ ĐỒNG NGHĨA', answer: 'Industrious', options: ['Industrious', 'Lazy', 'Idle', 'Slothful'] },
      { mode: 'antonym', word: 'Vivid', promptEn: 'ANTONYM (Opposite)', promptVi: 'TỪ TRÁI NGHĨA', answer: 'Dull', options: ['Dull', 'Bright', 'Brilliant', 'Colorful'] },
      { mode: 'meaning', word: 'Ambiguous', promptEn: 'MEANING', promptVi: 'ĐỊNH NGHĨA', answer: 'Open to more than one interpretation; having a double meaning', options: ['Open to more than one interpretation; having a double meaning', 'Crystal clear and obvious', 'Strictly factual', 'Completely false'] },
      { mode: 'synonym', word: 'Copious', promptEn: 'SYNONYM (Similar)', promptVi: 'TỪ ĐỒNG NGHĨA', answer: 'Abundant', options: ['Abundant', 'Meager', 'Sparse', 'Scanty'] },
      { mode: 'antonym', word: 'Alleviate', promptEn: 'ANTONYM (Opposite)', promptVi: 'TỪ TRÁI NGHĨA', answer: 'Aggravate', options: ['Aggravate', 'Relieve', 'Ease', 'Mitigate'] },
      { mode: 'meaning', word: 'Nostalgia', promptEn: 'MEANING', promptVi: 'ĐỊNH NGHĨA', answer: 'A sentimental longing for the past', options: ['A sentimental longing for the past', 'Fear of the future', 'Hatred of change', 'Anxiety about the present'] },
      { mode: 'synonym', word: 'Cognizant', promptEn: 'SYNONYM (Similar)', promptVi: 'TỪ ĐỒNG NGHĨA', answer: 'Aware', options: ['Aware', 'Ignorant', 'Unaware', 'Oblivious'] },
      { mode: 'antonym', word: 'Altruistic', promptEn: 'ANTONYM (Opposite)', promptVi: 'TỪ TRÁI NGHĨA', answer: 'Selfish', options: ['Selfish', 'Selfless', 'Charitable', 'Benevolent'] },
      { mode: 'meaning', word: 'Fastidious', promptEn: 'MEANING', promptVi: 'ĐỊNH NGHĨA', answer: 'Very attentive to and concerned about accuracy and detail', options: ['Very attentive to and concerned about accuracy and detail', 'Extremely messy', 'Carefree and relaxed', 'Indifferent to quality'] },
      { mode: 'synonym', word: 'Garrulous', promptEn: 'SYNONYM (Similar)', promptVi: 'TỪ ĐỒNG NGHĨA', answer: 'Talkative', options: ['Talkative', 'Taciturn', 'Quiet', 'Reticent'] },
      { mode: 'antonym', word: 'Hostile', promptEn: 'ANTONYM (Opposite)', promptVi: 'TỪ TRÁI NGHĨA', answer: 'Friendly', options: ['Friendly', 'Unfriendly', 'Aggressive', 'Antagonistic'] },
      { mode: 'meaning', word: 'Innovative', promptEn: 'MEANING', promptVi: 'ĐỊNH NGHĨA', answer: 'Featuring new methods; advanced and original', options: ['Featuring new methods; advanced and original', 'Outdated and traditional', 'Copied from others', 'Simple and plain'] },
      { mode: 'synonym', word: 'Lucid', promptEn: 'SYNONYM (Similar)', promptVi: 'TỪ ĐỒNG NGHĨA', answer: 'Clear', options: ['Clear', 'Confusing', 'Obscure', 'Vague'] },
      { mode: 'antonym', word: 'Mature', promptEn: 'ANTONYM (Opposite)', promptVi: 'TỪ TRÁI NGHĨA', answer: 'Immature', options: ['Immature', 'RIPE', 'Adult', 'Experienced'] },
      { mode: 'meaning', word: 'Obsolete', promptEn: 'MEANING', promptVi: 'ĐỊNH NGHĨA', answer: 'No longer produced or used; out of date', options: ['No longer produced or used; out of date', 'Brand new and modern', 'Popular and trending', 'Essential for life'] },
      { mode: 'synonym', word: 'Placid', promptEn: 'SYNONYM (Similar)', promptVi: 'TỪ ĐỒNG NGHĨA', answer: 'Calm', options: ['Calm', 'Turbulent', 'Agitated', 'Fierce'] },
      { mode: 'antonym', word: 'Paucity', promptEn: 'ANTONYM (Opposite)', promptVi: 'TỪ TRÁI NGHĨA', answer: 'Abundance', options: ['Abundance', 'Scarcity', 'Darthness', 'Lack'] },
      { mode: 'meaning', word: 'Quintessential', promptEn: 'MEANING', promptVi: 'ĐỊNH NGHĨA', answer: 'Representing the most perfect or typical example of a quality', options: ['Representing the most perfect or typical example of a quality', 'Flawed and mediocre', 'Entirely unusual', 'Secondary and minor'] },
      { mode: 'synonym', word: 'Recalcitrant', promptEn: 'SYNONYM (Similar)', promptVi: 'TỪ ĐỒNG NGHĨA', answer: 'Stubborn', options: ['Stubborn', 'Compliant', 'Obedient', 'Docile'] },
      { mode: 'antonym', word: 'Robust', promptEn: 'ANTONYM (Opposite)', promptVi: 'TỪ TRÁI NGHĨA', answer: 'Fragile', options: ['Fragile', 'Strong', 'Sturdy', 'Vigorous'] },
      { mode: 'meaning', word: 'Scrutinize', promptEn: 'MEANING', promptVi: 'ĐỊNH NGHĨA', answer: 'Examine or inspect closely and thoroughly', options: ['Examine or inspect closely and thoroughly', 'Glance at quickly', 'Ignore completely', 'Approve blindly'] },
      { mode: 'synonym', word: 'Taciturn', promptEn: 'SYNONYM (Similar)', promptVi: 'TỪ ĐỒNG NGHĨA', answer: 'Reserved', options: ['Reserved', 'Talkative', 'Garrulous', 'Loquacious'] },
      { mode: 'antonym', word: 'Transient', promptEn: 'ANTONYM (Opposite)', promptVi: 'TỪ TRÁI NGHĨA', answer: 'Permanent', options: ['Permanent', 'Temporary', 'Fleeting', 'Brief'] },
      { mode: 'meaning', word: 'Ubiquitous', promptEn: 'MEANING', promptVi: 'ĐỊNH NGHĨA', answer: 'Present, appearing, or found everywhere', options: ['Present, appearing, or found everywhere', 'Extremely rare and hidden', 'Confined to one place', 'Invisible'] },
      { mode: 'synonym', word: 'Verbose', promptEn: 'SYNONYM (Similar)', promptVi: 'TỪ ĐỒNG NGHĨA', answer: 'Wordy', options: ['Wordy', 'Concise', 'Succinct', 'Brief'] },
      { mode: 'antonym', word: 'Zenith', promptEn: 'ANTONYM (Opposite)', promptVi: 'TỪ TRÁI NGHĨA', answer: 'Nadir', options: ['Nadir', 'Summit', 'Peak', 'Apex'] },
      { mode: 'meaning', word: 'Zealot', promptEn: 'MEANING', promptVi: 'ĐỊNH NGHĨA', answer: 'A person who is fanatical and uncompromising in pursuit of their ideals', options: ['A person who is fanatical and uncompromising in pursuit of their ideals', 'A calm and neutral mediator', 'A lazy bystander', 'An indifferent skeptic'] }
    ];

    this.VI_BANK = [
      { mode: 'synonym', word: 'Nhân hậu', promptEn: 'SYNONYM', promptVi: 'TỪ ĐỒNG NGHĨA', answer: 'Tốt bụng', options: ['Tốt bụng', 'Độc ác', 'Ích kỷ', 'Lười biếng'] },
      { mode: 'antonym', word: 'Tạm thời', promptEn: 'ANTONYM', promptVi: 'TỪ TRÁI NGHĨA', answer: 'Vĩnh viễn', options: ['Vĩnh viễn', 'Nhất thời', 'Ngắn ngủi', 'Thoáng qua'] },
      { mode: 'meaning', word: 'Tỉ mỉ', promptEn: 'MEANING', promptVi: 'ĐỊNH NGHĨA', answer: 'Chú ý rất kỹ đến từng chi tiết nhỏ', options: ['Chú ý rất kỹ đến từng chi tiết nhỏ', 'Cẩu thả và qua loa', 'Nhanh chóng và bất cẩn', 'Yên tĩnh và khép kín'] },
      { mode: 'synonym', word: 'Dũng cảm', promptEn: 'SYNONYM', promptVi: 'TỪ ĐỒNG NGHĨA', answer: 'Can đảm', options: ['Can đảm', 'Nhút nhát', 'Rụt rè', 'Sợ sệt'] },
      { mode: 'antonym', word: 'Dồi dào', promptEn: 'ANTONYM', promptVi: 'TỪ TRÁI NGHĨA', answer: 'Khan hiếm', options: ['Khan hiếm', 'Phong phú', 'Nhiều', 'Vô tận'] },
      { mode: 'meaning', word: 'Thực tế', promptEn: 'MEANING', promptVi: 'ĐỊNH NGHĨA', answer: 'Giải quyết vấn đề một cách hợp lý và sát với thực tiễn', options: ['Giải quyết vấn đề một cách hợp lý và sát với thực tiễn', 'Dựa trên lý thuyết trừu tượng', 'Chỉ theo cảm xúc bồng bột', 'Mơ mộng viển vông'] },
      { mode: 'synonym', word: 'Thẳng thắn', promptEn: 'SYNONYM', promptVi: 'TỪ ĐỒNG NGHĨA', answer: 'Thật thà', options: ['Thật thà', 'Gian dối', 'Lươn lẹo', 'Kín đáo'] },
      { mode: 'antonym', word: 'Cổ xưa', promptEn: 'ANTONYM', promptVi: 'TỪ TRÁI NGHĨA', answer: 'Hiện đại', options: ['Hiện đại', 'Đồ cổ', 'Nguyên thủy', 'Lâu đời'] },
      { mode: 'meaning', word: 'Kiên cường', promptEn: 'MEANING', promptVi: 'ĐỊNH NGHĨA', answer: 'Có khả năng chịu đựng và hồi phục nhanh chóng trước khó khăn', options: ['Có khả năng chịu đựng và hồi phục nhanh chóng trước khó khăn', 'Mong manh dễ vỡ', 'Cứng nhắc không linh hoạt', 'Chậm thích nghi'] },
      { mode: 'synonym', word: 'Chăm chỉ', promptEn: 'SYNONYM', promptVi: 'TỪ ĐỒNG NGHĨA', answer: 'Cần cù', options: ['Cần cù', 'Lười biếng', 'Chây lười', 'Ỉ ại'] },
      { mode: 'antonym', word: 'Sống động', promptEn: 'ANTONYM', promptVi: 'TỪ TRÁI NGHĨA', answer: 'Nhạt nhẽo', options: ['Nhạt nhẽo', 'Rực rỡ', 'Tươi sáng', 'Sinh động'] },
      { mode: 'meaning', word: 'Mơ hồ', promptEn: 'MEANING', promptVi: 'ĐỊNH NGHĨA', answer: 'Có thể hiểu theo nhiều cách khác nhau, chưa rõ ràng', options: ['Có thể hiểu theo nhiều cách khác nhau, chưa rõ ràng', 'Rõ ràng rành mạch', 'Đúng sự thật 100%', 'Hoàn toàn sai sự thật'] },
      { mode: 'synonym', word: 'Phong phú', promptEn: 'SYNONYM', promptVi: 'TỪ ĐỒNG NGHĨA', answer: 'Dồi dào', options: ['Dồi dào', 'Ít ỏi', 'Nghèo nàn', 'Khan hiếm'] },
      { mode: 'antonym', word: 'Xoa dịu', promptEn: 'ANTONYM', promptVi: 'TỪ TRÁI NGHĨA', answer: 'Trầm trọng hóa', options: ['Trầm trọng hóa', 'Làm dịu', 'Giảm bớt', 'Ôn hòa'] },
      { mode: 'meaning', word: 'Hoài niệm', promptEn: 'MEANING', promptVi: 'ĐỊNH NGHĨA', answer: 'Nỗi nhớ thương da diết về những ký ức trong quá khứ', options: ['Nỗi nhớ thương da diết về những ký ức trong quá khứ', 'Sợ hãi tương lai', 'Ghét sự thay đổi', 'Lo lắng hiện tại'] },
      { mode: 'synonym', word: 'Nhận thức', promptEn: 'SYNONYM', promptVi: 'TỪ ĐỒNG NGHĨA', answer: 'Hiểu biết', options: ['Hiểu biết', 'Vô minh', 'Mù mờ', 'Quên lãng'] },
      { mode: 'antonym', word: 'Vị tha', promptEn: 'ANTONYM', promptVi: 'TỪ TRÁI NGHĨA', answer: 'Ích kỷ', options: ['Ích kỷ', 'Quên mình', 'Bác ái', 'Nhân đạo'] },
      { mode: 'meaning', word: 'Kén chọn', promptEn: 'MEANING', promptVi: 'ĐỊNH NGHĨA', answer: 'Cực kỳ chú trọng và khắt khe về độ chính xác và chất lượng', options: ['Cực kỳ chú trọng và khắt khe về độ chính xác và chất lượng', 'Bừa bộn và cẩu thả', 'Vô tư thoải mái', 'Dễ dãi mọi thứ'] },
      { mode: 'synonym', word: 'Nói nhiều', promptEn: 'SYNONYM', promptVi: 'TỪ ĐỒNG NGHĨA', answer: 'Lắm lời', options: ['Lắm lời', 'Ít nói', 'Trầm ngâm', 'Lầm lì'] },
      { mode: 'antonym', word: 'Thù địch', promptEn: 'ANTONYM', promptVi: 'TỪ TRÁI NGHĨA', answer: 'Thân thiện', options: ['Thân thiện', 'Gây hấn', 'Chống đối', 'Hằn học'] },
      { mode: 'meaning', word: 'Đổi mới', promptEn: 'MEANING', promptVi: 'ĐỊNH NGHĨA', answer: 'Mang lại phương pháp mới mẻ, tiên tiến và độc đáo', options: ['Mang lại phương pháp mới mẻ, tiên tiến và độc đáo', 'Lỗi thời và truyền thống', 'Sao chép từ người khác', 'Đơn giản tầm thường'] },
      { mode: 'synonym', word: 'Rõ ràng', promptEn: 'SYNONYM', promptVi: 'TỪ ĐỒNG NGHĨA', answer: 'Minh bạch', options: ['Minh bạch', 'Mơ hồ', 'Rối rắm', 'Tối nghĩa'] },
      { mode: 'antonym', word: 'Trưởng thành', promptEn: 'ANTONYM', promptVi: 'TỪ TRÁI NGHĨA', answer: 'Non nớt', options: ['Non nớt', 'Chín chắn', 'Già dặn', 'Dày dạn'] },
      { mode: 'meaning', word: 'Lỗi thời', promptEn: 'MEANING', promptVi: 'ĐỊNH NGHĨA', answer: 'Không còn được sản xuất hoặc sử dụng nữa; đã lạc hậu', options: ['Không còn được sản xuất hoặc sử dụng nữa; đã lạc hậu', 'Mới tinh hiện đại', 'Đang thịnh hành', 'Thiết yếu cho cuộc sống'] },
      { mode: 'synonym', word: 'Yên bình', promptEn: 'SYNONYM', promptVi: 'TỪ ĐỒNG NGHĨA', answer: 'Thanh tịnh', options: ['Thanh tịnh', 'Sóng gió', 'Hỗn loạn', 'Dữ dội'] },
      { mode: 'antonym', word: 'Thiếu thốn', promptEn: 'ANTONYM', promptVi: 'TỪ TRÁI NGHĨA', answer: 'Dư dả', options: ['Dư dả', 'Khan hiếm', 'Nghèo nàn', 'Hụt hẫng'] },
      { mode: 'meaning', word: 'Điển hình', promptEn: 'MEANING', promptVi: 'ĐỊNH NGHĨA', answer: 'Đại diện tiêu biểu và hoàn hảo nhất cho một phẩm chất', options: ['Đại diện tiêu biểu và hoàn hảo nhất cho một phẩm chất', 'Sai sót tầm thường', 'Hoàn toàn khác lạ', 'Thứ yếu phụ trợ'] },
      { mode: 'synonym', word: 'Bướng bỉnh', promptEn: 'SYNONYM', promptVi: 'TỪ ĐỒNG NGHĨA', answer: 'Cứng đầu', options: ['Cứng đầu', 'Dễ bảo', 'Vâng lời', 'Hiền hòa'] },
      { mode: 'antonym', word: 'Vững chắc', promptEn: 'ANTONYM', promptVi: 'TỪ TRÁI NGHĨA', answer: 'Mỏng manh', options: ['Mỏng manh', 'Kiên cố', 'Vững chãi', 'Cường tráng'] },
      { mode: 'meaning', word: 'Soát xét', promptEn: 'MEANING', promptVi: 'ĐỊNH NGHĨA', answer: 'Kiểm tra hoặc xem xét cực kỳ kỹ lưỡng và chi tiết', options: ['Kiểm tra hoặc xem xét cực kỳ kỹ lưỡng và chi tiết', 'Nhìn lướt qua', 'Bỏ qua hoàn toàn', 'Công nhận mù quáng'] },
      { mode: 'synonym', word: 'Ít nói', promptEn: 'SYNONYM', promptVi: 'TỪ ĐỒNG NGHĨA', answer: 'Trầm tính', options: ['Trầm tính', 'Nói nhiều', 'Náo nhiệt', 'Ò í ê'] },
      { mode: 'antonym', word: 'Thoáng qua', promptEn: 'ANTONYM', promptVi: 'TỪ TRÁI NGHĨA', answer: 'Lâu dài', options: ['Lâu dài', 'Ngắn ngủi', 'Tạm bợ', 'Vội vã'] },
      { mode: 'meaning', word: 'Phổ biến', promptEn: 'MEANING', promptVi: 'ĐỊNH NGHĨA', answer: 'Có mặt hoặc xuất hiện ở khắp mọi nơi', options: ['Có mặt hoặc xuất hiện ở khắp mọi nơi', 'Cực kỳ hiếm hoi', 'Chỉ có ở một nơi', 'Vô hình'] },
      { mode: 'synonym', word: 'Dài dòng', promptEn: 'SYNONYM', promptVi: 'TỪ ĐỒNG NGHĨA', answer: 'Lắm chữ', options: ['Lắm chữ', 'Ngắn gọn', 'Súc tích', 'Cô đọng'] },
      { mode: 'antonym', word: 'Đỉnh cao', promptEn: 'ANTONYM', promptVi: 'TỪ TRÁI NGHĨA', answer: 'Đáy vực', options: ['Đáy vực', 'Tột đỉnh', 'Chóp vót', 'Đỉnh điểm'] },
      { mode: 'meaning', word: 'Cuồng tín', promptEn: 'MEANING', promptVi: 'ĐỊNH NGHĨA', answer: 'Mê muội và không khoan nhượng trong việc theo đuổi lý tưởng', options: ['Mê muội và không khoan nhượng trong việc theo đuổi lý tưởng', 'Người hòa giải trung lập', 'Kẻ bàng quan lười biếng', 'Người hoài nghi'] }
    ];
  }

  initialize() {
    const isVi = this.lang === 'vi';
    this.container.innerHTML = `
      <div class="neuro-game vocabulary-challenge-game" style="display:flex; flex-direction:column; align-items:center; justify-content:space-between; height:100%; padding:16px; background:#0f172a; color:#f8fafc; font-family:sans-serif; user-select:none;">
        <div class="vc-hud" style="display:flex; justify-content:space-between; width:100%; max-width:500px; font-size:16px; font-weight:600;">
          <div>⏱️ <span id="vc-time">${this.timeLeft}</span>s</div>
          <div>🏆 <span id="vc-score">0</span></div>
          <div>🔥 <span id="vc-streak">0</span></div>
        </div>

        <div style="display:flex; flex-direction:column; align-items:center; gap:12px; width:100%; max-width:500px;">
          <div id="vc-mode-badge" style="background:rgba(99,102,241,0.2); border:2px solid #6366f1; color:#818cf8; padding:6px 16px; border-radius:9999px; font-size:13px; font-weight:bold; letter-spacing:1px; text-transform:uppercase;"></div>
          
          <div style="background:#1e293b; border:4px solid #334155; border-radius:24px; padding:24px; width:100%; text-align:center; box-shadow:0 10px 25px rgba(0,0,0,0.5);">
            <div id="vc-word" style="font-size:32px; font-weight:800; color:#f8fafc; margin-bottom:8px;"></div>
            <div id="vc-prompt-desc" style="font-size:14px; color:#94a3b8;"></div>
          </div>
        </div>

        <div class="vc-options-grid" style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; width:100%; max-width:500px; margin-bottom:12px;">
          ${[0, 1, 2, 3].map(i => `
            <button class="vc-option-btn" data-index="${i}" style="min-height:64px; border-radius:16px; border:3px solid #334155; background:#1e293b; color:#f8fafc; font-size:16px; font-weight:bold; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.3); transition:all 0.15s ease; padding:8px;"></button>
          `).join('')}
        </div>
      </div>
    `;

    this.container.querySelectorAll('.vc-option-btn').forEach(btn => {
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
      const timeEl = this.container.querySelector('#vc-time');
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
      this.usedIndices.clear();
    }

    let idx;
    do {
      idx = Math.floor(Math.random() * bank.length);
    } while (this.usedIndices.has(idx));

    this.usedIndices.add(idx);
    const item = bank[idx];

    const shuffledOptions = [...item.options].sort(() => Math.random() - 0.5);
    this.currentQuestion = { ...item, shuffledOptions };

    const modeBadge = this.container.querySelector('#vc-mode-badge');
    const wordEl = this.container.querySelector('#vc-word');
    const promptDesc = this.container.querySelector('#vc-prompt-desc');

    if (modeBadge) {
      modeBadge.textContent = this.lang === 'vi' ? item.promptVi : item.promptEn;
    }
    if (wordEl) wordEl.textContent = item.word;
    if (promptDesc) {
      const modeLabels = {
        synonym: this.lang === 'vi' ? 'Chọn từ đồng nghĩa:' : 'Choose synonym:',
        antonym: this.lang === 'vi' ? 'Chọn từ trái nghĩa:' : 'Choose antonym:',
        meaning: this.lang === 'vi' ? 'Chọn định nghĩa chính xác:' : 'Choose correct meaning:'
      };
      promptDesc.textContent = modeLabels[item.mode];
    }

    const optionBtns = this.container.querySelectorAll('.vc-option-btn');
    optionBtns.forEach((btn, i) => {
      btn.textContent = shuffledOptions[i];
      btn.style.background = '#1e293b';
      btn.style.borderColor = '#334155';
    });
  }

  handleAnswer(selectedText) {
    if (this.status !== 'running' || !this.currentQuestion) return;
    this.totalAttempts++;

    const isCorrect = selectedText === this.currentQuestion.answer;

    if (isCorrect) {
      this.correctCount++;
      this.streak++;
      this.score += 50 + this.streak * 5;
      if (this.callbacks.audio?.tap) this.callbacks.audio.tap();
    } else {
      this.streak = 0;
      this.score = Math.max(0, this.score - 10);
      if (this.callbacks.audio?.error) this.callbacks.audio.error();
    }

    const accuracy = Math.round((this.correctCount / this.totalAttempts) * 100);
    const scoreEl = this.container.querySelector('#vc-score');
    const streakEl = this.container.querySelector('#vc-streak');
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
