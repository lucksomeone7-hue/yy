(() => {
  if (!document.body.classList.contains('mk-scheme-d')) return;
  const menu = document.getElementById('mkAllDialog');
  const entry = document.getElementById('mkAllOpen');
  if (!menu || !entry) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let closeTimer = 0;
  let opener = entry;
  let phase = menu.open ? 'open' : 'closed';
  entry.setAttribute('aria-controls', menu.id);
  entry.setAttribute('aria-expanded', String(menu.open));

  function clearTransition() {
    clearTimeout(closeTimer);
    closeTimer = 0;
    menu.classList.remove('mk-menu-entering', 'mk-menu-leaving');
    menu.style.pointerEvents = '';
  }

  function setPhase(value) {
    phase = value;
    menu.dataset.menuMotion = value;
  }

  function finishClose() {
    clearTransition();
    setPhase('closed');
    if (menu.open) menu.close();
  }

  function open() {
    const wasClosing = phase === 'closing';
    if (menu.open && !wasClosing) return;
    clearTransition();
    if (!menu.open) {
      opener = document.activeElement instanceof HTMLElement && document.activeElement !== document.body
        ? document.activeElement : entry;
      menu.showModal();
    }
    entry.setAttribute('aria-expanded', 'true');
    setPhase(reducedMotion.matches ? 'open' : 'opening');
    if (!reducedMotion.matches) menu.classList.add('mk-menu-entering');
  }

  function close() {
    if (!menu.open) { clearTransition(); setPhase('closed'); return; }
    if (phase === 'closing') return;
    clearTransition();
    if (reducedMotion.matches) { finishClose(); return; }
    setPhase('closing');
    menu.classList.add('mk-menu-leaving');
    menu.style.pointerEvents = 'none';
    // Complete even if styles are unavailable or an animation is interrupted.
    closeTimer = setTimeout(finishClose, 220);
  }

  menu.addEventListener('animationend', event => {
    if (event.target !== menu || event.pseudoElement) return;
    if (event.animationName === 'mk-menu-surface-out' && phase === 'closing') finishClose();
    else if (event.animationName === 'mk-menu-surface-in' && phase === 'opening') {
      menu.classList.remove('mk-menu-entering');
      setPhase('open');
    }
  });
  menu.addEventListener('cancel', event => { event.preventDefault(); close(); });
  menu.addEventListener('close', () => {
    // Native close events are queued; an intervening reopen owns the new state.
    if (menu.open) return;
    clearTransition();
    setPhase('closed');
    entry.setAttribute('aria-expanded', 'false');
    // A search dialog may be above this menu; keep its focus intact.
    if (!document.querySelector('dialog[open]') && opener?.isConnected) opener.focus({ preventScroll: true });
  });
  reducedMotion.addEventListener('change', () => {
    if (!reducedMotion.matches) return;
    if (phase === 'closing') finishClose();
    else { clearTransition(); if (menu.open) setPhase('open'); }
  });

  window.mkAllMenuMotion = { open, close };
  setPhase(phase);
})();
