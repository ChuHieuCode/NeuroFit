/**
 * @file charts.js
 * @description Pure responsive SVG chart renderers (zero external dependencies).
 */

export function renderRadarChart(categoryScores = {}, categories = [], lang = 'en') {
  const size = 320;
  const center = size / 2; // 160
  const radius = 96;
  const count = categories.length || 8;

  const shortNames = {
    en: { memory: 'Memory', attention: 'Attention', speed: 'Speed', problem: 'Problem', math: 'Math', flexibility: 'Flexibility', language: 'Language', logic: 'Logic' },
    vi: { memory: 'Trí nhớ', attention: 'Chú ý', speed: 'Tốc độ', problem: 'Giải đố', math: 'Toán nhẩm', flexibility: 'Linh hoạt', language: 'Ngôn ngữ', logic: 'Logic' }
  };
  const langMap = shortNames[lang] || shortNames.en;

  let gridRings = '';
  let axisLines = '';
  let labels = '';
  let vertexDots = '';

  [0.25, 0.5, 0.75, 1.0].forEach(level => {
    let ringPoints = '';
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i - Math.PI / 2;
      const x = center + radius * level * Math.cos(angle);
      const y = center + radius * level * Math.sin(angle);
      ringPoints += `${x},${y} `;
    }
    gridRings += `<polygon points="${ringPoints.trim()}" fill="none" stroke="var(--border-strong)" stroke-opacity="${level === 1 ? 0.4 : 0.2}" stroke-width="${level === 1 ? 1.5 : 1}"/>`;
  });

  let dataPoints = '';
  categories.forEach((cat, i) => {
    const angle = (Math.PI * 2 / count) * i - Math.PI / 2;
    const ax = center + radius * Math.cos(angle);
    const ay = center + radius * Math.sin(angle);
    axisLines += `<line x1="${center}" y1="${center}" x2="${ax}" y2="${ay}" stroke="var(--border-strong)" stroke-opacity="0.3" stroke-width="1"/>`;

    const lx = center + (radius + 20) * Math.cos(angle);
    const ly = center + (radius + 20) * Math.sin(angle);
    const catName = langMap[cat.id] || (cat.name[lang] || cat.name.en);
    const score = Math.max(0, Math.min(100, categoryScores[cat.id] || 0));
    const scoreNorm = score / 100;

    const dx = center + radius * scoreNorm * Math.cos(angle);
    const dy = center + radius * scoreNorm * Math.sin(angle);
    dataPoints += `${dx},${dy} `;
    vertexDots += `<circle cx="${dx}" cy="${dy}" r="4" fill="${cat.color}" stroke="var(--bg-surface)" stroke-width="2"/>`;

    let anchor = 'middle';
    if (Math.abs(Math.cos(angle)) > 0.3) {
      anchor = Math.cos(angle) > 0 ? 'start' : 'end';
    }
    labels += `<text x="${lx}" y="${ly}" font-size="11" font-weight="600" fill="var(--text-secondary)" text-anchor="${anchor}" dominant-baseline="central">${catName}</text>`;
  });

  return `<svg class="radar-chart" viewBox="-58 -14 436 348" width="100%" height="100%">
    <g>${gridRings}${axisLines}</g>
    <polygon points="${dataPoints.trim()}" fill="var(--brand-primary)" fill-opacity="0.25" stroke="var(--brand-primary)" stroke-width="2.5"/>
    <g>${vertexDots}</g>
    <g>${labels}</g>
  </svg>`;
}

export function renderWeeklyChart(activityByDate = {}, lang = 'en') {
  const width = 360;
  const height = 180;
  const dayLabels = lang === 'vi' ? ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const today = new Date();
  const weekData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const val = activityByDate[key] || { count: 0, minutes: 0 };
    weekData.push({ key, label: dayLabels[d.getDay() === 0 ? 6 : d.getDay() - 1], ...val, isToday: i === 0 });
  }

  const maxVal = Math.max(5, ...weekData.map(d => d.minutes || d.count * 3 || 0));
  const chartHeight = 110;
  const barWidth = 32;
  const gap = 16;
  const startX = 24;

  let bars = '';
  weekData.forEach((d, i) => {
    const x = startX + i * (barWidth + gap);
    const scoreVal = d.minutes || d.count * 3;
    const barH = Math.max(8, (scoreVal / maxVal) * chartHeight);
    const y = 130 - barH;
    const fill = d.isToday ? 'var(--brand-primary)' : 'var(--bg-surface-subtle)';
    const textFill = d.isToday ? 'var(--brand-primary)' : 'var(--text-muted)';

    bars += `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="10" fill="${fill}" stroke="var(--border-subtle)" stroke-width="1">
        <title>${d.key}: ${d.count} sessions, ${d.minutes || 0} min</title>
      </rect>
      <text x="${x + barWidth / 2}" y="152" font-size="11" font-weight="${d.isToday ? '700' : '500'}" fill="${textFill}" text-anchor="middle">${d.label}</text>
    `;
  });

  return `<svg class="weekly-chart" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
    <line x1="20" y1="130" x2="340" y2="130" stroke="var(--border-strong)" stroke-opacity="0.3" stroke-width="1"/>
    ${bars}
  </svg>`;
}

export function renderTrendChart(sessions = [], metric = 'score', color = '#4F46E5', lang = 'en') {
  const width = 520;
  const height = 200;
  if (!sessions || sessions.length < 2) {
    const msg = lang === 'vi' ? 'Chưa đủ dữ liệu biểu đồ xu hướng' : 'Insufficient trend data yet';
    return `<div class="empty-state-box p-8 text-center text-muted text-sm">${msg}</div>`;
  }

  const sorted = [...sessions].sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt)).slice(-20);
  const values = sorted.map(s => s[metric] || s.score || 0);
  const minVal = 0;
  const maxVal = Math.max(10, ...values);

  const padX = 30;
  const padY = 30;
  const w = width - padX * 2;
  const h = height - padY * 2;

  let pts = '';
  let areaPts = `${padX},${height - padY} `;
  sorted.forEach((s, i) => {
    const val = s[metric] || s.score || 0;
    const x = padX + (i / (sorted.length - 1)) * w;
    const y = height - padY - ((val - minVal) / (maxVal - minVal)) * h;
    pts += `${x},${y} `;
    areaPts += `${x},${y} `;
  });
  areaPts += `${padX + w},${height - padY}`;

  return `<svg class="trend-chart" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
    <defs>
      <linearGradient id="trend-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0.0"/>
      </linearGradient>
    </defs>
    <polygon points="${areaPts}" fill="url(#trend-grad)"/>
    <polyline points="${pts.trim()}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

export function renderStreakCalendar(activityByDate = {}, lang = 'en') {
  const daysCount = 28;
  const today = new Date();
  const cells = [];

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const record = activityByDate[key];
    const count = record ? record.count : 0;
    let activeStyle = '';
    if (count >= 3) activeStyle = 'style="background: var(--brand-primary); opacity: 1;"';
    else if (count === 2) activeStyle = 'style="background: var(--brand-primary); opacity: 0.7;"';
    else if (count === 1) activeStyle = 'style="background: var(--brand-primary); opacity: 0.4;"';

    cells.push({ key, count, activeStyle, isActive: count > 0 });
  }

  let html = `<div class="streak-calendar-grid">`;
  cells.forEach(c => {
    html += `<div class="streak-cell ${c.isActive ? 'active' : ''}" ${c.activeStyle} title="${c.key}: ${c.count} sessions"></div>`;
  });
  html += `</div>`;
  return html;
}
