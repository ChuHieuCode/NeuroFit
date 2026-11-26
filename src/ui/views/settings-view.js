import { storage } from '../../core/storage.js';
import { audio } from '../../core/audio.js';
import { i18n } from '../../core/i18n.js';
import { bus } from '../../core/events.js';
import { AVATARS, THEMES } from '../../data/avatars-themes.js';
import { showToast } from '../components/toast-confetti.js';

export async function renderSettingsView(container) {
  const isVi = i18n.getLang() === 'vi';
  const profile = storage.getProfile();
  const prefs = storage.getPrefs();

  container.innerHTML = `
    <div class="settings-view animate-fade-in">
      <div class="settings-header">
        <h2>${isVi ? 'Cài đặt tài khoản & Ứng dụng' : 'Settings & Preferences'}</h2>
        <p>${isVi ? 'Tùy chỉnh hồ sơ, giao diện, âm thanh và quản lý dữ liệu cá nhân.' : 'Customize your profile, themes, sound, and manage backup data.'}</p>
      </div>

      <div class="settings-sections">
        <!-- Profile Settings -->
        <div class="card">
          <h3>👤 ${isVi ? 'Hồ sơ người dùng' : 'User Profile'}</h3>
          <div class="setting-row">
            <label>${isVi ? 'Tên hiển thị' : 'Username'}</label>
            <input type="text" id="setting-username" value="${profile.username}" maxlength="20">
          </div>
          <div class="setting-row">
            <label>${isVi ? 'Ảnh đại diện' : 'Avatar'}</label>
            <div class="avatar-grid-sm">
              ${AVATARS.map(av => `
                <button class="avatar-opt-sm ${av.id === profile.avatarId ? 'active' : ''}" data-avatar="${av.id}" style="background: ${av.bg}; color: ${av.color};">
                  ${av.symbol}
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Preferences -->
        <div class="card">
          <h3>⚙️ ${isVi ? 'Tùy chọn chung' : 'General Preferences'}</h3>
          <div class="setting-row">
            <label>${isVi ? 'Mục tiêu hằng ngày (phút)' : 'Daily Goal (minutes)'}</label>
            <select id="setting-goal">
              <option value="5" ${prefs.dailyGoalMin === 5 ? 'selected' : ''}>5 min</option>
              <option value="10" ${prefs.dailyGoalMin === 10 ? 'selected' : ''}>10 min</option>
              <option value="15" ${prefs.dailyGoalMin === 15 ? 'selected' : ''}>15 min</option>
              <option value="20" ${prefs.dailyGoalMin === 20 ? 'selected' : ''}>20 min</option>
            </select>
          </div>
          <div class="setting-row">
            <label>${isVi ? 'Độ khó khởi điểm' : 'Preferred Difficulty'}</label>
            <select id="setting-difficulty">
              <option value="beginner" ${prefs.preferredDifficulty === 'beginner' ? 'selected' : ''}>Beginner</option>
              <option value="easy" ${prefs.preferredDifficulty === 'easy' ? 'selected' : ''}>Easy</option>
              <option value="intermediate" ${prefs.preferredDifficulty === 'intermediate' ? 'selected' : ''}>Intermediate</option>
              <option value="advanced" ${prefs.preferredDifficulty === 'advanced' ? 'selected' : ''}>Advanced</option>
            </select>
          </div>
          <div class="setting-row">
            <label>${isVi ? 'Ngôn ngữ' : 'Language'}</label>
            <select id="setting-lang">
              <option value="en" ${prefs.lang === 'en' ? 'selected' : ''}>English</option>
              <option value="vi" ${prefs.lang === 'vi' ? 'selected' : ''}>Tiếng Việt</option>
            </select>
          </div>
          <div class="setting-row">
            <label>${isVi ? 'Giao diện' : 'Theme'}</label>
            <select id="setting-theme">
              <option value="light" ${prefs.theme === 'light' ? 'selected' : ''}>Soft Daylight (Light)</option>
              <option value="dark" ${prefs.theme === 'dark' ? 'selected' : ''}>Midnight Focus (Dark)</option>
              <option value="system" ${prefs.theme === 'system' ? 'selected' : ''}>System Default</option>
              ${prefs.unlockedThemes.map(thId => {
                const th = THEMES.find(t => t.id === thId);
                return th ? `<option value="${th.id}" ${prefs.theme === th.id ? 'selected' : ''}>${th.name.en}</option>` : '';
              }).join('')}
            </select>
          </div>
        </div>

        <!-- Sound & Haptics -->
        <div class="card">
          <h3>🔊 ${isVi ? 'Âm thanh & Phản hồi xúc giác' : 'Sound & Haptics'}</h3>
          <div class="setting-row checkbox-row">
            <label>
              <input type="checkbox" id="setting-sound" ${prefs.sound ? 'checked' : ''}>
              <span>${isVi ? 'Hiệu ứng âm thanh (Sound FX)' : 'Sound Effects'}</span>
            </label>
          </div>
          <div class="setting-row checkbox-row">
            <label>
              <input type="checkbox" id="setting-haptics" ${prefs.haptics ? 'checked' : ''}>
              <span>${isVi ? 'Rung phản hồi (Haptics)' : 'Haptic Feedback'}</span>
            </label>
          </div>
        </div>

        <!-- Data Management -->
        <div class="card">
          <h3>💾 ${isVi ? 'Quản lý dữ liệu' : 'Data Management'}</h3>
          <div class="settings-action-row">
            <button class="btn btn-outline" id="export-json-btn">📥 ${isVi ? 'Xuất bản sao lưu JSON' : 'Export JSON Backup'}</button>
            <label class="btn btn-outline file-input-label">
              📤 ${isVi ? 'Nhập tệp JSON' : 'Import JSON Backup'}
              <input type="file" id="import-json-file" accept=".json" style="display: none;">
            </label>
            <button class="btn btn-danger" id="reset-all-btn">⚠️ ${isVi ? 'Khôi phục cài đặt gốc' : 'Reset All Progress'}</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach event listeners
  container.querySelector('#setting-username').addEventListener('change', async (e) => {
    const val = e.target.value.trim() || 'Explorer';
    await storage.saveProfile({ username: val });
    audio.tap();
    showToast(isVi ? 'Đã lưu tên người dùng!' : 'Username updated successfully!');
  });

  container.querySelectorAll('.avatar-opt-sm').forEach(btn => {
    btn.addEventListener('click', async () => {
      const avatarId = btn.dataset.avatar;
      await storage.saveProfile({ avatarId });
      audio.tap();
      container.querySelectorAll('.avatar-opt-sm').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      showToast(isVi ? 'Đã đổi ảnh đại diện!' : 'Avatar updated!');
    });
  });

  container.querySelector('#setting-goal').addEventListener('change', async (e) => {
    const dailyGoalMin = parseInt(e.target.value, 10);
    await storage.savePrefs({ dailyGoalMin });
    audio.tap();
    showToast(isVi ? 'Đã cập nhật mục tiêu!' : 'Daily goal updated!');
  });

  container.querySelector('#setting-difficulty').addEventListener('change', async (e) => {
    const preferredDifficulty = e.target.value;
    await storage.savePrefs({ preferredDifficulty });
    audio.tap();
    showToast(isVi ? 'Đã đổi độ khó ưa thích!' : 'Preferred difficulty updated!');
  });

  container.querySelector('#setting-lang').addEventListener('change', (e) => {
    const lang = e.target.value;
    bus.emit('i18n:changed', lang);
  });

  container.querySelector('#setting-theme').addEventListener('change', async (e) => {
    const theme = e.target.value;
    await storage.savePrefs({ theme });
    bus.emit('prefs:changed', { theme });
    audio.tap();
    showToast(isVi ? 'Đã đổi giao diện!' : 'Theme updated!');
  });

  container.querySelector('#setting-sound').addEventListener('change', async (e) => {
    const sound = e.target.checked;
    await storage.savePrefs({ sound });
    audio.tap();
    showToast(isVi ? 'Đã cập nhật âm thanh!' : 'Sound preference updated!');
  });

  container.querySelector('#setting-haptics').addEventListener('change', async (e) => {
    const haptics = e.target.checked;
    await storage.savePrefs({ haptics });
    audio.tap();
    showToast(isVi ? 'Đã cập nhật phản hồi rung!' : 'Haptics updated!');
  });

  // Export JSON
  container.querySelector('#export-json-btn').addEventListener('click', async () => {
    const jsonStr = await storage.exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neurofit-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    audio.celebrate();
    showToast(isVi ? 'Đã xuất tệp sao lưu JSON thành công!' : 'JSON backup exported successfully!');
  });

  // Import JSON
  container.querySelector('#import-json-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        await storage.importJSON(event.target.result);
        audio.celebrate();
        showToast(isVi ? 'Nhập dữ liệu thành công! Đang tải lại...' : 'Data imported successfully! Reloading...');
        setTimeout(() => location.reload(), 1200);
      } catch (err) {
        alert('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  });

  // Reset Progress
  container.querySelector('#reset-all-btn').addEventListener('click', async () => {
    if (confirm(isVi ? 'Bạn có chắc chắn muốn xóa toàn bộ tiến trình và khôi phục cài đặt gốc?' : 'Are you sure you want to reset all progress and restore defaults?')) {
      await storage.resetAll();
      audio.wrong();
      alert(isVi ? 'Đã đặt lại ứng dụng.' : 'Application reset.');
      location.reload();
    }
  });
}
