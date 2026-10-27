(() => {
  if (!document.body.classList.contains('mk-scheme-d')) return;

  const entry = document.getElementById('mkAllOpen');
  const menu = document.getElementById('mkAllDialog');
  const categories = document.getElementById('mkPrimary');
  const replay = document.getElementById('mkNavGuideReplay');
  if (!entry || !menu || !categories || !replay || document.getElementById('mkMenuGuide')) return;

  const storageKey = 'mk-menu-guide-v1';
  const guide = document.createElement('div');
  guide.id = 'mkMenuGuide';
  guide.className = 'mk-menu-guide';
  guide.hidden = true;
  guide.setAttribute('role', 'dialog');
  guide.setAttribute('aria-labelledby', 'mkMenuGuideTitle');
  guide.setAttribute('aria-describedby', 'mkMenuGuideDescription');
  guide.innerHTML = `
    <div class="mk-menu-guide-card">
      <div class="mk-menu-guide-kicker">新版菜单指引 <span id="mkMenuGuideProgress">1 / 2</span></div>
      <button class="mk-menu-guide-close" type="button" aria-label="关闭菜单指引">×</button>
      <div aria-live="polite" aria-atomic="true">
        <h2 id="mkMenuGuideTitle"></h2>
        <p id="mkMenuGuideDescription"></p>
      </div>
      <div class="mk-menu-guide-actions">
        <button class="mk-menu-guide-dismiss" type="button">知道了</button>
        <button class="mk-menu-guide-primary" type="button">展开菜单</button>
      </div>
    </div>`;
  document.body.append(guide);
  replay.hidden = false;

  const title = guide.querySelector('#mkMenuGuideTitle');
  const description = guide.querySelector('#mkMenuGuideDescription');
  const progress = guide.querySelector('#mkMenuGuideProgress');
  const primary = guide.querySelector('.mk-menu-guide-primary');
  const dismiss = guide.querySelector('.mk-menu-guide-dismiss');
  let step = 0;
  let returnFocus = entry;
  let autoCancelled = false;
  let scheduledFrame = 0;

  function wasSeen() {
    try { if (localStorage.getItem(storageKey)) return true; } catch {}
    try { return Boolean(sessionStorage.getItem(storageKey)); } catch { return false; }
  }

  function remember(status) {
    try { localStorage.setItem(storageKey, status); } catch {}
    try { sessionStorage.setItem(storageKey, status); } catch {}
  }

  function clearHighlights() {
    entry.classList.remove('mk-menu-guide-target');
    categories.classList.remove('mk-menu-guide-target');
    menu.classList.remove('mk-menu-guide-show-stars');
  }

  function finish(status = 'dismissed', restoreFocus = true) {
    if (!step) return;
    const insideMenu = step === 2 && menu.open;
    step = 0;
    guide.hidden = true;
    clearHighlights();
    remember(status);
    if (restoreFocus) {
      const target = insideMenu ? document.getElementById('mkAllSearch') : returnFocus;
      if (target?.isConnected && !target.hidden) target.focus({ preventScroll: true });
    }
  }

  function position() {
    if (!step || guide.hidden) return;
    const viewport = window.visualViewport;
    const width = viewport?.width || window.innerWidth;
    const height = viewport?.height || window.innerHeight;
    const offsetLeft = viewport?.offsetLeft || 0;
    const offsetTop = viewport?.offsetTop || 0;
    const anchor = (step === 1 ? entry : menu).getBoundingClientRect();
    guide.style.width = `${Math.min(320, width - 24, step === 2 ? anchor.width - 32 : width - 24)}px`;
    guide.querySelector('.mk-menu-guide-card').style.maxHeight = `${Math.max(80, Math.min(height - 24, step === 2 ? anchor.height - 32 : height - 24))}px`;
    const size = guide.getBoundingClientRect();
    const minLeft = offsetLeft + 12;
    const minTop = offsetTop + 12;
    const maxLeft = Math.max(minLeft, offsetLeft + width - size.width - 12);
    const maxTop = Math.max(minTop, offsetTop + height - size.height - 12);
    let left = step === 1 ? anchor.left : anchor.right - size.width - 20;
    let top = step === 1 ? anchor.bottom + 14 : anchor.bottom - size.height - 20;
    left = Math.max(minLeft, Math.min(left, maxLeft));
    top = Math.max(minTop, Math.min(top, maxTop));
    guide.style.left = `${Math.round(left)}px`;
    guide.style.top = `${Math.round(top)}px`;
    guide.style.setProperty('--mk-guide-arrow-left', `${Math.max(22, Math.min(anchor.left + anchor.width / 2 - left, size.width - 24))}px`);
  }

  function schedulePosition() {
    if (!step || scheduledFrame) return;
    scheduledFrame = requestAnimationFrame(() => { scheduledFrame = 0; position(); });
  }

  function show(nextStep) {
    clearHighlights();
    step = nextStep;
    const inMenu = step === 2;
    (inMenu ? menu : document.body).append(guide);
    guide.classList.toggle('mk-menu-guide-in-menu', inMenu);
    title.textContent = inMenu ? '按业务模块查找功能' : '功能入口在这里';
    description.textContent = inMenu
      ? '左侧切换业务模块，右侧直接进入功能。常用功能可点击星标收藏，下次从「我的收藏」快速打开。'
      : '活动、内容、线索等功能，都可以从这里进入。';
    progress.textContent = inMenu ? '2 / 2' : '1 / 2';
    primary.textContent = inMenu ? '开始使用' : '展开菜单';
    dismiss.hidden = inMenu;
    guide.hidden = false;
    (inMenu ? categories : entry).classList.add('mk-menu-guide-target');
    menu.classList.toggle('mk-menu-guide-show-stars', inMenu);
    position();
    // Opening the existing modal keeps its original focus on the menu search.
    if (!inMenu) primary.focus({ preventScroll: true });
  }

  function hasBlockingSurface() {
    return Boolean(document.querySelector('dialog[open], #leadDrawer[aria-hidden="false"], #leadHistoryDrawer[aria-hidden="false"], #actionDrawer[aria-hidden="false"], #batchPrecheck[aria-hidden="false"], #weightRuleModal[aria-hidden="false"], #publishWeightModal[aria-hidden="false"]'));
  }

  function start() {
    autoCancelled = true;
    if (hasBlockingSurface()) return;
    returnFocus = document.activeElement instanceof HTMLElement && document.activeElement !== document.body
      ? document.activeElement : entry;
    show(1);
  }

  replay.addEventListener('click', start);
  guide.querySelector('.mk-menu-guide-close').addEventListener('click', () => finish());
  dismiss.addEventListener('click', () => finish());
  primary.addEventListener('click', () => {
    if (step === 1) {
      entry.focus({ preventScroll: true });
      entry.click();
    }
    else finish('completed');
  });

  // Reuse the existing handler rather than replacing menu state or navigation.
  entry.addEventListener('click', () => {
    if (step && menu.open) show(2);
  });
  menu.addEventListener('close', () => {
    if (menu.open) return;
    if (step === 2) {
      finish('dismissed', false);
      if (!document.querySelector('dialog[open]')) entry.focus({ preventScroll: true });
    }
  });
  menu.addEventListener('click', event => {
    const destination = event.target.closest('[data-mk-destination]');
    if (step === 2 && destination && destination.getAttribute('aria-disabled') !== 'true') finish('completed', false);
  }, true);

  document.addEventListener('pointerdown', () => { autoCancelled = true; }, { once: true, capture: true });
  document.addEventListener('keydown', event => {
    autoCancelled = true;
    if (step && (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      finish('dismissed', false);
      return;
    }
    if (!step || event.key !== 'Escape') return;
    if (document.querySelector('dialog[open]:not(#mkAllDialog)')) {
      finish('dismissed', false);
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const closeMenu = step === 2 && menu.open;
    finish('dismissed', !closeMenu);
    if (closeMenu) {
      if (window.mkAllMenuMotion) window.mkAllMenuMotion.close();
      else {
        menu.close();
        entry.focus({ preventScroll: true });
      }
    }
  }, true);
  document.addEventListener('click', event => {
    if (step !== 1 || guide.contains(event.target) || entry.contains(event.target) || replay.contains(event.target)) return;
    // A user starting another task has priority over the introductory hint.
    if (event.target.closest('a, button, input, select, textarea, summary')) finish('dismissed', false);
  }, true);
  const onRouteChange = () => { autoCancelled = true; finish('dismissed', false); };
  window.addEventListener('hashchange', onRouteChange);
  window.addEventListener('popstate', onRouteChange);
  window.addEventListener('resize', schedulePosition);
  window.addEventListener('scroll', schedulePosition, true);
  window.visualViewport?.addEventListener('resize', schedulePosition);
  window.visualViewport?.addEventListener('scroll', schedulePosition);

  const params = new URLSearchParams(location.search);
  setTimeout(() => {
    const home = !location.hash || location.hash === '#dashboard';
    if (autoCancelled || wasSeen() || !home || params.has('menu') || params.has('lotteryDemo') || hasBlockingSurface()) return;
    start();
  }, 700);
})();
