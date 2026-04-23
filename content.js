(() => {
  if (window.__sheetPlusMinusLoaded) return;
  window.__sheetPlusMinusLoaded = true;

  const BTN_SIZE = 14;
  const GAP = 2;
  let lastPointer = { x: 0, y: 0 };
  let insideSheet = false;

  const style = document.createElement('style');
  style.textContent = `
    .spm-btn {
      position: fixed;
      width: ${BTN_SIZE}px;
      height: ${BTN_SIZE}px;
      line-height: ${BTN_SIZE}px;
      font-size: 11px;
      font-family: system-ui, sans-serif;
      border-radius: 3px;
      border: 1px solid rgba(0,0,0,.2);
      background: rgba(255,255,255,.96);
      text-align: center;
      cursor: pointer;
      user-select: none;
      z-index: 2147483647;
      box-shadow: 0 1px 2px rgba(0,0,0,.12);
      opacity: 0;
      pointer-events: none;
      transition: opacity 80ms linear;
    }
    .spm-btn.spm-show { opacity: 1; pointer-events: auto; }
    .spm-plus { color: #0b8043; }
    .spm-minus { color: #b31412; }
  `;
  document.documentElement.appendChild(style);

  const plus = document.createElement('div');
  plus.className = 'spm-btn spm-plus';
  plus.textContent = '+';
  const minus = document.createElement('div');
  minus.className = 'spm-btn spm-minus';
  minus.textContent = '−';
  document.body.append(plus, minus);

  function getFormulaInput() {
    return (
      document.querySelector('#t-formula-bar-input') ||
      document.querySelector('textarea[aria-label="Formula bar"]') ||
      document.querySelector('textarea.docs-sheet-active-input')
    );
  }

  function parseNumeric(text) {
    if (!text) return null;
    const cleaned = text.replace(/,/g, '').trim();
    if (!cleaned || cleaned === '-') return null;
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : null;
  }

  function setNativeValue(el, value) {
    const setter = Object.getOwnPropertyDescriptor(el.constructor.prototype, 'value')?.set;
    if (setter) {
      setter.call(el, value);
    } else {
      el.value = value;
    }
  }

  function canAdjust() {
    const formula = getFormulaInput();
    if (!formula) return false;
    return parseNumeric(formula.value) !== null;
  }

  function positionButtons() {
    const margin = 8;
    const x = Math.max(margin, Math.min(lastPointer.x, window.innerWidth - BTN_SIZE * 2 - GAP - margin));
    const y = Math.max(margin, Math.min(lastPointer.y - BTN_SIZE - GAP, window.innerHeight - BTN_SIZE - margin));

    plus.style.left = `${x}px`;
    plus.style.top = `${y}px`;
    minus.style.left = `${x + BTN_SIZE + GAP}px`;
    minus.style.top = `${y}px`;
  }

  function showButtons() {
    if (!insideSheet || !canAdjust()) {
      hideButtons();
      return;
    }
    positionButtons();
    plus.classList.add('spm-show');
    minus.classList.add('spm-show');
  }

  function hideButtons() {
    plus.classList.remove('spm-show');
    minus.classList.remove('spm-show');
  }

  function adjust(delta) {
    const formula = getFormulaInput();
    if (!formula) return;

    const base = parseNumeric(formula.value);
    if (base === null) return;

    formula.focus();
    setNativeValue(formula, String(base + delta));
    formula.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: String(base + delta) }));
    formula.dispatchEvent(new Event('change', { bubbles: true }));
    formula.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
    formula.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', bubbles: true }));

    hideButtons();
  }

  function stop(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  plus.addEventListener('mousedown', stop, true);
  minus.addEventListener('mousedown', stop, true);
  plus.addEventListener('click', (e) => {
    stop(e);
    adjust(1);
  }, true);
  minus.addEventListener('click', (e) => {
    stop(e);
    adjust(-1);
  }, true);

  document.addEventListener('mousemove', (e) => {
    lastPointer = { x: e.clientX, y: e.clientY };

    const target = e.target instanceof Element ? e.target : null;
    insideSheet = !!target?.closest('#waffle-grid-container, .grid-container, #waffle-grid, [aria-label="Spreadsheet"]');

    showButtons();
  }, true);

  document.addEventListener('scroll', () => {
    if (plus.classList.contains('spm-show')) positionButtons();
  }, true);

  document.addEventListener('selectionchange', showButtons, true);
  window.addEventListener('blur', hideButtons);
})();
