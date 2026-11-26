/**
 * @file games-catalog.js
 * @description Catalog of all 27 original mini-games across 8 cognitive categories.
 */

export const GAMES_CATALOG = [
  // --- MEMORY (1-4) ---
  {
    id: 'sequence-recall',
    num: 1,
    categoryId: 'memory',
    name: { en: 'Sequence Recall', vi: 'Ghi nhớ chuỗi' },
    subtitle: { en: 'Repeat glowing pad sequences', vi: 'Lặp lại chuỗi sáng trên bảng' },
    description: {
      en: 'Watch the sequence of illuminated tiles and repeat them in exact order. Sequences grow longer with every successful round.',
      vi: 'Quan sát chuỗi các ô sáng lên và lặp lại theo đúng thứ tự. Chuỗi sẽ dài hơn sau mỗi vòng thành công.'
    },
    instructions: {
      en: ['Watch the tiles light up in order', 'Wait for the prompt', 'Tap the tiles in the exact sequence'],
      vi: ['Quan sát các ô sáng theo thứ tự', 'Chờ tín hiệu sẵn sàng', 'Chạm vào các ô theo đúng chuỗi']
    },
    durationSec: 60,
    estimatedMin: 2,
    primarySkill: { en: 'Spatial Working Memory', vi: 'Trí nhớ làm việc không gian' }
  },
  {
    id: 'number-memory',
    num: 2,
    categoryId: 'memory',
    name: { en: 'Number Memory', vi: 'Trí nhớ chữ số' },
    subtitle: { en: 'Memorize and recall expanding digits', vi: 'Ghi nhớ và tái hiện dãy số mở rộng' },
    description: {
      en: 'A number flashes briefly on screen. Memorize the digits and type them back accurately.',
      vi: 'Một dãy số xuất hiện chớp nhoáng trên màn hình. Ghi nhớ các chữ số và nhập lại chính xác.'
    },
    instructions: {
      en: ['Observe the number flash', 'Wait for input field', 'Type the number and submit'],
      vi: ['Quan sát số xuất hiện', 'Chờ khung nhập hiện ra', 'Nhập số và xác nhận']
    },
    durationSec: 60,
    estimatedMin: 2,
    primarySkill: { en: 'Verbal Working Memory', vi: 'Trí nhớ làm việc ngôn ngữ' }
  },
  {
    id: 'spatial-memory',
    num: 3,
    categoryId: 'memory',
    name: { en: 'Spatial Memory', vi: 'Trí nhớ không gian' },
    subtitle: { en: 'Remember grid tile positions', vi: 'Ghi nhớ vị trí các ô trên lưới' },
    description: {
      en: 'A pattern of tiles lights up on a grid momentarily. Once they hide, click all the correct tiles.',
      vi: 'Một mẫu các ô sáng lên trên lưới trong giây lát. Sau khi chúng ẩn đi, hãy chọn lại đúng các ô đó.'
    },
    instructions: {
      en: ['Memorize highlighted tile positions', 'Wait for tiles to reset', 'Click all correct tiles'],
      vi: ['Ghi nhớ vị trí các ô được tô sáng', 'Chờ các ô đặt lại', 'Nhấn chọn tất cả các ô đúng']
    },
    durationSec: 60,
    estimatedMin: 2,
    primarySkill: { en: 'Visual-Spatial Retention', vi: 'Lưu giữ thị giác - không gian' }
  },
  {
    id: 'card-matching',
    num: 4,
    categoryId: 'memory',
    name: { en: 'Card Matching', vi: 'Lật bài trí nhớ' },
    subtitle: { en: 'Flip and match pairs of icons', vi: 'Lật và ghép đôi các biểu tượng' },
    description: {
      en: 'Test your episodic memory by flipping cards to find matching pairs in the fewest moves.',
      vi: 'Kiểm tra trí nhớ sự kiện bằng cách lật bài để tìm các cặp giống nhau với số lần ít nhất.'
    },
    instructions: {
      en: ['Tap a card to reveal its symbol', 'Find its matching pair', 'Clear all pairs quickly'],
      vi: ['Chạm vào thẻ để lật biểu tượng', 'Tìm cặp tương ứng', 'Xóa sạch các cặp thật nhanh']
    },
    durationSec: 90,
    estimatedMin: 3,
    primarySkill: { en: 'Episodic & Visual Memory', vi: 'Trí nhớ sự kiện & thị giác' }
  },

  // --- ATTENTION (5-8) ---
  {
    id: 'target-tracking',
    num: 5,
    categoryId: 'attention',
    name: { en: 'Target Tracking', vi: 'Theo dõi mục tiêu' },
    subtitle: { en: 'Follow designated moving targets', vi: 'Bám sát các mục tiêu di chuyển' },
    description: {
      en: 'Keep your focus on designated moving targets as they shuffle amongst distractors.',
      vi: 'Duy trì sự tập trung vào các mục tiêu di chuyển được chỉ định khi chúng trộn lẫn với vật cản.'
    },
    instructions: {
      en: ['Identify targets at start', 'Track them as they move', 'Select targets when motion stops'],
      vi: ['Xác định mục tiêu lúc đầu', 'Theo dõi khi chúng chuyển động', 'Chọn mục tiêu khi chuyển động dừng lại']
    },
    durationSec: 60,
    estimatedMin: 2,
    primarySkill: { en: 'Focused & Divided Attention', vi: 'Sự chú ý tập trung & phân tán' }
  },
  {
    id: 'selective-attention',
    num: 6,
    categoryId: 'attention',
    name: { en: 'Selective Attention', vi: 'Chú ý chọn lọc' },
    subtitle: { en: 'Filter noise and catch targets', vi: 'Lọc nhiễu và bắt mục tiêu chính' },
    description: {
      en: 'Respond only to valid stimuli while ignoring frequent distractors appearing in your field of view.',
      vi: 'Chỉ phản hồi với kích thích hợp lệ trong khi phớt lờ các vật cản xuất hiện liên tục.'
    },
    instructions: {
      en: ['Note the target condition', 'Tap matching items', 'Ignore distractor items'],
      vi: ['Ghi nhớ điều kiện mục tiêu', 'Chạm vào vật phẩm khớp', 'Phớt lờ các vật phẩm gây nhiễu']
    },
    durationSec: 60,
    estimatedMin: 2,
    primarySkill: { en: 'Inhibitory Control', vi: 'Kiểm soát ức chế' }
  },
  {
    id: 'visual-search',
    num: 7,
    categoryId: 'attention',
    name: { en: 'Visual Search', vi: 'Tìm kiếm thị giác' },
    subtitle: { en: 'Find unique items in a crowd', vi: 'Tìm vật thể khác biệt giữa đám đông' },
    description: {
      en: 'Scan the visual field rapidly to locate the distinct target hidden among similar distractors.',
      vi: 'Quét thị trường thật nhanh để định vị mục tiêu khác biệt ẩn giữa các hình tương tự.'
    },
    instructions: {
      en: ['Scan items on screen', 'Locate the unique anomaly', 'Tap it before time expires'],
      vi: ['Quét các vật phẩm trên màn hình', 'Xác định điểm bất thường duy nhất', 'Chạm vào nó trước khi hết giờ']
    },
    durationSec: 60,
    estimatedMin: 2,
    primarySkill: { en: 'Visual Scanning & Search', vi: 'Quét & Tìm kiếm thị giác' }
  },
  {
    id: 'stroop-challenge',
    num: 8,
    categoryId: 'attention',
    name: { en: 'Stroop Challenge', vi: 'Thử thách Stroop' },
    subtitle: { en: 'Match ink color, ignore word text', vi: 'Khớp màu mực, phớt lờ chữ viết' },
    description: {
      en: 'A classic cognitive test: decide based on the color of the ink rather than the written color word.',
      vi: 'Bài kiểm tra nhận thức kinh điển: quyết định dựa trên màu mực thay vì nghĩa của từ được viết.'
    },
    instructions: {
      en: ['Read ink color, not the word', 'Tap corresponding color button', 'Maintain speed and accuracy'],
      vi: ['Đọc màu mực, không đọc chữ', 'Chạm nút màu tương ứng', 'Duy trì tốc độ và độ chính xác']
    },
    durationSec: 60,
    estimatedMin: 2,
    primarySkill: { en: 'Cognitive Interference Resolution', vi: 'Giải quyết xung đột nhận thức' }
  },

  // --- PROCESSING SPEED (9-12) ---
  {
    id: 'speed-match',
    num: 9,
    categoryId: 'speed',
    name: { en: 'Speed Match', vi: 'Khớp tốc độ' },
    subtitle: { en: 'Determine if item matches previous', vi: 'Xác định vật phẩm có khớp với trước đó không' },
    description: {
      en: 'Quickly judge whether the currently displayed symbol matches the one shown just prior.',
      vi: 'Nhanh chóng phán đoán biểu tượng hiện tại có khớp với biểu tượng ngay trước đó hay không.'
    },
    instructions: {
      en: ['Observe current symbol', 'Compare with previous item', 'Press Match or Different'],
      vi: ['Quan sát biểu tượng hiện tại', 'So sánh với mục trước', 'Nhấn Khớp hoặc Khác']
    },
    durationSec: 60,
    estimatedMin: 2,
    primarySkill: { en: 'Perceptual Speed', vi: 'Tốc độ nhận thức' }
  },
  {
    id: 'reaction-time',
    num: 10,
    categoryId: 'speed',
    name: { en: 'Reaction Time', vi: 'Thời gian phản ứng' },
    subtitle: { en: 'Tap instantly when screen changes', vi: 'Chạm ngay lập tức khi màn hình đổi màu' },
    description: {
      en: 'Wait for the color signal and tap as fast as humanly possible to measure your raw reflexes.',
      vi: 'Chờ tín hiệu màu và chạm nhanh nhất có thể để đo lường phản xạ thô của bạn.'
    },
    instructions: {
      en: ['Wait for color change', 'Tap screen instantly', 'Avoid false starts'],
      vi: ['Chờ tín hiệu đổi màu', 'Chạm màn hình ngay lập tức', 'Tránh bấm trước tín hiệu']
    },
    durationSec: 45,
    estimatedMin: 2,
    primarySkill: { en: 'Motor Speed & Reflexes', vi: 'Tốc độ vận động & Phản xạ' }
  },
  {
    id: 'rapid-calculation',
    num: 11,
    categoryId: 'speed',
    name: { en: 'Rapid Calculation', vi: 'Tính toán tốc độ' },
    subtitle: { en: 'Solve lightning-fast arithmetic', vi: 'Giải toán chớp nhoáng siêu tốc' },
    description: {
      en: 'Answer simple arithmetic equations at maximum speed before the timer runs out.',
      vi: 'Trả lời các phương trình số học đơn giản với tốc độ tối đa trước khi hết giờ.'
    },
    instructions: {
      en: ['View equation', 'Compute answer', 'Tap correct option or numpad'],
      vi: ['Xem phương trình', 'Tính toán kết quả', 'Chạm đáp án hoặc bàn phím số']
    },
    durationSec: 60,
    estimatedMin: 2,
    primarySkill: { en: 'Mental Processing Velocity', vi: 'Tốc độ xử lý tâm thần' }
  },
  {
    id: 'symbol-comparison',
    num: 12,
    categoryId: 'speed',
    name: { en: 'Symbol Comparison', vi: 'So sánh ký hiệu' },
    subtitle: { en: 'Are both symbol pairs identical?', vi: 'Hai cặp ký hiệu có giống hệt nhau không?' },
    description: {
      en: 'Inspect two symbol pairs side-by-side and decide rapidly if they are identical or different.',
      vi: 'Kiểm tra hai cặp ký hiệu cạnh nhau và quyết định nhanh chóng chúng giống hay khác nhau.'
    },
    instructions: {
      en: ['Compare left and right pairs', 'Check all symbols', 'Tap Same or Different'],
      vi: ['So sánh cặp trái và phải', 'Kiểm tra mọi ký hiệu', 'Nhấn Giống hoặc Khác']
    },
    durationSec: 60,
    estimatedMin: 2,
    primarySkill: { en: 'Visual Discrimination Speed', vi: 'Tốc độ phân biệt thị giác' }
  },

  // --- PROBLEM SOLVING (13-16) ---
  {
    id: 'pattern-recognition',
    num: 13,
    categoryId: 'problem',
    name: { en: 'Pattern Recognition', vi: 'Nhận diện quy luật' },
    subtitle: { en: 'Complete the missing sequence tile', vi: 'Hoàn thành ô thiếu trong chuỗi' },
    description: {
      en: 'Analyze visual matrices or number sequences to deduce the underlying rule and select the missing piece.',
      vi: 'Phân tích ma trận thị giác hoặc chuỗi số để suy ra quy tắc ngầm và chọn mảnh còn thiếu.'
    },
    instructions: {
      en: ['Study the sequence pattern', 'Deduce missing element', 'Select correct tile'],
      vi: ['Nghiên cứu mẫu chuỗi', 'Suy luận phần tử thiếu', 'Chọn ô đúng']
    },
    durationSec: 90,
    estimatedMin: 3,
    primarySkill: { en: 'Inductive Reasoning', vi: 'Suy luận quy nạp' }
  },
  {
    id: 'matrix-reasoning',
    num: 14,
    categoryId: 'problem',
    name: { en: 'Matrix Reasoning', vi: 'Suy luận ma trận' },
    subtitle: { en: 'Solve abstract grid relationships', vi: 'Giải quyết quan hệ lưới trừu tượng' },
    description: {
      en: 'Examine 3x3 grids with one missing symbol and choose the item that satisfies row and column logic.',
      vi: 'Kiểm tra lưới 3x3 thiếu một biểu tượng và chọn mục thỏa mãn logic hàng và cột.'
    },
    instructions: {
      en: ['Analyze row/column pattern', 'Find missing element', 'Select from options'],
      vi: ['Phân tích quy luật hàng/cột', 'Tìm phần tử thiếu', 'Chọn từ các phương án']
    },
    durationSec: 90,
    estimatedMin: 3,
    primarySkill: { en: 'Fluid Intelligence', vi: 'Trí thông minh lưu động' }
  },
  {
    id: 'tower-of-hanoi',
    num: 15,
    categoryId: 'problem',
    name: { en: 'Tower of Hanoi', vi: 'Tháp Hà Nội' },
    subtitle: { en: 'Move disks to target peg efficiently', vi: 'Di chuyển đĩa sang cột đích hiệu quả' },
    description: {
      en: 'Transfer all disks from source to target peg following strict rules in minimal moves.',
      vi: 'Chuyển toàn bộ đĩa từ cột nguồn sang cột đích theo đúng quy tắc với số bước tối thiểu.'
    },
    instructions: {
      en: ['Tap source peg to pick top disk', 'Tap destination peg to place', 'Never place larger on smaller'],
      vi: ['Chạm cột nguồn lấy đĩa trên cùng', 'Chạm cột đích để đặt đĩa', 'Không đặt đĩa lớn lên đĩa nhỏ']
    },
    durationSec: 120,
    estimatedMin: 3,
    primarySkill: { en: 'Strategic Planning & Foresight', vi: 'Lập chiến lược & Tầm nhìn xa' }
  },
  {
    id: 'puzzle-solver',
    num: 16,
    categoryId: 'problem',
    name: { en: 'Puzzle Solver', vi: 'Giải câu đố ghép hình' },
    subtitle: { en: 'Slide and assemble image fragments', vi: 'Trượt và lắp ráp các mảnh hình ảnh' },
    description: {
      en: 'Rearrange randomized grid tiles into their correct original positions to complete the picture.',
      vi: 'Sắp xếp lại các ô lưới xáo trộn về đúng vị trí ban đầu để hoàn thành bức tranh.'
    },
    instructions: {
      en: ['Tap adjacent tile to empty slot', 'Slide tiles into place', 'Reconstruct full picture'],
      vi: ['Chạm ô liền kề ô trống', 'Trượt các ô vào vị trí', 'Tái tạo lại bức tranh hoàn chỉnh']
    },
    durationSec: 120,
    estimatedMin: 3,
    primarySkill: { en: 'Spatial Visualization', vi: 'Trực quan hóa không gian' }
  },

  // --- MENTAL MATH (17-19) ---
  {
    id: 'mental-arithmetic',
    num: 17,
    categoryId: 'math',
    name: { en: 'Mental Arithmetic', vi: 'Toán nhẩm nhanh' },
    subtitle: { en: 'Solve dynamic addition and subtraction', vi: 'Giải phép cộng trừ linh hoạt' },
    description: {
      en: 'Perform rapid mental calculations involving multi-step arithmetic operations.',
      vi: 'Thực hiện tính nhẩm nhanh các phép tính số học nhiều bước.'
    },
    instructions: {
      en: ['Read expression carefully', 'Calculate result in head', 'Enter answer via numpad'],
      vi: ['Đọc kỹ biểu thức', 'Tính kết quả trong đầu', 'Nhập đáp án qua bàn phím số']
    },
    durationSec: 60,
    estimatedMin: 2,
    primarySkill: { en: 'Numerical Fluency', vi: 'Sự lưu loát số học' }
  },
  {
    id: 'number-series',
    num: 18,
    categoryId: 'math',
    name: { en: 'Number Series', vi: 'Dãy số quy luật' },
    subtitle: { en: 'Find the next number in the series', vi: 'Tìm số tiếp theo trong dãy số' },
    description: {
      en: 'Identify the mathematical progression rule in a number series and supply the missing number.',
      vi: 'Xác định quy quy luật tiến triển toán học trong dãy số và điền số còn thiếu.'
    },
    instructions: {
      en: ['Examine number sequence step', 'Determine progression rule', 'Type next number'],
      vi: ['Kiểm tra bước nhảy dãy số', 'Xác định quy luật tiến triển', 'Nhập số tiếp theo']
    },
    durationSec: 90,
    estimatedMin: 3,
    primarySkill: { en: 'Numerical Deduction', vi: 'Suy luận số học' }
  },
  {
    id: 'quick-estimate',
    num: 19,
    categoryId: 'math',
    name: { en: 'Quick Estimate', vi: 'Ước lượng nhanh' },
    subtitle: { en: 'Approximate calculations swiftly', vi: 'Xấp xỉ kết quả tính toán nhanh chóng' },
    description: {
      en: 'Quickly judge whether proposed large-number calculations are over or under the target value.',
      vi: 'Nhanh chóng phán đoán phép tính số lớn đề xuất là lớn hơn hay nhỏ hơn giá trị mục tiêu.'
    },
    instructions: {
      en: ['View equation estimate', 'Compare with target value', 'Tap Higher or Lower'],
      vi: ['Xem ước lượng phép tính', 'So sánh với giá trị mục tiêu', 'Nhấn Cao hơn hoặc Thấp hơn']
    },
    durationSec: 60,
    estimatedMin: 2,
    primarySkill: { en: 'Numerical Estimation', vi: 'Ước lượng số học' }
  },

  // --- COGNITIVE FLEXIBILITY (20-22) ---
  {
    id: 'task-switching',
    num: 20,
    categoryId: 'flexibility',
    name: { en: 'Task Switching', vi: 'Chuyển đổi nhiệm vụ' },
    subtitle: { en: 'Alternate rules between odd/even & color', vi: 'Luân phiên quy tắc chẵn/lẻ & màu sắc' },
    description: {
      en: 'Switch back and forth between sorting cards by number parity or color based on changing prompts.',
      vi: 'Chuyển đổi qua lại giữa việc phân loại thẻ theo tính chẵn lẻ hoặc màu sắc dựa trên thông báo thay đổi.'
    },
    instructions: {
      en: ['Read current sort rule', 'Evaluate card property', 'Tap left or right accordingly'],
      vi: ['Đọc quy tắc sắp xếp hiện tại', 'Đánh giá thuộc tính thẻ', 'Chạm trái hoặc phải tương ứng']
    },
    durationSec: 60,
    estimatedMin: 2,
    primarySkill: { en: 'Task Set Shifting', vi: 'Chuyển dịch tập hợp nhiệm vụ' }
  },
  {
    id: 'rule-change',
    num: 21,
    categoryId: 'flexibility',
    name: { en: 'Rule Change', vi: 'Thay đổi quy tắc' },
    subtitle: { en: 'Adapt as sorting criteria shifts mid-game', vi: 'Thích ứng khi tiêu chí sắp xếp đổi giữa chừng' },
    description: {
      en: 'Stay alert as sorting rules invert or mutate without warning during active gameplay.',
      vi: 'Luôn cảnh giác khi các quy tắc sắp xếp đảo ngược hoặc biến đổi bất ngờ trong khi chơi.'
    },
    instructions: {
      en: ['Follow active sorting rule', 'Notice rule-change alert', 'Adapt instantly to new rule'],
      vi: ['Tuân theo quy tắc sắp xếp hiện hành', 'Chú ý thông báo đổi quy tắc', 'Thích ứng ngay với quy tắc mới']
    },
    durationSec: 60,
    estimatedMin: 2,
    primarySkill: { en: 'Cognitive Adaptability', vi: 'Khả năng thích ứng nhận thức' }
  },
  {
    id: 'dual-n-back',
    num: 22,
    categoryId: 'flexibility',
    name: { en: 'Dual N-Back', vi: 'Dual N-Back kép' },
    subtitle: { en: 'Track matching audio and visual cues', vi: 'Theo dõi đồng thời tín hiệu âm thanh & thị giác' },
    description: {
      en: 'Simultaneously monitor audio sounds and visual grid positions matching N steps back.',
      vi: 'Đồng thời theo dõi âm thanh và vị trí lưới trùng khớp với N bước trước đó.'
    },
    instructions: {
      en: ['Watch grid position', 'Listen to audio letter', 'Press match for position or sound'],
      vi: ['Theo dõi vị trí lưới', 'Lắng nghe chữ cái âm thanh', 'Nhấn khớp cho vị trí hoặc âm thanh']
    },
    durationSec: 90,
    estimatedMin: 3,
    primarySkill: { en: 'Dual-Task Working Memory', vi: 'Trí nhớ làm việc đa nhiệm' }
  },

  // --- LANGUAGE (23-24) ---
  {
    id: 'word-association',
    num: 23,
    categoryId: 'language',
    name: { en: 'Word Association', vi: 'Liên tưởng từ vựng' },
    subtitle: { en: 'Match semantic word synonyms', vi: 'Ghép đôi từ đồng nghĩa ngữ nghĩa' },
    description: {
      en: 'Connect related words, synonyms, and conceptual pairs quickly to boost verbal agility.',
      vi: 'Kết nối nhanh các từ liên quan, từ đồng nghĩa và cặp khái niệm để tăng sự linh hoạt ngôn từ.'
    },
    instructions: {
      en: ['Read central stimulus word', 'Scan options for semantic match', 'Tap correct companion word'],
      vi: ['Đọc từ kích thích trung tâm', 'Quét các phương án tìm liên tưởng', 'Chạm từ đồng hành chính xác']
    },
    durationSec: 60,
    estimatedMin: 2,
    primarySkill: { en: 'Semantic Fluency', vi: 'Sự lưu loát ngữ nghĩa' }
  },
  {
    id: 'vocabulary-challenge',
    num: 24,
    categoryId: 'language',
    name: { en: 'Vocabulary Challenge', vi: 'Thử thách từ vựng' },
    subtitle: { en: 'Identify correct definitions and meanings', vi: 'Xác định định nghĩa và ý nghĩa chính xác' },
    description: {
      en: 'Test your lexicon by selecting accurate definitions or completing incomplete word spellings.',
      vi: 'Kiểm tra vốn từ bằng cách chọn định nghĩa chính xác hoặc điền các chữ cái còn thiếu của từ.'
    },
    instructions: {
      en: ['Read target definition or word', 'Select matching definition option', 'Expand your lexicon'],
      vi: ['Đọc định nghĩa hoặc từ mục tiêu', 'Chọn phương án định nghĩa khớp', 'Mở rộng vốn từ của bạn']
    },
    durationSec: 60,
    estimatedMin: 2,
    primarySkill: { en: 'Lexical Knowledge', vi: 'Kiến thức từ vựng' }
  },

  // --- LOGICAL REASONING (25-27) ---
  {
    id: 'syllogism-verdict',
    num: 25,
    categoryId: 'logic',
    name: { en: 'Syllogism Verdict', vi: 'Phán quyết tam đoạn luận' },
    subtitle: { en: 'Are logical conclusions valid?', vi: 'Các kết luận logic có hợp lệ không?' },
    description: {
      en: 'Evaluate logical premises and decide whether the final conclusion is valid or invalid.',
      vi: 'Đánh giá các tiền đề logic và quyết định kết luận cuối cùng có hợp lệ hay không.'
    },
    instructions: {
      en: ['Read logical premises', 'Analyze logical deduction', 'Tap Valid or Invalid'],
      vi: ['Đọc các tiền đề logic', 'Phân tích suy luận logic', 'Nhấn Hợp lệ hoặc Không hợp lệ']
    },
    durationSec: 90,
    estimatedMin: 3,
    primarySkill: { en: 'Deductive Reasoning', vi: 'Suy luận diễn dịch' }
  },
  {
    id: 'deductive-grid',
    num: 26,
    categoryId: 'logic',
    name: { en: 'Deductive Grid', vi: 'Lưới suy luận logic' },
    subtitle: { en: 'Solve clues to fill property grid', vi: 'Giải các manh mối để điền lưới thuộc tính' },
    description: {
      en: 'Use deductive clues to assign attributes correctly to items in a logical constraint grid.',
      vi: 'Sử dụng các manh mối diễn dịch để gán thuộc tính chính xác cho các mục trong lưới ràng buộc.'
    },
    instructions: {
      en: ['Read relational clues', 'Eliminate impossible pairings', 'Complete grid cells correctly'],
      vi: ['Đọc manh mối quan hệ', 'Loại bỏ các cặp không thể', 'Hoàn thành các ô lưới chính xác']
    },
    durationSec: 120,
    estimatedMin: 3,
    primarySkill: { en: 'Constraint Satisfaction', vi: 'Thỏa mãn ràng buộc' }
  },
  {
    id: 'set-logic',
    num: 27,
    categoryId: 'logic',
    name: { en: 'Triad Logic', vi: 'Logic Bộ Ba' },
    subtitle: { en: 'Find valid triads of matching attributes', vi: 'Tìm bộ ba thuộc tính hợp lệ' },
    description: {
      en: 'Identify groups of three cards where each attribute (color, shape, number, shading) is either all same or all different.',
      vi: 'Xác định nhóm ba thẻ sao cho mỗi thuộc tính (màu, hình, số, nét) hoặc giống hết hoặc khác hẳn nhau.'
    },
    instructions: {
      en: ['Examine card attributes', 'Find 3 cards forming a valid triad', 'Tap cards and submit'],
      vi: ['Kiểm tra thuộc tính thẻ', 'Tìm 3 thẻ tạo thành bộ ba hợp lệ', 'Chạm thẻ và xác nhận']
    },
    durationSec: 120,
    estimatedMin: 3,
    primarySkill: { en: 'Categorical & Relational Logic', vi: 'Logic phân loại & quan hệ' }
  }
];

export function getGameById(id) {
  return GAMES_CATALOG.find(game => game.id === id) || null;
}

export function getGamesByCategory(categoryId) {
  return GAMES_CATALOG.filter(game => game.categoryId === categoryId);
}
