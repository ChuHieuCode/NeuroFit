/**
 * BaseGame — Mandatory 10-method lifecycle contract from Master Prompt Section 15.
 */
export class BaseGame {
  constructor(container, callbacks = {}, options = {}) {
    this.container = container;
    this.callbacks = {
      onScoreUpdate: () => {},
      onProgressUpdate: () => {},
      onGameEnd: () => {},
      audio: null,
      ...callbacks
    };
    this.options = {
      difficulty: 'beginner',
      lang: 'en',
      gameMeta: null,
      ...options
    };
    this.status = 'idle'; // 'idle' | 'running' | 'paused' | 'ended'
  }

  initialize() {
    // Override in subclass to build DOM & setup state
  }

  start() {
    this.status = 'running';
  }

  pause() {
    if (this.status === 'running') {
      this.status = 'paused';
    }
  }

  resume() {
    if (this.status === 'paused') {
      this.status = 'running';
    }
  }

  handleInput(input) {
    // Override in subclass to handle keyboard/touch/clicks
  }

  update(dt) {
    // Override in subclass for time-based animation / logic
  }

  render() {
    // Override in subclass to update DOM / canvas
  }

  calculateScore() {
    // Override in subclass to return final score metrics
    return { score: 0, accuracy: 100, reactionMs: 0 };
  }

  end() {
    if (this.status === 'ended') return;
    this.status = 'ended';
    const summary = this.calculateScore();
    if (this.callbacks.onGameEnd) {
      this.callbacks.onGameEnd(summary);
    }
  }

  destroy() {
    this.status = 'ended';
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
