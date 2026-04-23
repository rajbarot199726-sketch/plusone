(() => {
  if (window.__sheetPlusMinusLoaded) return;
  window.__sheetPlusMinusLoaded = true;

  const BTN_SIZE = 14;
  const OFFSET = 1;
  let activeCell = null;
  let hideTimer = null;

  const style = document.createElement('style');
  style.textContent = `
    .spm-btn {
      position: absolute;
      width: ${BTN_SIZE}px;
      height: ${BTN_SIZE}px;
      line-height: ${BTN_SIZE}px;
      font-size: 11px;
      font-family: system-ui, sans-serif;
      border-radius: 3px;
      border: 1px solid rgba(0, 0, 0, 0.2);
      background: rgba(255, 255, 255, 0.95);
      color: #222;
      text-align: center;
      cursor: pointer;
      user-select: none;
      z-index: 2147483647;
      box-shadow: 0 1px 2px rgba(0,0,0,.12);
      opacity: 0;
      pointer-events: none;
      transition: opacity 80ms linear;
    }
    .spm-btn.spm-show {
      opacity: 1;
      pointer-events: auto;
    }
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

  function parseNumeric(text) {
    if (!text) return null;
    const cleaned = text.replace(/,/g, '').trim();
    if (!cleaned || cleaned === '-') return null;
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : null;
  }

  function getCellFromTarget(target) {
    if (!(target instanceof Element)) return null;
    const cell = target.closest('[role="gridcell"]');
    if (!cell || !document.body.contains(cell)) return null;
    return cell;
  }

  function positionButtons(cell) {
    const r = cell.getBoundingClientRect();
    if (r.width < 20 || r.height < 16) {
      hideButtons();
      return;
    }

    plus.style.left = `${Math.round(r.left + window.scrollX + OFFSET)}px`;
    plus.style.top = `${Math.round(r.top + window.scrollY + OFFSET)}px`;
    minus.style.left = `${Math.round(r.right + window.scrollX - BTN_SIZE - OFFSET)}px`;
    minus.style.top = `${Math.round(r.top + window.scrollY + OFFSET)}px`;

    plus.classList.add('spm-show');
    minus.classList.add('spm-show');
  }

  function hideButtons() {
    plus.classList.remove('spm-show');
    minus.classList.remove('spm-show');
    activeCell = null;
  }

  function writeToCell(cell, value) {
    cell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    cell.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    cell.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const formula =
      document.querySelector('#t-formula-bar-input') ||
      document.querySelector('textarea[aria-label="Formula bar"]') ||
      document.querySelector('textarea.docs-sheet-active-input');

    if (formula) {
      formula.focus();
      formula.value = String(value);
      formula.dispatchEvent(new Event('input', { bubbles: true }));
      formula.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
      formula.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', bubbles: true }));
    } else {
      cell.textContent = String(value);
    }
  }

  function adjust(delta) {
    if (!activeCell) return;
    const base = parseNumeric(activeCell.textContent);
    if (base === null) return;
    writeToCell(activeCell, base + delta);
    hideButtons();
  }

  plus.addEventListener('mousedown', (e) => e.stopPropagation());
  minus.addEventListener('mousedown', (e) => e.stopPropagation());
  plus.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    adjust(1);
  });
  minus.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    adjust(-1);
  });

  document.addEventListener(
    'mousemove',
    (e) => {
      const cell = getCellFromTarget(e.target);
      if (!cell) {
        if (!plus.matches(':hover') && !minus.matches(':hover')) {
          clearTimeout(hideTimer);
          hideTimer = setTimeout(hideButtons, 50);
        }
        return;
      }
      clearTimeout(hideTimer);
      activeCell = cell;
      positionButtons(cell);
    },
    true
  );

  document.addEventListener('scroll', () => {
    if (activeCell) positionButtons(activeCell);
  }, true);

  window.addEventListener('blur', hideButtons);
})();
