/**
 * @file numpad.js
 * @description Mobile-optimized virtual numpad component.
 */

export function renderNumpad({ showNegative = false, submitLabel = 'OK' } = {}) {
  const negBtn = showNegative ? `<button type="button" class="numpad-btn numpad-neg" data-action="neg">±</button>` : `<button type="button" class="numpad-btn numpad-clear" data-action="clear">C</button>`;

  return `
    <div class="numpad">
      <button type="button" class="numpad-btn" data-digit="1">1</button>
      <button type="button" class="numpad-btn" data-digit="2">2</button>
      <button type="button" class="numpad-btn" data-digit="3">3</button>
      <button type="button" class="numpad-btn" data-digit="4">4</button>
      <button type="button" class="numpad-btn" data-digit="5">5</button>
      <button type="button" class="numpad-btn" data-digit="6">6</button>
      <button type="button" class="numpad-btn" data-digit="7">7</button>
      <button type="button" class="numpad-btn" data-digit="8">8</button>
      <button type="button" class="numpad-btn" data-digit="9">9</button>
      ${negBtn}
      <button type="button" class="numpad-btn" data-digit="0">0</button>
      <button type="button" class="numpad-btn numpad-backspace" data-action="backspace">⌫</button>
      <button type="button" class="btn btn-primary btn-block" style="grid-column: span 3;" data-action="submit">${submitLabel}</button>
    </div>
  `;
}

export function bindNumpad(containerEl, { onDigit, onBackspace, onClear, onToggleNegative, onSubmit }) {
  if (!containerEl) return () => {};

  const handleClick = (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    e.preventDefault();

    const digit = btn.getAttribute('data-digit');
    const action = btn.getAttribute('data-action');

    if (digit !== null && onDigit) {
      onDigit(digit);
    } else if (action === 'backspace' && onBackspace) {
      onBackspace();
    } else if (action === 'clear' && onClear) {
      onClear();
    } else if (action === 'neg' && onToggleNegative) {
      onToggleNegative();
    } else if (action === 'submit' && onSubmit) {
      onSubmit();
    }
  };

  const handleKeydown = (e) => {
    if (e.key >= '0' && e.key <= '9' && onDigit) {
      e.preventDefault();
      onDigit(e.key);
    } else if (e.key === 'Backspace' && onBackspace) {
      e.preventDefault();
      onBackspace();
    } else if (e.key === 'Enter' && onSubmit) {
      e.preventDefault();
      onSubmit();
    } else if (e.key === 'Escape' && onClear) {
      e.preventDefault();
      onClear();
    }
  };

  containerEl.addEventListener('click', handleClick);
  window.addEventListener('keydown', handleKeydown);

  return () => {
    containerEl.removeEventListener('click', handleClick);
    window.removeEventListener('keydown', handleKeydown);
  };
}
