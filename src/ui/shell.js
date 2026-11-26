import { storage } from '../core/storage.js';
import { audio } from '../core/audio.js';
import { i18n } from '../core/i18n.js';
import { router } from '../core/router.js';
import { bus } from '../core/events.js';
import { AVATARS, getAvatarObject } from '../data/avatars-themes.js';

class UIHellShell {
  constructor() {
    this.rootEl = null;
    this.viewContainer = null;
    this.currentRoute = 'dashboard';
    this.eventsRegistered = false;
  }

  async mount(rootEl) {
    this.rootEl = rootEl;
    this.renderShellStructure();
    this.setupEventListeners();
    this.refreshHeader();

    if (!this.eventsRegistered) {
      this.eventsRegistered = true;
      bus.on('profile:changed', () => this.refreshHeader());
      bus.on('session:saved', () => this.refreshHeader());
    }
  }

  async remount() {
    this.renderShellStructure();
    this.setupEventListeners();
    this.refreshHeader();
  }

  renderShellStructure() {
    const isVi = i18n.getLang() === 'vi';
    const profile = storage.getProfile();
    const prefs = storage.getPrefs();
    const avatar = getAvatarObject(profile.avatarId);

    this.rootEl.innerHTML = `
      <div class="app-shell">
        <!-- Desktop Sidebar (>=1024px) -->
        <aside class="sidebar">
          <div class="sidebar-brand">
            <img src="./assets/icons/icon.svg" alt="NeuroFit">
            <div class="sidebar-brand-text">
              <h1>NeuroFit</h1>
              <span>Brain Fitness</span>
            </div>
          </div>

          <nav class="sidebar-nav">
            <a href="#/dashboard" class="nav-item ${this.currentRoute === 'dashboard' ? 'active' : ''}" data-route="dashboard">
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              <span>${isVi ? 'Tổng quan' : 'Dashboard'}</span>
            </a>
            <a href="#/daily" class="nav-item ${this.currentRoute === 'daily' ? 'active' : ''}" data-route="daily">
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>${isVi ? 'Luyện hằng ngày' : 'Daily Workout'}</span>
            </a>
            <a href="#/library" class="nav-item ${this.currentRoute === 'library' ? 'active' : ''}" data-route="library">
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              <span>${isVi ? 'Thư viện game' : 'Game Library'}</span>
            </a>
            <a href="#/categories" class="nav-item ${this.currentRoute === 'categories' ? 'active' : ''}" data-route="categories">
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              <span>${isVi ? 'Danh mục' : 'Categories'}</span>
            </a>
            <a href="#/analytics" class="nav-item ${this.currentRoute === 'analytics' ? 'active' : ''}" data-route="analytics">
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              <span>${isVi ? 'Thống kê' : 'Analytics'}</span>
            </a>
            <a href="#/achievements" class="nav-item ${this.currentRoute === 'achievements' ? 'active' : ''}" data-route="achievements">
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
              <span>${isVi ? 'Thành tựu' : 'Achievements'}</span>
            </a>
            <a href="#/history" class="nav-item ${this.currentRoute === 'history' ? 'active' : ''}" data-route="history">
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              <span>${isVi ? 'Lịch sử' : 'History'}</span>
            </a>
            <a href="#/settings" class="nav-item ${this.currentRoute === 'settings' ? 'active' : ''}" data-route="settings">
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              <span>${isVi ? 'Cài đặt' : 'Settings'}</span>
            </a>
          </nav>

          <div class="sidebar-daily-card" id="sidebar-daily-goal-card">
            <!-- Dynamically populated goal widget -->
          </div>
        </aside>

        <!-- Main Wrapper -->
        <div class="main-wrapper">
          <!-- Topbar -->
          <header class="topbar">
            <a href="#/dashboard" class="topbar-brand-mobile">
              <img src="./assets/icons/icon.svg" alt="NeuroFit">
              <span>NeuroFit</span>
            </a>
            
            <div class="topbar-actions" id="topbar-pills-container">
              <!-- Streak & XP pills rendered here -->
            </div>

            <div class="topbar-right">
              <button class="icon-pill-btn" id="topbar-lang-btn" style="width:auto;padding:0 12px;border-radius:999px;font-weight:700;font-size:0.8rem;" title="Toggle Language">
                ${isVi ? '🇻🇳 VI' : '🇬🇧 EN'}
              </button>
              <button class="icon-pill-btn" id="topbar-theme-btn" title="Toggle Theme">
                ${prefs.theme === 'dark' ? '🌙' : '☀️'}
              </button>
              <a href="#/settings" class="profile-chip" title="Profile & Settings">
                <div class="profile-avatar" style="background: ${avatar.bg}; color: ${avatar.color};">
                  ${avatar.symbol}
                </div>
                <span>${profile.username}</span>
              </a>
            </div>
          </header>

          <!-- View Container -->
          <main class="view-container" id="view-container">
            <!-- Active view rendered here -->
          </main>
        </div>

        <!-- Mobile Bottom Nav -->
        <nav class="mobile-bottom-nav">
          <a href="#/dashboard" class="mobile-tab ${this.currentRoute === 'dashboard' ? 'active' : ''}" data-route="dashboard">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span>${isVi ? 'Tổng quan' : 'Home'}</span>
          </a>
          <a href="#/daily" class="mobile-tab ${this.currentRoute === 'daily' ? 'active' : ''}" data-route="daily">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>${isVi ? 'Hằng ngày' : 'Daily'}</span>
          </a>
          <a href="#/library" class="mobile-tab ${this.currentRoute === 'library' ? 'active' : ''}" data-route="library">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            <span>${isVi ? 'Thư viện' : 'Library'}</span>
          </a>
          <a href="#/analytics" class="mobile-tab ${this.currentRoute === 'analytics' ? 'active' : ''}" data-route="analytics">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            <span>${isVi ? 'Thống kê' : 'Stats'}</span>
          </a>
          <button class="mobile-tab" id="mobile-more-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            <span>${isVi ? 'Thêm' : 'More'}</span>
          </button>
        </nav>

        <!-- Backdrop & More Sheet as siblings -->
        <div class="sheet-backdrop" id="sheet-backdrop"></div>
        <div class="mobile-more-sheet" id="mobile-more-sheet">
          <div class="sheet-header">
            <h3>${isVi ? 'Thêm tùy chọn & Mục' : 'More Options'}</h3>
            <button class="sheet-close-btn" id="sheet-close-btn">✕</button>
          </div>
          <div class="sheet-grid">
            <a href="#/categories" class="sheet-item" data-close-sheet>📂 ${isVi ? 'Danh mục' : 'Categories'}</a>
            <a href="#/achievements" class="sheet-item" data-close-sheet>🏆 ${isVi ? 'Thành tựu' : 'Achievements'}</a>
            <a href="#/history" class="sheet-item" data-close-sheet>📜 ${isVi ? 'Lịch sử' : 'History'}</a>
            <a href="#/settings" class="sheet-item" data-close-sheet>⚙️ ${isVi ? 'Cài đặt' : 'Settings'}</a>
          </div>
        </div>
      </div>
    `;

    this.viewContainer = this.rootEl.querySelector('#view-container');
  }

  setupEventListeners() {
    // Theme toggle button
    const themeBtn = this.rootEl.querySelector('#topbar-theme-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        audio.tap();
        const prefs = storage.getPrefs();
        const nextTheme = prefs.theme === 'dark' ? 'light' : 'dark';
        storage.savePrefs({ theme: nextTheme });
        bus.emit('prefs:changed', { theme: nextTheme });
      });
    }

    // Lang toggle button
    const langBtn = this.rootEl.querySelector('#topbar-lang-btn');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        audio.tap();
        const current = i18n.getLang();
        const next = current === 'en' ? 'vi' : 'en';
        i18n.setLang(next);
      });
    }

    // Mobile More Sheet & Backdrop toggle
    const moreBtn = this.rootEl.querySelector('#mobile-more-btn');
    const sheet = this.rootEl.querySelector('#mobile-more-sheet');
    const backdrop = this.rootEl.querySelector('#sheet-backdrop');
    const closeBtn = this.rootEl.querySelector('#sheet-close-btn');

    if (moreBtn && sheet && backdrop) {
      moreBtn.addEventListener('click', () => {
        audio.tap();
        sheet.classList.add('open');
        backdrop.classList.add('open');
      });
      backdrop.addEventListener('click', () => {
        sheet.classList.remove('open');
        backdrop.classList.remove('open');
      });
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          sheet.classList.remove('open');
          backdrop.classList.remove('open');
        });
      }
      sheet.querySelectorAll('[data-close-sheet]').forEach(el => {
        el.addEventListener('click', () => {
          sheet.classList.remove('open');
          backdrop.classList.remove('open');
        });
      });
    }
  }

  async refreshHeader() {
    const prefs = storage.getPrefs();
    const stats = await storage.getStats();
    const profile = storage.getProfile();
    const avatar = getAvatarObject(profile.avatarId);
    const isVi = i18n.getLang() === 'vi';

    // Update topbar theme button icon
    const themeBtn = this.rootEl.querySelector('#topbar-theme-btn');
    if (themeBtn) {
      themeBtn.textContent = prefs.theme === 'dark' ? '🌙' : '☀️';
    }

    // Update lang button text
    const langBtn = this.rootEl.querySelector('#topbar-lang-btn');
    if (langBtn) {
      langBtn.textContent = isVi ? '🇻🇳 VI' : '🇬🇧 EN';
    }

    // Update pills container (`.streak-pill` with `.streak-unit` + `.xp-pill`)
    const pillsContainer = this.rootEl.querySelector('#topbar-pills-container');
    if (pillsContainer) {
      pillsContainer.innerHTML = `
        <div class="streak-pill">
          <span>🔥</span>
          <span>${stats.currentStreak}<span class="streak-unit"> ${isVi ? 'ngày' : 'days'}</span></span>
        </div>
        <div class="xp-pill">
          <span>⭐</span>
          <span>${stats.totalXp} XP</span>
        </div>
      `;
    }

    // Update mini avatar & name in topbar
    const chip = this.rootEl.querySelector('.profile-chip');
    if (chip) {
      chip.innerHTML = `
        <div class="profile-avatar" style="background: ${avatar.bg}; color: ${avatar.color};">
          ${avatar.symbol}
        </div>
        <span>${profile.username}</span>
      `;
    }

    // Calculate today's trained minutes
    const todayKey = new Date().toISOString().slice(0, 10);
    const todayActivity = stats.activityByDate?.[todayKey] || { minutes: 0, sessionsCount: 0 };
    const todayMinutes = todayActivity.minutes || 0;
    const targetMin = prefs.dailyGoalMin || 15;
    const pct = Math.min(100, Math.round((todayMinutes / targetMin) * 100));

    // Update sidebar daily goal widget
    const goalCard = this.rootEl.querySelector('#sidebar-daily-goal-card');
    if (goalCard) {
      goalCard.innerHTML = `
        <div class="sidebar-goal-widget">
          <div class="goal-widget-header">
            <span>${isVi ? 'Mục tiêu hôm nay' : 'Daily Goal'}</span>
            <span class="goal-pct">${pct}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width: ${pct}%"></div>
          </div>
          <span class="goal-sub">${todayMinutes} / ${targetMin} ${isVi ? 'phút' : 'min'}</span>
        </div>
      `;
    }
  }

  setActiveRoute(route) {
    this.currentRoute = route;
    this.rootEl.querySelectorAll('.nav-item, .mobile-tab').forEach(el => {
      if (el.dataset.route === route) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  getViewContainer() {
    return this.viewContainer;
  }
}

export const shell = new UIHellShell();
