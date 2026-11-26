/**
 * @file avatars-themes.js
 * @description Avatars, themes, and achievements catalogs.
 */

export const AVATARS = [
  {
    id: 'neural-spark',
    label: { en: 'Neural Spark', vi: 'Tia thần kinh' },
    bg: '#EEF2FF',
    fg: '#6366F1',
    color: '#6366F1',
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="url(#ns-grad)"/><path d="M20 10V30M10 20H30" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><circle cx="20" cy="20" r="5" fill="#fff"/><defs><linearGradient id="ns-grad" x1="5" y1="5" x2="35" y2="35" gradientUnits="userSpaceOnUse"><stop stop-color="#6366F1"/><stop offset="1" stop-color="#4F46E5"/></linearGradient></defs></svg>`,
    symbol: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="url(#ns-grad)"/><path d="M20 10V30M10 20H30" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><circle cx="20" cy="20" r="5" fill="#fff"/><defs><linearGradient id="ns-grad" x1="5" y1="5" x2="35" y2="35" gradientUnits="userSpaceOnUse"><stop stop-color="#6366F1"/><stop offset="1" stop-color="#4F46E5"/></linearGradient></defs></svg>`
  },
  {
    id: 'zen-lotus',
    label: { en: 'Zen Lotus', vi: 'Sen thiền định' },
    bg: '#ECFDF5',
    fg: '#10B981',
    color: '#10B981',
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="url(#zl-grad)"/><path d="M20 11C20 11 14 16 14 22C14 25.3 16.7 28 20 28C23.3 28 26 25.3 26 22C26 16 20 11 20 11Z" fill="#fff" opacity="0.9"/><defs><linearGradient id="zl-grad" x1="5" y1="5" x2="35" y2="35"><stop stop-color="#10B981"/><stop offset="1" stop-color="#059669"/></linearGradient></defs></svg>`,
    symbol: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="url(#zl-grad)"/><path d="M20 11C20 11 14 16 14 22C14 25.3 16.7 28 20 28C23.3 28 26 25.3 26 22C26 16 20 11 20 11Z" fill="#fff" opacity="0.9"/><defs><linearGradient id="zl-grad" x1="5" y1="5" x2="35" y2="35"><stop stop-color="#10B981"/><stop offset="1" stop-color="#059669"/></linearGradient></defs></svg>`
  },
  {
    id: 'prism-mind',
    label: { en: 'Prism Mind', vi: 'Lăng kính tâm trí' },
    bg: '#EFF6FF',
    fg: '#3B82F6',
    color: '#3B82F6',
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="url(#pm-grad)"/><polygon points="20,10 30,28 10,28" fill="#fff" opacity="0.9"/><defs><linearGradient id="pm-grad" x1="5" y1="5" x2="35" y2="35"><stop stop-color="#3B82F6"/><stop offset="1" stop-color="#2563EB"/></linearGradient></defs></svg>`,
    symbol: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="url(#pm-grad)"/><polygon points="20,10 30,28 10,28" fill="#fff" opacity="0.9"/><defs><linearGradient id="pm-grad" x1="5" y1="5" x2="35" y2="35"><stop stop-color="#3B82F6"/><stop offset="1" stop-color="#2563EB"/></linearGradient></defs></svg>`
  },
  {
    id: 'orbit-pulse',
    label: { en: 'Orbit Pulse', vi: 'Nhịp quỹ đạo' },
    bg: '#ECFEFF',
    fg: '#06B6D4',
    color: '#06B6D4',
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="url(#op-grad)"/><ellipse cx="20" cy="20" rx="14" ry="6" transform="rotate(30 20 20)" stroke="#fff" stroke-width="2"/><circle cx="20" cy="20" r="4" fill="#fff"/><defs><linearGradient id="op-grad" x1="5" y1="5" x2="35" y2="35"><stop stop-color="#06B6D4"/><stop offset="1" stop-color="#0891B2"/></linearGradient></defs></svg>`,
    symbol: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="url(#op-grad)"/><ellipse cx="20" cy="20" rx="14" ry="6" transform="rotate(30 20 20)" stroke="#fff" stroke-width="2"/><circle cx="20" cy="20" r="4" fill="#fff"/><defs><linearGradient id="op-grad" x1="5" y1="5" x2="35" y2="35"><stop stop-color="#06B6D4"/><stop offset="1" stop-color="#0891B2"/></linearGradient></defs></svg>`
  },
  {
    id: 'aurora-wave',
    label: { en: 'Aurora Wave', vi: 'Sóng cực quang' },
    bg: '#F5F3FF',
    fg: '#8B5CF6',
    color: '#8B5CF6',
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="url(#aw-grad)"/><path d="M10 22C13 16 17 26 20 20C23 14 27 24 30 18" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><defs><linearGradient id="aw-grad" x1="5" y1="5" x2="35" y2="35"><stop stop-color="#8B5CF6"/><stop offset="1" stop-color="#7C3AED"/></linearGradient></defs></svg>`,
    symbol: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="url(#aw-grad)"/><path d="M10 22C13 16 17 26 20 20C23 14 27 24 30 18" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><defs><linearGradient id="aw-grad" x1="5" y1="5" x2="35" y2="35"><stop stop-color="#8B5CF6"/><stop offset="1" stop-color="#7C3AED"/></linearGradient></defs></svg>`
  },
  {
    id: 'quantum-cube',
    label: { en: 'Quantum Cube', vi: 'Khối lượng tử' },
    bg: '#FFF7ED',
    fg: '#F97316',
    color: '#F97316',
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="url(#qc-grad)"/><rect x="13" y="13" width="14" height="14" rx="3" stroke="#fff" stroke-width="2.5"/><defs><linearGradient id="qc-grad" x1="5" y1="5" x2="35" y2="35"><stop stop-color="#F97316"/><stop offset="1" stop-color="#EA580C"/></linearGradient></defs></svg>`,
    symbol: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="url(#qc-grad)"/><rect x="13" y="13" width="14" height="14" rx="3" stroke="#fff" stroke-width="2.5"/><defs><linearGradient id="qc-grad" x1="5" y1="5" x2="35" y2="35"><stop stop-color="#F97316"/><stop offset="1" stop-color="#EA580C"/></linearGradient></defs></svg>`
  },
  {
    id: 'solar-flare',
    label: { en: 'Solar Flare', vi: 'Lóa mặt trời' },
    bg: '#FEF3C7',
    fg: '#F59E0B',
    color: '#F59E0B',
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="url(#sf-grad)"/><circle cx="20" cy="20" r="7" fill="#fff"/><path d="M20 7V11M20 29V33M7 20H11M29 20H33" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><defs><linearGradient id="sf-grad" x1="5" y1="5" x2="35" y2="35"><stop stop-color="#F59E0B"/><stop offset="1" stop-color="#D97706"/></linearGradient></defs></svg>`,
    symbol: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="url(#sf-grad)"/><circle cx="20" cy="20" r="7" fill="#fff"/><path d="M20 7V11M20 29V33M7 20H11M29 20H33" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><defs><linearGradient id="sf-grad" x1="5" y1="5" x2="35" y2="35"><stop stop-color="#F59E0B"/><stop offset="1" stop-color="#D97706"/></linearGradient></defs></svg>`
  },
  {
    id: 'emerald-leaf',
    label: { en: 'Emerald Leaf', vi: 'Lá ngọc lục bảo' },
    bg: '#FDF2F8',
    fg: '#EC4899',
    color: '#EC4899',
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="url(#el-grad)"/><path d="M12 24C12 18 18 12 26 12C26 20 20 26 12 26V24Z" fill="#fff"/><defs><linearGradient id="el-grad" x1="5" y1="5" x2="35" y2="35"><stop stop-color="#EC4899"/><stop offset="1" stop-color="#DB2777"/></linearGradient></defs></svg>`,
    symbol: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="url(#el-grad)"/><path d="M12 24C12 18 18 12 26 12C26 20 20 26 12 26V24Z" fill="#fff"/><defs><linearGradient id="el-grad" x1="5" y1="5" x2="35" y2="35"><stop stop-color="#EC4899"/><stop offset="1" stop-color="#DB2777"/></linearGradient></defs></svg>`
  }
];

export function getAvatarObject(id) {
  return AVATARS.find(a => a.id === id) || AVATARS[0];
}

export const THEMES = [
  {
    id: 'light',
    unlockLevel: 1,
    name: { en: 'Soft Daylight', vi: 'Ban ngày dịu nhẹ' },
    previewBg: '#F6F8FC',
    previewAccent: '#4F46E5'
  },
  {
    id: 'dark',
    unlockLevel: 1,
    name: { en: 'Midnight Focus', vi: 'Tập trung ban đêm' },
    previewBg: '#0B1120',
    previewAccent: '#6366F1'
  },
  {
    id: 'system',
    unlockLevel: 1,
    name: { en: 'System Default', vi: 'Theo hệ thống' },
    previewBg: '#E2E8F0',
    previewAccent: '#334155'
  },
  {
    id: 'forest',
    unlockLevel: 3,
    name: { en: 'Calm Forest', vi: 'Rừng xanh tĩnh lặng' },
    previewBg: '#064E3B',
    previewAccent: '#10B981'
  },
  {
    id: 'coral',
    unlockLevel: 5,
    name: { en: 'Sunset Coral', vi: 'San hô hoàng hôn' },
    previewBg: '#7C2D12',
    previewAccent: '#F97316'
  }
];

export const UNLOCKABLE_THEMES = THEMES.filter(t => t.unlockLevel > 1).map(t => ({ ...t, unlockRequirement: 'Level ' + t.unlockLevel }));

export const ACHIEVEMENTS_CATALOG = [
  {
    id: 'first-game',
    icon: 'sparkles',
    name: { en: 'First Step', vi: 'Bước đầu tiên' },
    desc: { en: 'Complete your very first training session', vi: 'Hoàn thành buổi tập đầu tiên của bạn' },
    xpBonus: 50
  },
  {
    id: 'perfect-score',
    icon: 'award',
    name: { en: 'Flawless Mind', vi: 'Tâm trí hoàn mỹ' },
    desc: { en: 'Achieve 100% accuracy in any game', vi: 'Đạt độ chính xác 100% trong bất kỳ trò chơi nào' },
    xpBonus: 100
  },
  {
    id: 'streak-3',
    icon: 'flame',
    name: { en: '3-Day Streak', vi: 'Chuỗi 3 ngày' },
    desc: { en: 'Maintain a 3-day training streak', vi: 'Duy trì chuỗi tập luyện 3 ngày liên tục' },
    xpBonus: 150
  },
  {
    id: 'streak-5',
    icon: 'flame',
    name: { en: '5-Day Streak', vi: 'Chuỗi 5 ngày' },
    desc: { en: 'Maintain a 5-day training streak', vi: 'Duy trì chuỗi tập luyện 5 ngày liên tục' },
    xpBonus: 250
  },
  {
    id: 'streak-7',
    icon: 'flame',
    name: { en: 'Weekly Warrior', vi: 'Chiến binh tuần' },
    desc: { en: 'Maintain a 7-day training streak', vi: 'Duy trì chuỗi tập luyện 7 ngày liên tục' },
    xpBonus: 400
  },
  {
    id: 'streak-30',
    icon: 'trophy',
    name: { en: 'Monthly Master', vi: 'Bậc thầy tháng' },
    desc: { en: 'Maintain a 30-day training streak', vi: 'Duy trì chuỗi tập luyện 30 ngày liên tục' },
    xpBonus: 1000
  },
  {
    id: 'memory-master',
    icon: 'brain',
    name: { en: 'Memory Master', vi: 'Bậc thầy trí nhớ' },
    desc: { en: 'Complete 10 memory category sessions', vi: 'Hoàn thành 10 phiên tập trí nhớ' },
    xpBonus: 200
  },
  {
    id: 'speed-demon',
    icon: 'zap',
    name: { en: 'Speed Demon', vi: 'Tia chớp tốc độ' },
    desc: { en: 'Complete 10 processing speed sessions', vi: 'Hoàn thành 10 phiên tập tốc độ xử lý' },
    xpBonus: 200
  },
  {
    id: 'accuracy-expert',
    icon: 'check',
    name: { en: 'Precision Expert', vi: 'Chuyên gia chính xác' },
    desc: { en: 'Play 25 games with >90% average accuracy', vi: 'Chơi 25 trò với độ chính xác trung bình >90%' },
    xpBonus: 300
  },
  {
    id: 'daily-champion',
    icon: 'calendar',
    name: { en: 'Daily Champion', vi: 'Nhà vô địch ngày' },
    desc: { en: 'Complete your personalized daily workout 7 times', vi: 'Hoàn thành bài tập cá nhân hóa hằng ngày 7 lần' },
    xpBonus: 350
  },
  {
    id: 'all-categories',
    icon: 'grid',
    name: { en: 'Polymath', vi: 'Nhà bách khoa' },
    desc: { en: 'Play at least one game in all 8 cognitive categories', vi: 'Chơi ít nhất một trò ở cả 8 danh mục nhận thức' },
    xpBonus: 300
  },
  {
    id: 'games-100',
    icon: 'award',
    name: { en: 'Centurion', vi: 'Bách chiến bách thắng' },
    desc: { en: 'Complete 100 total training sessions', vi: 'Hoàn thành tổng cộng 100 phiên tập luyện' },
    xpBonus: 1200
  }
];
