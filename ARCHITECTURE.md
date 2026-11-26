# NeuroFit — Master Architecture & Design System Specification (Phase 1)

> **Role**: Principal Software Architecture, UI/UX System & Cognitive Product Specification.  
> **Target Hosting**: 100% Static GitHub Pages (Zero-Build Native ES6+ Modules, Offline-First PWA).  
> **Primary UX**: Soft Wellness Neo-Minimalist, Mobile-First (`100dvh` Arena + Custom In-Game Numpad), Bilingual (`EN` / `VI`).

---

## 1. Architectural Principles & GitHub Pages Rules

1. **Zero-Build Native ES Modules**:
   - Loaded via `<script type="module" src="./src/main.js"></script>` in `index.html`.
   - **Mandatory Relative Imports**: Every JS import MUST use explicit relative paths and `.js` extensions (e.g., `import { storage } from '../core/storage.js';`). Never use bare specifiers or leading `/` paths so the app runs identically at `https://<user>.github.io/NeuroFit/` and `http://localhost:8080/`.
2. **Hash-Based SPA Routing**:
   - Routes: `#/dashboard`, `#/daily`, `#/library`, `#/categories`, `#/analytics`, `#/achievements`, `#/history`, `#/settings`, and `#/play/:gameId`.
   - Prevents 404 errors on GitHub Pages refresh or PWA standalone launch.
3. **Real Data Only (Zero Fabrication)**:
   - Every KPI, chart, streak, XP bar, and personal best reads exclusively from `IndexedDB` (`NeuroFitDB`) and `LocalStorage` (`neurofit_prefs_v1`, `neurofit_profile_v1`). Fresh users see clean zero/baseline states with motivating callouts.

---

## 2. Visual Design System ("Soft Wellness Neo-Minimalist")

### 2.1 Color Tokens (`src/styles/tokens.css`)
- **Soft Daylight (`:root`, `[data-theme="light"]`)**:
  - `--bg-app`: `#F6F8FC` (Warm Porcelain — prevents harsh white glare on mobile screens)
  - `--bg-surface`: `#FFFFFF`
  - `--bg-surface-subtle`: `#EEF2F8`
  - `--bg-elevated`: `rgba(255, 255, 255, 0.88)`
  - `--border-subtle`: `rgba(15, 23, 42, 0.07)`
  - `--border-strong`: `rgba(15, 23, 42, 0.14)`
  - `--text-primary`: `#0F172A`
  - `--text-secondary`: `#475569`
  - `--text-muted`: `#64748B`
  - `--brand-primary`: `#4F46E5` (Electric Indigo)
  - `--brand-primary-hover`: `#4338CA`
  - `--brand-primary-soft`: `rgba(79, 70, 229, 0.10)`
  - `--brand-secondary`: `#0D9488` (Wellness Teal)
- **Midnight Focus (`[data-theme="dark"]`)**:
  - `--bg-app`: `#0B1120`
  - `--bg-surface`: `#131C31`
  - `--bg-surface-subtle`: `#1C2842`
  - `--bg-elevated`: `rgba(19, 28, 49, 0.88)`
  - `--border-subtle`: `rgba(255, 255, 255, 0.08)`
  - `--border-strong`: `rgba(255, 255, 255, 0.16)`
  - `--text-primary`: `#F8FAFC`
  - `--text-secondary`: `#CBD5E1`
  - `--text-muted`: `#94A3B8`
  - `--brand-primary`: `#6366F1`
  - `--brand-primary-hover`: `#818CF8`
  - `--brand-primary-soft`: `rgba(99, 102, 241, 0.16)`
  - `--brand-secondary`: `#14B8A6`

### 2.2 8 Cognitive Category Tokens
| # | Category ID | EN Name | VI Name | Primary Hex | Soft Tint (Light) |
|---|---|---|---|---|---|
| 1 | `memory` | Memory | Trí nhớ | `#6366F1` | `#EEF2FF` |
| 2 | `attention` | Attention | Sự chú ý | `#F59E0B` | `#FEF3C7` |
| 3 | `speed` | Processing Speed | Tốc độ xử lý | `#06B6D4` | `#ECFEFF` |
| 4 | `problem` | Problem Solving | Giải quyết vấn đề | `#10B981` | `#ECFDF5` |
| 5 | `math` | Mental Math | Toán nhẩm | `#3B82F6` | `#EFF6FF` |
| 6 | `flexibility` | Cognitive Flexibility | Tư duy linh hoạt | `#EC4899` | `#FDF2F8` |
| 7 | `language` | Language | Ngôn ngữ | `#8B5CF6` | `#F5F3FF` |
| 8 | `logic` | Logical Reasoning | Suy luận Logic | `#F97316` | `#FFF7ED` |

### 2.3 Radii, Elevation & Mobile Ergonomics
- Radii: `--radius-xs: 8px`, `--radius-sm: 12px`, `--radius-md: 16px`, `--radius-lg: 22px`, `--radius-xl: 28px`, `--radius-pill: 9999px`.
- Shadows: Soft ambient elevation (`0 2px 12px rgba(15, 23, 42, 0.04)`), subtle tactile button press (`transform: scale(0.97)`).
- Numerals: `font-variant-numeric: tabular-nums` mandatory on timers, scores, reaction times, and equations.
- Mobile Arena: `position: fixed; inset: 0; height: 100dvh; overscroll-behavior: none; touch-action: manipulation; user-select: none;` + Custom In-Game Numpad (`48px+` buttons) to prevent OS virtual keyboard popups.

---

## 3. Exact Module Contracts (Single Source of Truth)

### 3.1 `src/core/events.js`
- Exports `bus` with `.on(event, handler)`, `.off(event, handler)`, `.emit(event, detail)`.
- Standard events: `'prefs:changed'`, `'profile:changed'`, `'session:saved'`, `'route:changed'`, `'achievement:unlocked'`.

### 3.2 `src/core/i18n.js`
- Exports `i18n` singleton:
  - `i18n.getLang()` -> `'en' | 'vi'`
  - `i18n.setLang(lang)` -> updates `<html>` `lang` attribute, persists via `storage.savePrefs({ lang })`, emits `'prefs:changed'`.
  - `i18n.t(key, params = {})` -> returns localized string with `{param}` interpolation.
  - `i18n.pick(bilingualObj)` -> given `{ en: '...', vi: '...' }`, returns current language text.

### 3.3 `src/core/storage.js`
- Hybrid LocalStorage + IndexedDB (`NeuroFitDB`, version `1`).
- Object stores:
  - `sessions` (`keyPath: 'id'`, indexes: `gameId`, `categoryId`, `completedAt`, `dateKey`)
  - `dailyTraining` (`keyPath: 'date'`)
  - `achievements` (`keyPath: 'id'`)
  - `difficultyHistory` (`keyPath: 'id'`, index: `gameId`)
- Exports `storage`:
  - `await storage.init()`
  - `storage.getProfile()` -> `{ id, username, avatarId, createdAt }`
  - `storage.saveProfile(patch)`
  - `storage.getPrefs()` -> `{ theme: 'light', lang: 'en', sound: true, music: false, haptics: true, dailyGoalMin: 15, preferredDifficulty: 'beginner', onboarded: false, favorites: [], unlockedThemes: ['light', 'dark'] }`
  - `storage.savePrefs(patch)`
  - `storage.toggleFavorite(gameId)` -> returns boolean `isFav`
  - `await storage.saveSession(sessionRecord)` -> persists session, updates game difficulty via `difficultyEngine`, awards XP, checks daily completion, emits `'session:saved'`.
  - `await storage.getSessions(limit = 500)` -> sorted newest first.
  - `await storage.getStats()` -> computes real `{ totalSessions, totalPlayTimeSec, currentStreak, longestStreak, totalXp, level, xpIntoLevel, xpForNextLevel, nfiScore, avgAccuracy, avgReactionMs, personalBests, lastPlayedMap, categoryScores }`.
  - `await storage.getOrCreateDailyTraining(gamesCatalog)` -> returns today's (`YYYY-MM-DD`) 5-game personalized workout.
  - `await storage.exportJSON()` -> returns serialized JSON backup string.
  - `await storage.importJSON(jsonStr)` -> validates schema & restores all stores + prefs.
  - `await storage.resetAll()` -> clears IndexedDB + LocalStorage and reinitializes defaults.

### 3.4 `src/core/audio.js`
- Exports `audio`:
  - `audio.tap()` — soft high-Q sine click (25ms) + `vibrate(8)`
  - `audio.correct(streak = 1)` — ascending warm major-pentatonic chime + `vibrate(12)`
  - `audio.wrong()` — gentle low triangle thud + `vibrate([20, 30, 20])`
  - `audio.countdown(isGo = false)` — crisp tick / octave chime on GO
  - `audio.celebrate()` — warm 4-note arpeggio fanfare + `vibrate([15, 40, 25])`

### 3.5 `src/core/difficulty.js`
- `export const DIFFICULTY_TIERS = ['beginner', 'easy', 'intermediate', 'advanced', 'expert'];`
- Exports `difficultyEngine`:
  - `getTier(gameId)` -> returns stored tier for `gameId` or user's `preferredDifficulty`.
  - `getTierConfig(tier)` -> returns `{ index, speedMultiplier, complexity, xpMultiplier, label: { en, vi } }`.
  - `evaluateAfterSession(gameId, recentSessionsForGame)` -> requires at least 2 consecutive strong sessions (`accuracy >= 88%` and high score/speed) to promote, or 2 consecutive struggling sessions (`accuracy < 55%`) to demote; never flips on a single outlier session.

### 3.6 `src/core/router.js`
- Exports `router`:
  - `router.onRoute(callback)` — invoked with `{ path, params, rawHash }` (e.g., `path: '/play/:gameId'`, `params: { gameId: 'sequence-recall' }`).
  - `router.navigate(hash)`
  - `router.start()`

### 3.7 `src/data/categories.js` & `src/data/games-catalog.js`
- `CATEGORIES`: Array of 8 category objects (`id`, `order`, `color`, `softBg`, `darkSoftBg`, `name: { en, vi }`, `description: { en, vi }`, `iconName`).
- `GAMES_CATALOG`: Array of all **27 original mini-games** (`id`, `num`, `categoryId`, `name: { en, vi }`, `subtitle: { en, vi }`, `description: { en, vi }`, `instructions: { en, vi }`, `estimatedMin`, `durationSec`, `emblem`).
  - **Memory (1–4)**: `sequence-recall`, `number-memory`, `spatial-memory`, `card-matching`
  - **Attention (5–8)**: `target-tracking`, `selective-attention`, `visual-search`, `stroop-challenge`
  - **Processing Speed (9–12)**: `speed-match`, `reaction-time`, `rapid-calculation`, `symbol-comparison`
  - **Problem Solving (13–16)**: `pattern-recognition`, `matrix-reasoning`, `tower-of-hanoi`, `puzzle-solver`
  - **Mental Math (17–19)**: `mental-arithmetic`, `number-series`, `quick-estimate`
  - **Cognitive Flexibility (20–22)**: `task-switching`, `rule-change`, `dual-n-back`
  - **Language (23–24)**: `word-association`, `vocabulary-challenge`
  - **Logical Reasoning (25–27)**: `syllogism-verdict`, `deductive-grid`, `set-logic`

### 3.8 `src/games/base-game.js` & `src/games/registry.js`
- `BaseGame` lifecycle interface:
  - `constructor(container, callbacks, options)` where `callbacks = { onScoreUpdate, onProgressUpdate, onGameEnd, audio }` and `options = { difficulty, lang, gameMeta }`
  - `initialize()`, `start()`, `pause()`, `resume()`, `handleInput(eventOrAction)`, `update(dt)`, `render()`, `calculateScore()`, `end()`, `destroy()`
- `GAME_REGISTRY`: Maps `gameId` -> async factory or class constructor, plus `isImplemented(gameId)`.

---

## 4. 8-Phase Implementation Roadmap

- **Phase 1 + UI Shell Preview (Current Gate)**: Master architecture, Design System CSS, Core persistence/i18n/audio/difficulty/router, 8 Categories + 27 Games catalog, full responsive Desktop + Mobile UI Shell, 15s Onboarding, and 1 complete vertical-slice playable game (`sequence-recall`) to validate touch feel & visual polish with the user.
- **Phase 2 — Core Application Deepening**: Enhanced contextual drawers, streak calendar interactions, complete Training History filtering, full Settings JSON Export/Import/Reset verification.
- **Phase 3 — Shared Game Engine & Components**: Canvas loop helper, procedural puzzle generators, shared reaction timers, custom virtual Numpad & Swipe gesture controllers.
- **Phase 4 — Full 27-Game Development**: Parallel implementation of remaining 26 original mini-games across all 8 cognitive domains, each independently verified.
- **Phase 5 — Personalized Daily Training Engine**: Weak-skill weighted 5-game daily generator, guided session flow ("Game 1 of 5 -> Next Game"), bonus XP celebration.
- **Phase 6 — Performance Analytics & Gamification**: 7 interactive SVG/Canvas chart types, date/category/game filters, period comparison, 14+ real achievements, daily/weekly challenges, unlockable themes.
- **Phase 7 — Offline & PWA**: Complete asset manifest caching in `sw.js`, install prompt banner, offline verification.
- **Phase 8 — Final QA & GitHub Pages Readiness**: End-to-end browser & mobile viewport testing, zero console errors, `README.md` & deployment guide.
