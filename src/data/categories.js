/**
 * @file categories.js
 * @description 8 cognitive categories for NeuroFit with bilingual support and color tokens.
 */

export const CATEGORIES = [
  {
    id: 'memory',
    order: 1,
    color: '#6366F1',
    softBg: '#EEF2FF',
    darkSoftBg: 'rgba(99,102,241,0.16)',
    name: {
      en: 'Memory',
      vi: 'Trí nhớ'
    },
    description: {
      en: 'Enhance working memory, recall sequences, and retain spatial and numerical information.',
      vi: 'Cải thiện trí nhớ làm việc, ghi nhớ chuỗi và lưu giữ thông tin không gian, số học.'
    },
    icon: 'brain'
  },
  {
    id: 'attention',
    order: 2,
    color: '#F59E0B',
    softBg: '#FEF3C7',
    darkSoftBg: 'rgba(245,158,11,0.16)',
    name: {
      en: 'Attention',
      vi: 'Sự chú ý'
    },
    description: {
      en: 'Sharpen focus, resist distraction, and track multiple targets in dynamic environments.',
      vi: 'Rèn luyện sự tập trung, chống xao nhãng và theo dõi nhiều mục tiêu trong môi trường động.'
    },
    icon: 'eye'
  },
  {
    id: 'speed',
    order: 3,
    color: '#06B6D4',
    softBg: '#ECFEFF',
    darkSoftBg: 'rgba(6,182,212,0.16)',
    name: {
      en: 'Processing Speed',
      vi: 'Tốc độ xử lý'
    },
    description: {
      en: 'Accelerate visual perception, decision making, and rapid stimulus comparison.',
      vi: 'Tăng tốc độ nhận giác quan, ra quyết định và so sánh kích thích nhanh chóng.'
    },
    icon: 'zap'
  },
  {
    id: 'problem',
    order: 4,
    color: '#10B981',
    softBg: '#ECFDF5',
    darkSoftBg: 'rgba(16,185,129,0.16)',
    name: {
      en: 'Problem Solving',
      vi: 'Giải quyết vấn đề'
    },
    description: {
      en: 'Develop lateral thinking, recognize abstract patterns, and solve complex multi-step puzzles.',
      vi: 'Phát triển tư duy định hướng, nhận biết mẫu trừu tượng và giải quyết các câu đố phức tạp.'
    },
    icon: 'puzzle'
  },
  {
    id: 'math',
    order: 5,
    color: '#3B82F6',
    softBg: '#EFF6FF',
    darkSoftBg: 'rgba(59,130,246,0.16)',
    name: {
      en: 'Mental Math',
      vi: 'Toán nhẩm'
    },
    description: {
      en: 'Boost calculation agility, number estimation, and numerical pattern extrapolation.',
      vi: 'Nâng cao sự nhanh nhạy trong tính toán, ước lượng số và suy luận quy luật số học.'
    },
    icon: 'calculator'
  },
  {
    id: 'flexibility',
    order: 6,
    color: '#EC4899',
    softBg: '#FDF2F8',
    darkSoftBg: 'rgba(236,72,153,0.16)',
    name: {
      en: 'Cognitive Flexibility',
      vi: 'Tư duy linh hoạt'
    },
    description: {
      en: 'Switch smoothly between shifting rules, adapt to changing criteria, and dual-task efficiently.',
      vi: 'Chuyển đổi linh hoạt giữa các quy tắc thay đổi, thích ứng với tiêu chí mới và đa nhiệm hiệu quả.'
    },
    icon: 'shuffle'
  },
  {
    id: 'language',
    order: 7,
    color: '#8B5CF6',
    softBg: '#F5F3FF',
    darkSoftBg: 'rgba(139,92,246,0.16)',
    name: {
      en: 'Language',
      vi: 'Ngôn ngữ'
    },
    description: {
      en: 'Expand vocabulary, master semantic word associations, and quicken verbal fluency.',
      vi: 'Mở rộng vốn từ, làm chủ liên tưởng ngữ nghĩa và tăng cường sự lưu loát ngôn từ.'
    },
    icon: 'book'
  },
  {
    id: 'logic',
    order: 8,
    color: '#F97316',
    softBg: '#FFF7ED',
    darkSoftBg: 'rgba(249,115,22,0.16)',
    name: {
      en: 'Logical Reasoning',
      vi: 'Suy luận Logic'
    },
    description: {
      en: 'Evaluate syllogisms, deduce matrix rules, and master deductive grid challenges.',
      vi: 'Đánh giá tam đoạn luận, suy luận quy tắc ma trận và làm chủ các thử thách logic dạng lưới.'
    },
    icon: 'compass'
  }
];

export function getCategoryById(id) {
  return CATEGORIES.find(cat => cat.id === id) || null;
}
