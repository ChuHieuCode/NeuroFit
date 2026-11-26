/**
 * @file icons.js
 * @description SVG icon library and custom 27 distinct game emblems.
 */

const ICONS_MAP = {
  'home': '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  'calendar': '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  'grid': '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
  'layers': '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  'bar-chart': '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  'award': '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
  'clock': '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  'settings': '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  'play': '<polygon points="5 3 19 12 5 21 5 3"/>',
  'pause': '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
  'rotate-ccw': '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',
  'x': '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  'check': '<polyline points="20 6 9 17 4 12"/>',
  'flame': '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.5 4 6.5 2 2 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a8.125 8.125 0 0 1 1.5 3.5z"/>',
  'sparkles': '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4M3 5h4M19 17v4M17 19h4"/>',
  'sun': '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
  'moon': '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  'heart': '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  'heart-filled': '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78 z" fill="currentColor"/>',
  'search': '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  'chevron-right': '<polyline points="9 18 15 12 9 6"/>',
  'chevron-left': '<polyline points="15 18 9 12 15 6"/>',
  'volume-2': '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>',
  'volume-x': '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>',
  'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  'upload': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  'trash': '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
  'brain': '<path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 3.44-3.54z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-3.44-3.54z"/>',
  'eye': '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  'zap': '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  'puzzle': '<path d="M19 11a3 3 0 0 0-3 3v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a3 3 0 0 0 3-3 3 3 0 0 0-3-3V3a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v2a3 3 0 0 0 3 3 3 3 0 0 0 3 3z"/>',
  'calculator': '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="10" y2="18"/><line x1="14" y1="18" x2="16" y2="18"/>',
  'shuffle': '<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>',
  'book': '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  'compass': '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
  'more-horizontal': '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  'trophy': '<polyline points="8 21 16 21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M7 4H17V7C17 10.31 14.31 13 11 13H13C9.69 13 7 10.31 7 7V4Z"/><path d="M4 7H7M17 7H20"/>',
  'lock': '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  'arrow-up-right': '<line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>'
};

export function icon(name, size = 20, className = '') {
  const paths = ICONS_MAP[name] || ICONS_MAP['sparkles'];
  return `<svg class="icon icon-${name} ${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

const GAME_EMBLEMS = {
  'sequence-recall': '<rect x="8" y="8" width="10" height="10" rx="3" fill="currentColor"/><rect x="22" y="8" width="10" height="10" rx="3" fill="currentColor" fill-opacity="0.5"/><rect x="8" y="22" width="10" height="10" rx="3" fill="currentColor" fill-opacity="0.5"/><rect x="22" y="22" width="10" height="10" rx="3" fill="currentColor"/>',
  'number-memory': '<text x="20" y="26" font-size="20" font-weight="bold" fill="currentColor" text-anchor="middle">123</text>',
  'spatial-memory': '<circle cx="14" cy="14" r="3" fill="currentColor"/><circle cx="26" cy="14" r="3" fill="currentColor" fill-opacity="0.4"/><circle cx="20" cy="26" r="3" fill="currentColor"/>',
  'card-matching': '<rect x="8" y="10" width="12" height="20" rx="2" fill="currentColor" fill-opacity="0.3"/><rect x="20" y="10" width="12" height="20" rx="2" fill="currentColor"/>',
  'target-tracking': '<circle cx="20" cy="20" r="14" stroke="currentColor" stroke-width="2" stroke-dasharray="4 2"/><circle cx="20" cy="20" r="6" fill="currentColor"/>',
  'selective-attention': '<polygon points="20,8 32,28 8,28" fill="currentColor" fill-opacity="0.3"/><circle cx="20" cy="20" r="4" fill="currentColor"/>',
  'visual-search': '<circle cx="17" cy="17" r="7" stroke="currentColor" stroke-width="2.5"/><line x1="22" y1="22" x2="30" y2="30" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>',
  'stroop-challenge': '<circle cx="16" cy="20" r="8" fill="currentColor" fill-opacity="0.6"/><circle cx="24" cy="20" r="8" fill="currentColor" fill-opacity="0.4"/>',
  'speed-match': '<path d="M10 15L16 20L10 25" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M22 15L28 20L22 25" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
  'reaction-time': '<circle cx="20" cy="20" r="12" stroke="currentColor" stroke-width="3"/><polyline points="20,12 20,20 25,23" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
  'rapid-calculation': '<line x1="12" y1="20" x2="28" y2="20" stroke="currentColor" stroke-width="3"/><line x1="20" y1="12" x2="20" y2="28" stroke="currentColor" stroke-width="3"/>',
  'symbol-comparison': '<path d="M10 16L16 22L28 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
  'pattern-recognition': '<polygon points="20,10 30,26 10,26" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="20" cy="20" r="3" fill="currentColor"/>',
  'matrix-reasoning': '<rect x="10" y="10" width="8" height="8" fill="currentColor"/><rect x="22" y="10" width="8" height="8" fill="currentColor" fill-opacity="0.4"/><rect x="10" y="22" width="8" height="8" fill="currentColor" fill-opacity="0.4"/><rect x="22" y="22" width="8" height="8" fill="currentColor"/>',
  'tower-of-hanoi': '<rect x="18" y="12" width="4" height="20" fill="currentColor"/><rect x="10" y="26" width="20" height="4" rx="2" fill="currentColor"/><rect x="13" y="20" width="14" height="4" rx="2" fill="currentColor"/><rect x="16" y="14" width="8" height="4" rx="2" fill="currentColor"/>',
  'puzzle-solver': '<path d="M12 12h8v8h-8z" stroke="currentColor" stroke-width="2"/><path d="M20 16h8v8h-8z" fill="currentColor" fill-opacity="0.5"/>',
  'mental-arithmetic': '<text x="20" y="27" font-size="22" font-weight="bold" fill="currentColor" text-anchor="middle">±</text>',
  'number-series': '<polyline points="10,26 16,18 22,22 30,12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
  'quick-estimate': '<path d="M10 26L20 14L30 26" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="20" cy="14" r="3" fill="currentColor"/>',
  'task-switching': '<path d="M12 14H24M24 14L20 10M24 14L20 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M28 26H16M16 26L20 22M16 26L20 30" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>',
  'rule-change': '<polygon points="20,10 28,24 12,24" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="20" cy="19" r="3" fill="currentColor"/>',
  'dual-n-back': '<circle cx="20" cy="20" r="14" stroke="currentColor" stroke-width="2" stroke-dasharray="3 3"/><rect x="15" y="15" width="10" height="10" rx="2" fill="currentColor"/>',
  'word-association': '<circle cx="14" cy="20" r="4" fill="currentColor"/><circle cx="26" cy="20" r="4" fill="currentColor"/><line x1="18" y1="20" x2="22" y2="20" stroke="currentColor" stroke-width="2.5"/>',
  'vocabulary-challenge': '<path d="M10 12h20v16H10z" fill="none" stroke="currentColor" stroke-width="2"/><line x1="14" y1="17" x2="26" y2="17" stroke="currentColor" stroke-width="2"/><line x1="14" y1="22" x2="22" y2="22" stroke="currentColor" stroke-width="2"/>',
  'syllogism-verdict': '<circle cx="16" cy="20" r="8" fill="currentColor" fill-opacity="0.3"/><circle cx="24" cy="20" r="8" fill="currentColor" fill-opacity="0.3"/>',
  'deductive-grid': '<rect x="10" y="10" width="20" height="20" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><line x1="10" y1="17" x2="30" y2="17" stroke="currentColor" stroke-width="1.5"/><line x1="17" y1="10" x2="17" y2="30" stroke="currentColor" stroke-width="1.5"/>',
  'set-logic': '<circle cx="14" cy="20" r="4" fill="currentColor"/><rect x="20" y="16" width="8" height="8" rx="1" fill="currentColor"/><polygon points="20,10 25,16 15,16" fill="currentColor"/>'
};

export function gameEmblem(gameId, accentColor = '#4F46E5', size = 30) {
  const customSvg = GAME_EMBLEMS[gameId] || `<circle cx="20" cy="20" r="10" stroke="${accentColor}" stroke-width="2.5"/><circle cx="20" cy="20" r="4" fill="${accentColor}"/>`;
  return `<svg class="game-emblem" width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: ${accentColor};">
    <rect width="40" height="40" rx="10" fill="${accentColor}" fill-opacity="0.15"/>
    ${customSvg}
  </svg>`;
}
