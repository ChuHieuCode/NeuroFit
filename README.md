# NeuroFit — Cognitive Fitness & Brain Training PWA

> **Soft Wellness Neo-Minimalist PWA** designed for daily cognitive enhancement across 8 core domains and 27 mini-games. Built with 100% native ES6+ modules (Zero-Build architecture) and optimized for GitHub Pages and offline-first mobile usage.

---

## 🚀 Key Features

1. **8 Cognitive Categories & 27 Mini-Games**:
   - **Memory** (Sequence Recall, Number Memory, Spatial Memory, Card Matching)
   - **Attention** (Target Tracking, Selective Attention, Visual Search, Stroop Challenge)
   - **Processing Speed** (Speed Match, Reaction Time, Rapid Calculation, Symbol Comparison)
   - **Problem Solving** (Pattern Recognition, Matrix Reasoning, Tower of Hanoi, Puzzle Solver)
   - **Mental Math** (Mental Arithmetic, Number Series, Quick Estimate)
   - **Cognitive Flexibility** (Task Switching, Rule Change, Dual N-Back)
   - **Language** (Word Association, Vocabulary Challenge)
   - **Logical Reasoning** (Syllogism Verdict, Deductive Grid, Triad Logic)
2. **Soft Wellness Neo-Minimalist UI**:
   - Adaptive themes (**Soft Daylight**, **Midnight Focus**, **Calm Forest**, **Sunset Coral**, and System).
   - Mobile-first responsive layouts (`360px` to `1600px`), custom in-game virtual numpad, and touch swipe gestures.
3. **Advanced Gamification & Analytics**:
   - Progressive XP & Level system with unlockable themes and profile avatars.
   - 12 comprehensive Achievements with exact numerical progress tracking.
   - Dynamic Daily & Weekly Challenges computed from real gameplay data.
   - 7 interactive SVG/Canvas charts with deep filtering and period comparisons (`deltaScore`, `deltaAccuracy`, `deltaReactionMs`).
4. **Offline-First PWA**:
   - Hybrid LocalStorage + IndexedDB persistence (`NeuroFitDB`).
   - Full JSON Backup Export & Import capabilities.
   - Service Worker caching for instant offline loading and PWA installation.

---

## 📂 Project Structure

```text
NeuroFit/
├── index.html                # PWA entry point & SPA root
├── manifest.json             # Web App Manifest for PWA installation
├── sw.js                     # Service Worker for offline caching
├── preview-server.mjs        # Zero-dependency local preview server (Port 4173)
├── .nojekyll                 # Bypasses Jekyll for GitHub Pages
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions static deployment workflow
└── src/
    ├── main.js               # Application bootstrap & router initialization
    ├── core/
    │   ├── audio.js          # Web Audio API sound & haptic engine
    │   ├── difficulty.js     # Adaptive difficulty engine
    │   ├── events.js         # Event bus singleton
    │   ├── gamification.js   # XP levels, achievements, & challenges engine
    │   ├── analytics-engine.js # Real-data analytics & performance comparison
    │   ├── router.js         # Hash-based SPA router
    │   └── storage.js        # Hybrid IndexedDB + LocalStorage engine
    ├── data/
    │   ├── avatars-themes.js # Avatars, themes, & achievements catalog
    │   ├── categories.js     # 8 Cognitive domains catalog
    │   └── games-catalog.js  # 27 Mini-games metadata catalog
    ├── styles/
    │   ├── tokens.css        # Soft Wellness design system tokens & themes
    │   ├── main.css          # App shell & UI views styling
    │   └── games.css         # Shared game boards & mini-game styling
    ├── ui/                   # UI views (Dashboard, Daily, Library, Analytics, Settings, etc.)
    └── games/                # Mini-game implementations across 8 domains (27 games)
```

---

## 🛠️ Local Development & Preview

NeuroFit is a **zero-build** static web application. No bundlers or compilation steps are required.

1. Clone or open the repository.
2. Start the local preview server:
   ```bash
   node preview-server.mjs
   ```
3. Open `http://localhost:4173` in your browser, or open the printed LAN `http://192.168.x.x:4173` URL on your phone over Wi-Fi for mobile testing.

---

## 📦 GitHub Pages Deployment (2-Minute Guide)

NeuroFit is fully pre-configured for instant deployment on GitHub Pages:

### Method A: GitHub Actions (Recommended)
1. Push this repository to GitHub on the `main` or `master` branch.
2. The included GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically package and deploy the site via `actions/deploy-pages`.
3. In your GitHub repository settings under **Pages**, ensure the source is set to **GitHub Actions**.

### Method B: Direct Branch Deploy
1. In your GitHub repository settings under **Pages**, set the source branch to `main` (or `master`) and folder to `/ (root)`.
2. The `.nojekyll` file ensures GitHub Pages serves all files and folders (including `src/`) directly without filtering out underscore-prefixed or hidden files.
