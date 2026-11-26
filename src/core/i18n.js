/**
 * NeuroFit Core i18n Dictionary & Manager (Phase 1)
 */

import { bus } from './events.js';

const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.daily': 'Daily Workout',
    'nav.library': 'Game Library',
    'nav.categories': 'Categories',
    'nav.analytics': 'Analytics',
    'nav.achievements': 'Achievements',
    'nav.history': 'History',
    'nav.settings': 'Settings',
    'nav.more': 'More',

    // Dashboard
    'dash.welcome': 'Welcome back',
    'dash.welcomeBack': 'Welcome back',
    'dash.tagline': 'Ready to train your mind today?',
    'dash.dailyTitle': "Today's Daily Workout",
    'dash.dailySub': '5 personalized cognitive exercises tailored for you',
    'dash.startDaily': 'Start Daily Workout',
    'dash.continueDaily': 'Continue Workout',
    'dash.dailyDone': 'Completed for Today! 🎉',
    'dash.nfi': 'NFI Score',
    'dash.streak': 'Day Streak',
    'dash.sessions': 'Sessions',
    'dash.timeTrained': 'Time Trained',
    'dash.radarTitle': 'Cognitive Profile',
    'dash.weeklyTitle': 'Weekly Consistency',
    'dash.recommended': 'Recommended For You',
    'dash.recentResults': 'Recent Results',
    'dash.personalBests': 'Personal Bests',
    'dash.noSessionsYet': 'No training sessions recorded yet. Start your first game or daily workout to see your cognitive profile grow!',
    'dash.days': 'days',
    'dash.mins': 'mins',

    // Library & Categories
    'lib.title': 'Game Library',
    'lib.subtitle': 'Explore all 27 cognitive training exercises across 8 core domains',
    'lib.searchPlaceholder': 'Search games or categories...',
    'lib.allCategories': 'All Categories',
    'lib.allDifficulties': 'All Difficulties',
    'lib.favoritesOnly': 'Favorites Only',
    'lib.recentlyPlayed': 'Recently Played',
    'lib.personalBest': 'Personal Best',
    'lib.noBestYet': 'No score yet',
    'lib.play': 'Play',
    'lib.preview': 'Preview',
    'lib.gamesCount': 'games',

    // Difficulty tiers
    'tier.beginner': 'Beginner',
    'tier.easy': 'Easy',
    'tier.intermediate': 'Intermediate',
    'tier.advanced': 'Advanced',
    'tier.expert': 'Expert',

    // Arena
    'arena.howToPlay': 'How to Play',
    'arena.startGame': 'Start Game',
    'arena.pause': 'Paused',
    'arena.resume': 'Resume',
    'arena.restart': 'Restart',
    'arena.quit': 'Quit to Library',
    'arena.score': 'Score',
    'arena.accuracy': 'Accuracy',
    'arena.time': 'Time',
    'arena.level': 'Level',
    'arena.sessionComplete': 'Session Complete!',
    'arena.newRecord': 'New Personal Best! 🏆',
    'arena.xpEarned': 'XP Earned',
    'arena.playAgain': 'Play Again',
    'arena.backToLibrary': 'Back to Library',
    'arena.nextDailyGame': 'Next Daily Game',
    'arena.phase4NoticeTitle': 'Interactive Arena Preview',
    'arena.phase4NoticeDesc': 'You are playing Sequence Recall. Full 27-game arena engines are rolling out in Phase 4.',

    // Onboarding
    'onb.title': 'Welcome to NeuroFit',
    'onb.subtitle': 'Your daily science-backed cognitive fitness trainer',
    'onb.nameLabel': 'Your Explorer Name',
    'onb.namePlaceholder': 'Enter your name...',
    'onb.avatarLabel': 'Choose Your Avatar',
    'onb.goalLabel': 'Daily Training Goal (Minutes)',
    'onb.startBtn': 'Start Training',
    'onb.skipBtn': 'Skip Intro',

    // Settings
    'set.title': 'Settings & Preferences',
    'set.profile': 'Profile Settings',
    'set.preferences': 'App Preferences',
    'set.theme': 'Appearance Theme',
    'set.themeLight': 'Soft Daylight',
    'set.themeDark': 'Midnight Focus',
    'set.themeSystem': 'System Default',
    'set.sound': 'Sound Effects',
    'set.music': 'Background Atmosphere',
    'set.haptics': 'Haptic Feedback',
    'set.dailyGoal': 'Daily Goal (minutes)',
    'set.dataManagement': 'Data & Backup',
    'set.exportJson': 'Export Backup (JSON)',
    'set.importJson': 'Import Backup (JSON)',
    'set.resetData': 'Reset All Data',
    'set.resetConfirm': 'Are you sure you want to reset all progress? This cannot be undone.',
    'set.savedToast': 'Settings saved successfully',

    // Categories
    'cat.memory': 'Memory',
    'cat.memoryDesc': 'Recall sequences, spatial positions, and items with precision',
    'cat.attention': 'Attention',
    'cat.attentionDesc': 'Track targets, filter distractions, and maintain focus',
    'cat.speed': 'Processing Speed',
    'cat.speedDesc': 'React quickly and process visual stimuli rapidly',
    'cat.problem': 'Problem Solving',
    'cat.problemDesc': 'Recognize patterns, solve puzzles, and plan moves',
    'cat.math': 'Mental Math',
    'cat.mathDesc': 'Calculate arithmetic rapidly and work with numbers',
    'cat.flexibility': 'Cognitive Flexibility',
    'cat.flexibilityDesc': 'Switch tasks seamlessly and adapt to changing rules',
    'cat.language': 'Language',
    'cat.languageDesc': 'Build vocabulary and connect semantic associations',
    'cat.logic': 'Logical Reasoning',
    'cat.logicDesc': 'Deduce correct outcomes using rigorous logical rules'
  },
  vi: {
    // Navigation
    'nav.dashboard': 'Tổng quan',
    'nav.daily': 'Luyện tập hằng ngày',
    'nav.library': 'Kho trò chơi',
    'nav.categories': 'Danh mục',
    'nav.analytics': 'Phân tích',
    'nav.achievements': 'Thành tựu',
    'nav.history': 'Lịch sử',
    'nav.settings': 'Cài đặt',
    'nav.more': 'Thêm',

    // Dashboard
    'dash.welcome': 'Chào mừng trở lại',
    'dash.welcomeBack': 'Chào mừng trở lại',
    'dash.tagline': 'Sẵn sàng rèn luyện trí tuệ hôm nay chưa?',
    'dash.dailyTitle': 'Bài tập hằng ngày',
    'dash.dailySub': '5 bài tập nhận thức cá nhân hóa dành riêng cho bạn',
    'dash.startDaily': 'Bắt đầu bài tập',
    'dash.continueDaily': 'Tiếp tục bài tập',
    'dash.dailyDone': 'Đã hoàn thành hôm nay! 🎉',
    'dash.nfi': 'Chỉ số NFI',
    'dash.streak': 'Chuỗi ngày',
    'dash.sessions': 'Số buổi',
    'dash.timeTrained': 'Thời gian tập',
    'dash.radarTitle': 'Biểu đồ nhận thức',
    'dash.weeklyTitle': 'Sự chuyên cần tuần',
    'dash.recommended': 'Gợi ý cho bạn',
    'dash.recentResults': 'Kết quả gần đây',
    'dash.personalBests': 'Kỷ lục cá nhân',
    'dash.noSessionsYet': 'Chưa có buổi tập nào được ghi lại. Hãy bắt đầu trò chơi đầu tiên để xem biểu đồ nhận thức phát triển!',
    'dash.days': 'ngày',
    'dash.mins': 'phút',

    // Library & Categories
    'lib.title': 'Kho trò chơi',
    'lib.subtitle': 'Khám phá 27 bài tập rèn luyện nhận thức thuộc 8 lĩnh vực cốt lõi',
    'lib.searchPlaceholder': 'Tìm kiếm trò chơi hoặc danh mục...',
    'lib.allCategories': 'Tất cả danh mục',
    'lib.allDifficulties': 'Tất cả độ khó',
    'lib.favoritesOnly': 'Chỉ yêu thích',
    'lib.recentlyPlayed': 'Chơi gần đây',
    'lib.personalBest': 'Kỷ lục',
    'lib.noBestYet': 'Chưa có điểm',
    'lib.play': 'Chơi',
    'lib.preview': 'Xem trước',
    'lib.gamesCount': 'trò chơi',

    // Difficulty tiers
    'tier.beginner': 'Khởi đầu',
    'tier.easy': 'Cơ bản',
    'tier.intermediate': 'Trung cấp',
    'tier.advanced': 'Nâng cao',
    'tier.expert': 'Chuyên gia',

    // Arena
    'arena.howToPlay': 'Hướng dẫn cách chơi',
    'arena.startGame': 'Bắt đầu',
    'arena.pause': 'Đã tạm dừng',
    'arena.resume': 'Tiếp tục',
    'arena.restart': 'Chơi lại',
    'arena.quit': 'Thoát về kho',
    'arena.score': 'Điểm',
    'arena.accuracy': 'Độ chính xác',
    'arena.time': 'Thời gian',
    'arena.level': 'Cấp độ',
    'arena.sessionComplete': 'Hoàn thành buổi tập!',
    'arena.newRecord': 'Kỷ lục cá nhân mới! 🏆',
    'arena.xpEarned': 'XP nhận được',
    'arena.playAgain': 'Chơi lại',
    'arena.backToLibrary': 'Về kho trò chơi',
    'arena.nextDailyGame': 'Trò chơi tiếp theo',
    'arena.phase4NoticeTitle': 'Xem trước Đấu trường',
    'arena.phase4NoticeDesc': 'Bạn đang chơi Ghi nhớ Trình tự. Đấu trường 27 trò chơi đầy đủ sẽ ra mắt ở Giai đoạn 4.',

    // Onboarding
    'onb.title': 'Chào mừng đến với NeuroFit',
    'onb.subtitle': 'Ứng dụng rèn luyện thể chất não bộ hàng ngày dựa trên khoa học',
    'onb.nameLabel': 'Tên nhà thám hiểm của bạn',
    'onb.namePlaceholder': 'Nhập tên của bạn...',
    'onb.avatarLabel': 'Chọn ảnh đại diện',
    'onb.goalLabel': 'Mục tiêu tập luyện hàng ngày (Phút)',
    'onb.startBtn': 'Bắt đầu luyện tập',
    'onb.skipBtn': 'Bỏ qua giới thiệu',

    // Settings
    'set.title': 'Cài đặt & Tùy chọn',
    'set.profile': 'Cài đặt hồ sơ',
    'set.preferences': 'Tùy chọn ứng dụng',
    'set.theme': 'Giao diện',
    'set.themeLight': 'Ban ngày dịu nhẹ',
    'set.themeDark': 'Tập trung ban đêm',
    'set.themeSystem': 'Theo hệ thống',
    'set.sound': 'Hiệu ứng âm thanh',
    'set.music': 'Âm thanh nền',
    'set.haptics': 'Phản hồi rung',
    'set.dailyGoal': 'Mục tiêu hàng ngày (phút)',
    'set.dataManagement': 'Quản lý dữ liệu & Sao lưu',
    'set.exportJson': 'Xuất sao lưu (JSON)',
    'set.importJson': 'Nhập sao lưu (JSON)',
    'set.resetData': 'Đặt lại toàn bộ dữ liệu',
    'set.resetConfirm': 'Bạn có chắc chắn muốn đặt lại toàn bộ tiến trình không? Thao tác này không thể hoàn tác.',
    'set.savedToast': 'Đã lưu cài đặt thành công',

    // Categories
    'cat.memory': 'Trí nhớ',
    'cat.memoryDesc': 'Ghi nhớ chuỗi, vị trí không gian và các mục với độ chính xác cao',
    'cat.attention': 'Sự chú ý',
    'cat.attentionDesc': 'Theo dõi mục tiêu, lọc bỏ sao nhãng và duy trì sự tập trung',
    'cat.speed': 'Tốc độ xử lý',
    'cat.speedDesc': 'Phản ứng nhanh nhạy và xử lý kích thích trực quan tốc độ cao',
    'cat.problem': 'Giải quyết vấn đề',
    'cat.problemDesc': 'Nhận diện quy luật, giải câu đố và lập kế hoạch nước đi',
    'cat.math': 'Toán nhẩm',
    'cat.mathDesc': 'Tính toán số học nhanh chóng và làm việc với các con số',
    'cat.flexibility': 'Tư duy linh hoạt',
    'cat.flexibilityDesc': 'Chuyển đổi tác vụ mượt mà và thích ứng với quy tắc thay đổi',
    'cat.language': 'Ngôn ngữ',
    'cat.languageDesc': 'Xây dựng vốn từ vựng và liên kết các khái niệm ngữ nghĩa',
    'cat.logic': 'Suy luận Logic',
    'cat.logicDesc': 'Suy luận kết quả chính xác bằng các quy tắc logic chặt chẽ'
  }
};

class I18nManager {
  constructor() {
    this.currentLang = 'en';
  }

  init(lang = 'en') {
    this.setLang(lang, false);
  }

  getLang() {
    return this.currentLang;
  }

  setLang(lang, emitEvent = true) {
    if (lang !== 'en' && lang !== 'vi') lang = 'en';
    this.currentLang = lang;
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = lang;
    }
    if (emitEvent) {
      bus.emit('i18n:changed', lang);
    }
  }

  t(key, vars = {}) {
    const dict = translations[this.currentLang] || translations.en;
    let text = dict[key] || translations.en[key] || key;
    
    // Interpolate variables like {name}
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
    return text;
  }

  pick(bilingualObj) {
    if (!bilingualObj) return '';
    if (typeof bilingualObj === 'string') return bilingualObj;
    if (typeof bilingualObj === 'object') {
      return bilingualObj[this.currentLang] || bilingualObj.en || String(Object.values(bilingualObj)[0] || '');
    }
    return String(bilingualObj);
  }
}

export const i18n = new I18nManager();
