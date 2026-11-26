/**
 * NeuroFit Procedural Web Audio API Synthesizer & Haptics Wrapper (Phase 1)
 */

class AudioManager {
  constructor() {
    this.audioCtx = null;
    this.soundEnabled = true;
    this.hapticsEnabled = true;
    this._initGestureListener();
  }

  _initGestureListener() {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      this._getAudioContext();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
  }

  _getAudioContext() {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  setConfig({ sound, haptics }) {
    if (typeof sound === 'boolean') this.soundEnabled = sound;
    if (typeof haptics === 'boolean') this.hapticsEnabled = haptics;
  }

  vibrate(pattern) {
    if (!this.hapticsEnabled) return;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(pattern);
      } catch (err) {
        // Ignore vibration errors on unsupported platforms
      }
    }
  }

  tap() {
    this.vibrate(6);
    if (!this.soundEnabled) return;
    const ctx = this._getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.028);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.028);
    } catch (e) {}
  }

  correct(combo = 1) {
    this.vibrate(12);
    if (!this.soundEnabled) return;
    const ctx = this._getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Rising major scale notes depending on combo
      const notes = [523.25, 659.25, 783.99, 880.00, 1046.50]; // C5, E5, G5, A5, C6
      const noteIdx = Math.min(Math.max(0, combo - 1), notes.length - 1);
      const freq = notes[noteIdx];

      const osc = ctx.createOscillator();
      const triangle = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      triangle.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      triangle.frequency.setValueAtTime(freq * 1.5, now);

      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      triangle.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      triangle.start(now);
      osc.stop(now + 0.14);
      triangle.stop(now + 0.14);
    } catch (e) {}
  }

  wrong() {
    this.vibrate([18, 28, 18]);
    if (!this.soundEnabled) return;
    const ctx = this._getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(210, now);
      osc.frequency.exponentialRampToValueAtTime(155, now + 0.18);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {}
  }

  countdown(isGo = false) {
    if (!isGo) {
      this.vibrate(8);
      if (!this.soundEnabled) return;
      const ctx = this._getAudioContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(660, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
      } catch (e) {}
    } else {
      this.vibrate([10, 20, 15]);
      if (!this.soundEnabled) return;
      const ctx = this._getAudioContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(880, now); // A5
        osc2.frequency.setValueAtTime(1320, now); // E6

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.22);
        osc2.stop(now + 0.22);
      } catch (e) {}
    }
  }

  celebrate() {
    this.vibrate([15, 35, 25]);
    if (!this.soundEnabled) return;
    const ctx = this._getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const startTime = now + idx * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.1, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.2);
      });
    } catch (e) {}
  }
}

export const audio = new AudioManager();
