import { storage } from '../core/storage.js';
import { audio } from '../core/audio.js';
import { i18n } from '../core/i18n.js';
import { AVATARS } from '../data/avatars-themes.js';

export function maybeShowOnboarding(onDone) {
  const prefs = storage.getPrefs();
  if (prefs.onboarded) {
    if (onDone) onDone();
    return;
  }

  const existing = document.getElementById('onboarding-modal');
  if (existing) existing.remove();

  const isVi = i18n.getLang() === 'vi';
  const profile = storage.getProfile();

  const overlay = document.createElement('div');
  overlay.id = 'onboarding-modal';
  overlay.className = 'onboarding-overlay';
  
  let selectedAvatar = profile.avatarId || AVATARS[0].id;
  let selectedGoal = prefs.dailyGoalMin || 15;
  let username = profile.username || 'Explorer';

  const renderModal = () => {
    const currLang = i18n.getLang();
    const vi = currLang === 'vi';

    overlay.innerHTML = `
      <div class="onboarding-card">
        <div class="onboard-header">
          <div class="brand-badge">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="var(--brand-primary)"/>
              <path d="M9 16C9 12.134 12.134 9 16 9C19.866 9 23 12.134 23 16C23 19.866 19.866 23 16 23C12.134 23 9 19.866 9 16Z" fill="white" fill-opacity="0.2"/>
              <path d="M12 16L15 19L20 13" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>NeuroFit</span>
          </div>
          <div class="lang-switch-pill">
            <button class="lang-btn ${!vi ? 'active' : ''}" data-lang="en">EN</button>
            <button class="lang-btn ${vi ? 'active' : ''}" data-lang="vi">VI</button>
          </div>
        </div>

        <h2>${vi ? 'Huấn luyện trí não mỗi ngày' : 'Train Your Brain. Improve Every Day.'}</h2>
        <p class="onboard-sub">${vi ? 'Chào mừng bạn đến với hệ sinh thái rèn luyện nhận thức khoa học hàng đầu.' : 'Welcome to your personalized cognitive fitness ecosystem.'}</p>

        <div class="onboard-step">
          <label>${vi ? 'Tên của bạn' : 'Your Name'}</label>
          <input type="text" id="onboard-name" value="${username}" maxlength="20" placeholder="${vi ? 'Nhập tên...' : 'Enter name...'}">
        </div>

        <div class="onboard-step">
          <label>${vi ? 'Chọn ảnh đại diện' : 'Choose Avatar'}</label>
          <div class="avatar-grid">
            ${AVATARS.map(av => `
              <button class="avatar-option ${av.id === selectedAvatar ? 'selected' : ''}" data-avatar="${av.id}" style="background: ${av.bg}; color: ${av.color};">
                ${av.symbol}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="onboard-step">
          <label>${vi ? 'Mục tiêu luyện tập hằng ngày' : 'Daily Goal'}</label>
          <div class="goal-pills">
            <button class="goal-pill ${selectedGoal === 5 ? 'active' : ''}" data-goal="5">5 min</button>
            <button class="goal-pill ${selectedGoal === 10 ? 'active' : ''}" data-goal="10">10 min</button>
            <button class="goal-pill ${selectedGoal === 15 ? 'active' : ''}" data-goal="15">15 min</button>
            <button class="goal-pill ${selectedGoal === 20 ? 'active' : ''}" data-goal="20">20 min</button>
          </div>
        </div>

        <div class="onboard-actions">
          <button class="btn btn-primary btn-lg" id="onboard-start-btn">
            ${vi ? 'Chơi Ngay / Bắt Đầu' : 'Play Now / Get Started'}
          </button>
          <button class="btn btn-ghost" id="onboard-skip-btn">
            ${vi ? 'Bỏ qua' : 'Skip for now'}
          </button>
        </div>
      </div>
    `;

    // Attach listeners
    overlay.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        i18n.setLang(lang);
        audio.tap();
        renderModal();
      });
    });

    overlay.querySelectorAll('.avatar-option').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedAvatar = btn.dataset.avatar;
        audio.tap();
        overlay.querySelectorAll('.avatar-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });

    overlay.querySelectorAll('.goal-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedGoal = parseInt(btn.dataset.goal, 10);
        audio.tap();
        overlay.querySelectorAll('.goal-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    const nameInput = overlay.querySelector('#onboard-name');
    nameInput.addEventListener('input', (e) => {
      username = e.target.value.trim() || 'Explorer';
    });

    const finishOnboarding = () => {
      audio.celebrate();
      storage.saveProfile({ username, avatarId: selectedAvatar });
      storage.savePrefs({ dailyGoalMin: selectedGoal, onboarded: true });
      overlay.classList.add('fade-out');
      setTimeout(() => {
        overlay.remove();
        if (onDone) onDone();
      }, 300);
    };

    overlay.querySelector('#onboard-start-btn').addEventListener('click', finishOnboarding);
    overlay.querySelector('#onboard-skip-btn').addEventListener('click', finishOnboarding);
  };

  renderModal();
  document.body.appendChild(overlay);
}
