(() => {
  'use strict';

  // Presentation only. The controller supplies the actual, committed winners.
  const modes = Object.freeze([
    {id: 'wheel', label: '幸运转盘', caption: '转盘减速，指针揭晓幸运归属'},
    {id: 'spotlight', label: '幸运聚焦', caption: '头像快速切换，定格幸运嘉宾'},
    {id: 'matrix', label: '头像矩阵', caption: '光点穿梭名单，点亮中奖头像'},
    {id: 'eggs', label: '砸金蛋', caption: '选择金蛋，敲开本轮惊喜'},
    {id: 'slots', label: '幸运老虎机', caption: '多列滚动，依次停靠幸运人选'},
    {id: 'list', label: '2D 名单', caption: '名单滚动高亮，展示本轮结果'},
    {id: 'sphere', label: '3D 球形', caption: '人员环绕成球，揭晓中奖名单'}
  ].map(Object.freeze));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
  const plain = value => String(value ?? '');
  const identity = person => plain(person?.personId || person?.id);
  const normalPerson = (person, index) => typeof person === 'string'
    ? {id: `person-${index}`, name: person, company: ''}
    : {...person, id: identity(person) || `person-${index}`, name: plain(person?.name || person?.realName || '未命名参与人'), company: plain(person?.company)};
  const normalizePeople = people => (Array.isArray(people) ? people : []).map(normalPerson);
  const normalizeWinners = winners => (Array.isArray(winners) ? winners : []).map(normalPerson);
  const clampQuantity = quantity => Math.min(50, Math.max(1, Number.isInteger(Number(quantity)) ? Number(quantity) : 1));
  const modulo = (value, base) => ((value % base) + base) % base;
  const easeOutCubic = progress => 1 - Math.pow(1 - progress, 3);
  const easeOutQuint = progress => 1 - Math.pow(1 - progress, 5);
  const motion = Object.freeze({wheel: 2600, spotlightFlip: 320, matrix: 1100, eggs: 1150, slots: 1800, slotsStagger: 400, list: 1200, sphere: 1200, reduced: 100});
  let instanceCounter = 0;

  function create(options = {}) {
    const host = options.host;
    if (!host || typeof host.replaceChildren !== 'function') throw new TypeError('MKLotteryEffects.create requires a DOM host.');
    const requestedMode = options.mode === '2d' ? 'list' : options.mode === '3d' ? 'sphere' : options.mode;
    const mode = modes.some(item => item.id === requestedMode) ? requestedMode : 'wheel';
    const instanceID = `lottery-fx-${++instanceCounter}`;
    let config = {
      people: normalizePeople(options.people), history: normalizeWinners(options.history),
      prize: options.prize || {}, quantity: clampQuantity(options.quantity), reducedMotion: Boolean(options.reducedMotion)
    };
    let destroyed = false, phase = 'idle', generation = 0, loopFrame = null, loopPrevious = 0;
    let pendingReveal = null, requestPending = false, selectedEgg = -1, wheelAngle = 0, sphereAngle = 0;
    let visiblePeople = [], wheelGroups = [], slotLanes = [], refs = {};
    let roundWinners = Object.freeze([]), roundPrize = '', resultPage = 1;
    const RESULT_PAGE_SIZE = 10;
    const frameIDs = new Set(), waits = new Map();
    const element = document.createElement('section');
    element.className = `lottery-fx lottery-fx-${mode}`;
    element.dataset.phase = phase;
    element.setAttribute('aria-label', `${modes.find(item => item.id === mode).label}抽奖展示`);
    element.innerHTML = '<div class="lottery-fx-head"></div><div class="lottery-fx-scene"></div><div class="lottery-fx-result" role="status" aria-live="polite"></div><div class="lottery-fx-footer"></div>';
    host.replaceChildren(element);
    refs.head = element.querySelector('.lottery-fx-head');
    refs.scene = element.querySelector('.lottery-fx-scene');
    refs.result = element.querySelector('.lottery-fx-result');
    refs.footer = element.querySelector('.lottery-fx-footer');

    function emit(nextPhase, extra = {}) {
      phase = nextPhase; element.dataset.phase = nextPhase;
      host.dispatchEvent(new CustomEvent('lottery:effect-state', {bubbles: true, detail: {mode, phase: nextPhase, ...extra}}));
    }
    function frame(callback) {
      const id = requestAnimationFrame(time => { frameIDs.delete(id); if (!destroyed) callback(time); });
      frameIDs.add(id); return id;
    }
    function stopLoop() {
      if (loopFrame !== null) { cancelAnimationFrame(loopFrame); frameIDs.delete(loopFrame); loopFrame = null; }
      loopPrevious = 0;
    }
    function wait(milliseconds, token) {
      if (destroyed || token !== generation) return Promise.resolve(false);
      return new Promise(resolve => {
        const id = setTimeout(() => { waits.delete(id); resolve(!destroyed && token === generation); }, milliseconds);
        waits.set(id, resolve);
      });
    }
    function cancelTasks() {
      stopLoop();
      frameIDs.forEach(id => cancelAnimationFrame(id)); frameIDs.clear();
      waits.forEach((resolve, id) => { clearTimeout(id); resolve(false); }); waits.clear();
    }
    function animate(duration, update, token, easing = easeOutCubic) {
      if (destroyed || token !== generation) return Promise.resolve(false);
      if (config.reducedMotion) { update(1); return wait(motion.reduced, token); }
      return new Promise(resolve => {
        let started = null, finished = false, animationFrame = null;
        // A background tab may suspend RAF. Snap to the exact supplied result
        // rather than leaving a committed round or its Promise suspended.
        const cancelID = setTimeout(() => {
          const active = !destroyed && token === generation;
          if (active) update(1);
          finish(active);
        }, duration + 5000);
        waits.set(cancelID, result => finish(result));
        function finish(result) {
          if (finished) return;
          finished = true; clearTimeout(cancelID); waits.delete(cancelID);
          if (animationFrame !== null) { cancelAnimationFrame(animationFrame); frameIDs.delete(animationFrame); }
          resolve(result);
        }
        function next(time) {
          if (finished) return;
          if (destroyed || token !== generation) { finish(false); return; }
          if (started === null) started = time;
          const progress = Math.min(1, (time - started) / duration);
          update(easing(progress));
          if (progress >= 1) finish(true); else animationFrame = frame(next);
        }
        animationFrame = frame(next);
      });
    }
    function loop(update) {
      stopLoop();
      if (config.reducedMotion) return;
      function next(time) {
        if (destroyed || phase !== 'running') return;
        const delta = loopPrevious ? Math.min(64, time - loopPrevious) : 16;
        loopPrevious = time; update(time, delta); loopFrame = frame(next);
      }
      loopFrame = frame(next);
    }
    const isCurrent = token => !destroyed && token === generation;
    const personMatch = (person, candidate) => {
      const personID = identity(person), candidateID = identity(candidate);
      return personID && candidateID ? personID === candidateID : person.name === candidate.name && person.company === candidate.company;
    };
    function avatar(person, size = 80) {
      const label = plain(person.name).slice(0, 2);
      return `<svg class="lottery-fx-avatar" viewBox="0 0 80 80" width="${size}" height="${size}" aria-hidden="true"><circle cx="40" cy="40" r="39" fill="currentColor" opacity=".13"/><circle cx="40" cy="30" r="14" fill="currentColor" opacity=".24"/><path d="M14 70c2-16 12-24 26-24s24 8 26 24" fill="currentColor" opacity=".22"/><text x="40" y="47" text-anchor="middle" fill="currentColor" font-family="system-ui,sans-serif" font-size="23" font-weight="700">${esc(label)}</text></svg>`;
    }
    const personContent = (person, size = 80) => `${avatar(person, size)}<strong class="lottery-fx-name">${esc(person.name)}</strong><span class="lottery-fx-company">${esc(person.company || '现场嘉宾')}</span>`;
    function prizeText() { return [config.prize.level, config.prize.name].filter(Boolean).map(plain).join(' · ') || '本轮幸运奖'; }
    function winnersMarkup(winners) {
      return `<p class="lottery-fx-result-caption">恭喜获得 ${esc(prizeText())}</p><div class="lottery-fx-winners">${winners.map(person => `<div class="lottery-fx-winner">${avatar(person, 40)}<strong>${esc(person.name)}</strong></div>`).join('')}</div>`;
    }
    function clearRoundResults() {
      roundWinners = Object.freeze([]); roundPrize = ''; resultPage = 1;
      element.classList.remove('has-round-results');
      element.dataset.resultLayout = ''; element.dataset.resultCount = '0'; element.dataset.resultPage = '1';
    }
    function renderRoundResults() {
      if (!roundWinners.length || destroyed) return;
      const total = roundWinners.length, paged = total > RESULT_PAGE_SIZE;
      const pages = paged ? Math.ceil(total / RESULT_PAGE_SIZE) : 1;
      resultPage = Math.min(pages, Math.max(1, resultPage));
      const from = paged ? (resultPage - 1) * RESULT_PAGE_SIZE : 0;
      const people = roundWinners.slice(from, paged ? from + RESULT_PAGE_SIZE : total);
      const layout = total <= 5 ? 'hero' : paged ? 'paged' : 'compact';
      element.classList.add('has-round-results');
      element.dataset.resultLayout = layout; element.dataset.resultCount = String(total); element.dataset.resultPage = String(resultPage);
      refs.result.innerHTML = `<div class="lottery-fx-result-heading"><div><span class="lottery-fx-result-kicker">本轮中奖名单</span><h4>恭喜获得 ${esc(roundPrize)}</h4></div><p class="lottery-fx-result-total">共 <strong>${total}</strong> 位幸运嘉宾</p></div><ol class="lottery-fx-winners lottery-fx-winners--${layout}" aria-label="本轮中奖名单${paged ? `，第 ${resultPage} 页` : ''}" start="${from + 1}" style="--fx-result-columns:${Math.min(5, total)}">${people.map((person, index) => `<li class="lottery-fx-winner" data-winner-id="${esc(identity(person))}" data-winner-order="${from + index + 1}"><span class="lottery-fx-winner-index" aria-hidden="true">${String(from + index + 1).padStart(2, '0')}</span>${avatar(person, layout === 'hero' ? 88 : 52)}<div class="lottery-fx-winner-copy"><strong class="lottery-fx-name">${esc(person.name)}</strong><span class="lottery-fx-company">${esc(person.company || '现场嘉宾')}</span></div></li>`).join('')}</ol>${paged ? `<nav class="lottery-fx-result-pagination" aria-label="本轮中奖名单分页" tabindex="-1"><span class="lottery-fx-result-range">展示 ${from + 1}–${from + people.length} / ${total} 人</span><div><button type="button" class="lottery-fx-result-page-button" data-fx-result-page="${resultPage - 1}" data-fx-page-direction="previous" aria-label="上一页中奖名单" ${resultPage === 1 ? 'disabled' : ''}>上一页</button><span class="lottery-fx-result-page-label" aria-live="polite">第 ${resultPage} / ${pages} 页</span><button type="button" class="lottery-fx-result-page-button" data-fx-result-page="${resultPage + 1}" data-fx-page-direction="next" aria-label="下一页中奖名单" ${resultPage === pages ? 'disabled' : ''}>下一页</button></div></nav>` : ''}`;
    }
    function showWinner(person, index, count) {
      refs.result.innerHTML = winnersMarkup([person]);
      if (count > 1) refs.result.insertAdjacentHTML('beforeend', `<p class="lottery-fx-batch-label">第 ${index + 1} / ${count} 位幸运嘉宾</p>`);
      emit('revealing', {winnerId: identity(person), winnerIndex: index, winnerCount: count});
    }
    function setPreview(winners = []) {
      visiblePeople = config.people.slice(0, 80);
      // Keep every committed result visible even when the preview pool is capped.
      winners.slice(0, 80).forEach(winner => {
        if (!visiblePeople.some(person => personMatch(person, winner))) {
          if (visiblePeople.length < 80) visiblePeople.push(winner);
          else {
            const replaceIndex = visiblePeople.findLastIndex(person => !winners.some(candidate => personMatch(person, candidate)));
            if (replaceIndex >= 0) visiblePeople[replaceIndex] = winner;
          }
        }
      });
    }
    function triggerMarkup(label = '开始抽奖') { return `<button type="button" class="lottery-fx-trigger" data-fx-action="toggle">${esc(label)}</button>`; }
    function syncControls() {
      const locked = phase === 'revealing';
      element.querySelectorAll('[data-fx-action="toggle"]').forEach(button => {
        button.disabled = locked || !config.people.length;
        const runningLabel = mode === 'eggs' ? '请选择一枚金蛋' : '停止并揭晓';
        button.textContent = locked ? '正在揭晓…' : phase === 'running' ? runningLabel : '开始抽奖';
        button.setAttribute('aria-label', button.textContent);
        if (mode === 'eggs' && phase === 'running') button.disabled = true;
      });
      element.querySelectorAll('[data-fx-egg]').forEach(button => { button.disabled = phase !== 'running'; });
      const lever = element.querySelector('.lottery-fx-slots-lever');
      if (lever) { lever.classList.toggle('is-pulled', phase === 'running'); lever.setAttribute('aria-label', phase === 'running' ? '拉动拉杆，停止并揭晓' : '拉动拉杆，开始抽奖'); }
    }
    function baseRender() {
      clearRoundResults();
      setPreview();
      element.classList.toggle('is-reduced-motion', config.reducedMotion);
      refs.head.innerHTML = `<span class="lottery-fx-demo">演示模式</span><h3>${esc(modes.find(item => item.id === mode).label)}</h3><p>${esc(prizeText())}</p>`;
      refs.result.innerHTML = '<p class="lottery-fx-ready">准备就绪，等待幸运时刻</p>';
      refs.footer.innerHTML = `<p>画面仅作展示；重复出现的展示项不代表重复中奖${config.people.length > 80 ? '。名单预览最多展示 80 人' : ''}。</p>`;
      if (mode === 'wheel') renderWheel();
      else if (mode === 'spotlight') renderSpotlight();
      else if (mode === 'matrix') renderMatrix();
      else if (mode === 'eggs') renderEggs();
      else if (mode === 'slots') renderSlots();
      else renderPeople();
      if (!config.people.length) refs.result.innerHTML = '<p class="lottery-fx-ready">暂无可抽取人员，请先准备名单</p>';
      syncControls();
    }
    function renderWheel() {
      const grouped = config.people.length > 12, count = grouped ? 12 : Math.max(1, config.people.length);
      wheelGroups = Array.from({length: count}, (_, index) => ({index, people: []}));
      config.people.forEach((person, index) => wheelGroups[index % count].people.push(person));
      const step = 360 / count, toPoint = angle => [200 + 182 * Math.cos(angle * Math.PI / 180), 200 + 182 * Math.sin(angle * Math.PI / 180)];
      const sectors = wheelGroups.map((group, index) => {
        const start = -90 + index * step, end = start + step, a = toPoint(start), b = toPoint(end), middle = start + step / 2;
        const path = count === 1 ? '<circle cx="200" cy="200" r="182" fill="#b91d2b"/>' : `<path d="M200 200 L${a[0]} ${a[1]} A182 182 0 ${step > 180 ? 1 : 0} 1 ${b[0]} ${b[1]} Z" fill="${index % 2 ? '#f4cf79' : '#b91d2b'}" stroke="#e3b35c" stroke-width="2"/>`;
        const x = 200 + 125 * Math.cos(middle * Math.PI / 180), y = 200 + 125 * Math.sin(middle * Math.PI / 180);
        const label = grouped ? `第 ${index + 1} 组` : group.people[0]?.name || '等待名单';
        return `${path}<text x="${x}" y="${y - (grouped ? 4 : 0)}" text-anchor="middle" dominant-baseline="middle" fill="${index % 2 ? '#712222' : '#fff1cf'}" font-size="${count > 8 ? 13 : 16}" font-weight="700" font-family="system-ui,sans-serif" transform="rotate(${middle + 90} ${x} ${y})">${esc(label.length > 7 ? label.slice(0, 6) + '…' : label)}${grouped ? `<tspan x="${x}" dy="18" font-size="11" font-weight="400">${group.people.length} 人</tspan>` : ''}</text>`;
      }).join('');
      refs.scene.innerHTML = `<div class="lottery-fx-wheel-wrap"><div class="lottery-fx-wheel-pointer" aria-hidden="true"></div><svg class="lottery-fx-wheel-disc" viewBox="0 0 400 400" aria-hidden="true" style="transform:rotate(${wheelAngle}deg)"><circle cx="200" cy="200" r="196" fill="#edbd65"/><circle cx="200" cy="200" r="187" fill="#7a1521"/>${sectors}</svg><button type="button" class="lottery-fx-wheel-hub lottery-fx-trigger" data-fx-action="toggle" aria-label="开始抽奖">开始抽奖</button></div><p class="lottery-fx-wheel-note">${grouped ? '按人员抽取，转盘展示所在分组；指向分组后揭晓实际获奖人。' : '按人员抽取，每个扇区展示一位参与人。'}</p>`;
      refs.wheel = element.querySelector('.lottery-fx-wheel-disc');
    }
    function historyMarkup(extra = []) {
      const combined = [...config.history, ...extra].slice(-8).reverse();
      return `<h4>最近中奖</h4>${combined.length ? combined.map(person => `<div class="lottery-fx-history-item">${avatar(person, 36)}<div><strong>${esc(person.name)}</strong><span>${esc(person.level || person.prizeName || '幸运嘉宾')}</span></div></div>`).join('') : '<p class="lottery-fx-history-empty">幸运名单待揭晓</p>'}`;
    }
    function renderSpotlight() {
      const person = visiblePeople[0] || {name: '等待幸运嘉宾', company: ''};
      refs.scene.innerHTML = `<div class="lottery-fx-spotlight-stage"><div class="lottery-fx-spotlight-card">${personContent(person, 160)}</div>${triggerMarkup()}</div><aside class="lottery-fx-history-list" aria-label="最近中奖记录">${historyMarkup()}</aside>`;
      refs.spotlight = element.querySelector('.lottery-fx-spotlight-card'); refs.history = element.querySelector('.lottery-fx-history-list');
    }
    function matrixMarkup() {
      return `<div class="lottery-fx-matrix-grid">${visiblePeople.map(person => `<div class="lottery-fx-matrix-person" data-person-id="${esc(identity(person))}">${avatar(person, 54)}<strong class="lottery-fx-name">${esc(person.name)}</strong></div>`).join('')}</div>${triggerMarkup()}`;
    }
    function renderMatrix() { refs.scene.innerHTML = matrixMarkup(); refs.matrix = [...element.querySelectorAll('.lottery-fx-matrix-person')]; }
    function eggSVG(index) {
      const gradientID = `${instanceID}-gold-${index}`;
      return `<svg viewBox="0 0 120 150" width="120" height="150" aria-hidden="true"><defs><linearGradient id="${gradientID}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff3a8"/><stop offset=".42" stop-color="#efbd45"/><stop offset="1" stop-color="#ad6513"/></linearGradient></defs><path d="M60 7C34 7 12 63 12 94c0 29 20 47 48 47s48-18 48-47C108 63 86 7 60 7Z" fill="url(#${gradientID})" stroke="#f8d77a" stroke-width="2"/><path d="M36 38c-9 14-16 36-16 51" fill="none" stroke="#fff7cb" stroke-width="5" stroke-linecap="round" opacity=".6"/><text x="60" y="103" text-anchor="middle" fill="#8e4c15" font-size="38" font-family="serif" font-weight="700">福</text></svg>`;
    }
    function renderEggs() {
      selectedEgg = -1;
      refs.scene.innerHTML = `<div class="lottery-fx-eggs-grid">${Array.from({length: 4}, (_, index) => `<button type="button" class="lottery-fx-egg" data-fx-egg="${index}" aria-label="选择第 ${index + 1} 枚金蛋" disabled><span class="lottery-fx-egg-shell">${eggSVG(index)}</span><span class="lottery-fx-egg-crack" aria-hidden="true"><svg viewBox="0 0 120 150"><path d="m63 10-9 33 17 13-23 23 20 18-14 42" fill="none" stroke="#68350e" stroke-width="4"/></svg></span><span class="lottery-fx-egg-fragments" aria-hidden="true">${Array.from({length: 6}, (_, piece) => `<i style="--piece-index:${piece}"></i>`).join('')}</span><span class="lottery-fx-egg-prize"></span><span class="lottery-fx-egg-label">第 ${index + 1} 枚</span></button>`).join('')}</div><div class="lottery-fx-hammer" aria-hidden="true"><svg viewBox="0 0 100 120"><path d="m48 35 14 5-25 74-13-5Z" fill="#9c5628" stroke="#f1bb65" stroke-width="2"/><rect x="26" y="9" width="64" height="35" rx="7" transform="rotate(19 58 27)" fill="#e6b451" stroke="#fff0a8" stroke-width="3"/></svg></div>${triggerMarkup()}`;
      refs.eggs = [...element.querySelectorAll('.lottery-fx-egg')]; refs.hammer = element.querySelector('.lottery-fx-hammer');
    }
    const SLOT_HEIGHT = 154;
    function slotItem(person) { return `<div class="lottery-fx-slots-item">${personContent(person, 78)}</div>`; }
    function renderSlots(count = Math.min(5, config.quantity)) {
      const pool = visiblePeople.length ? visiblePeople.slice(0, 16) : [{id: 'empty', name: '等待名单', company: ''}];
      slotLanes = Array.from({length: Math.max(1, count)}, (_, index) => ({base: pool.map((_, offset) => pool[(offset + index * 3) % pool.length]), offset: 0}));
      refs.scene.innerHTML = `<div class="lottery-fx-slots-machine"><div class="lottery-fx-slots-reels" style="--fx-reel-count:${slotLanes.length}">${slotLanes.map((lane, index) => `<div class="lottery-fx-slots-reel" aria-label="第 ${index + 1} 列"><div class="lottery-fx-slots-track" aria-hidden="true">${[...lane.base, ...lane.base].map(slotItem).join('')}</div></div>`).join('')}</div><div class="lottery-fx-slots-frame" aria-hidden="true"></div><button type="button" class="lottery-fx-slots-lever lottery-fx-trigger" data-fx-action="toggle" aria-label="拉动拉杆，开始抽奖">开始抽奖</button></div><p class="lottery-fx-slots-note">各列依次停靠，每列展示一位获奖人；列数与本轮人数一致。</p>`;
      slotLanes.forEach((lane, index) => { lane.track = element.querySelectorAll('.lottery-fx-slots-track')[index]; });
    }
    function renderPeople() {
      refs.scene.innerHTML = `<div class="lottery-fx-people ${mode === 'sphere' ? 'is-sphere' : ''}">${visiblePeople.map((person, index) => `<div class="lottery-fx-person" data-person-id="${esc(identity(person))}" style="--person-index:${index}">${personContent(person, mode === 'sphere' ? 42 : 48)}</div>`).join('')}</div>${triggerMarkup()}`;
      refs.people = element.querySelector('.lottery-fx-people'); refs.personCards = [...element.querySelectorAll('.lottery-fx-person')];
      if (mode === 'sphere') positionSphere();
    }
    function positionSphere(winners = []) {
      const radius = Math.max(110, Math.min(180, host.clientWidth / 3 || 180));
      refs.personCards.forEach((card, index) => {
        const y = 1 - 2 * (index + .5) / Math.max(1, refs.personCards.length), r = Math.sqrt(1 - y * y), angle = index * Math.PI * (3 - Math.sqrt(5));
        let xPos = Math.cos(angle) * r * radius, yPos = y * radius, zPos = Math.sin(angle) * r * radius;
        const winnerIndex = winners.findIndex(person => personMatch(person, visiblePeople[index]));
        if (winnerIndex >= 0) { xPos = (winnerIndex - (winners.length - 1) / 2) * Math.min(100, 420 / winners.length); yPos = 0; zPos = radius + 25; }
        card.style.transform = `translate(-50%,-50%) translate3d(${xPos}px,${yPos}px,${zPos}px)`;
      });
    }
    function randomVisualPerson() { return visiblePeople[Math.floor(Math.random() * visiblePeople.length)] || {name: '等待名单', company: ''}; }
    function activate(cards, count = 1) {
      if (!cards.length) return;
      const selected = new Set();
      while (selected.size < Math.min(count, cards.length)) selected.add(Math.floor(Math.random() * cards.length));
      cards.forEach((card, index) => card.classList.toggle('is-active', selected.has(index)));
    }
    function start() {
      if (destroyed || phase === 'running' || phase === 'revealing' || !config.people.length) return;
      requestPending = false; generation++; cancelTasks();
      // Restore every scene to a usable state after a completed round.
      baseRender(); emit('running'); syncControls();
      refs.result.innerHTML = `<p class="lottery-fx-ready">${mode === 'eggs' ? '选择一枚金蛋，敲开本轮惊喜' : config.reducedMotion ? '抽奖已开始，点击停止揭晓结果' : '幸运正在靠近…'}</p>`;
      if (mode === 'wheel') loop((_time, delta) => { wheelAngle += delta * .15; refs.wheel.style.transform = `rotate(${wheelAngle}deg)`; });
      else if (mode === 'spotlight') { let previous = 0; loop(time => { if (time - previous > 80) { refs.spotlight.innerHTML = personContent(randomVisualPerson(), 160); previous = time; } }); }
      else if (mode === 'matrix') { let previous = 0; loop(time => { if (time - previous > 70) { activate(refs.matrix, Math.min(3, config.quantity)); previous = time; } }); }
      else if (mode === 'slots') loop((_time, delta) => { slotLanes.forEach((lane, index) => { lane.offset = modulo(lane.offset + delta * (.68 + index * .08), lane.base.length * SLOT_HEIGHT); lane.track.style.transform = `translateY(${-lane.offset}px)`; }); });
      else if (mode === 'list' || mode === 'sphere') { let previous = 0; loop((time, delta) => { if (time - previous > 90) { activate(refs.personCards, Math.min(3, config.quantity)); previous = time; } if (mode === 'sphere') { sphereAngle += delta * .025; refs.people.style.transform = `rotateY(${sphereAngle}deg)`; } }); }
      if (config.reducedMotion) {
        if (mode === 'matrix') activate(refs.matrix);
        else if (mode === 'list' || mode === 'sphere') activate(refs.personCards);
      }
    }
    async function revealWheel(winners, token) {
      for (let index = 0; index < winners.length; index++) {
        const winner = winners[index];
        let groupIndex = wheelGroups.findIndex(group => group.people.some(person => personMatch(person, winner)));
        if (groupIndex < 0) { config.people.push(winner); renderWheel(); groupIndex = wheelGroups.findIndex(group => group.people.some(person => personMatch(person, winner))); }
        const desired = -(groupIndex + .5) * 360 / wheelGroups.length;
        const from = wheelAngle, to = from + 360 * 4 + modulo(desired - from, 360);
        if (!await animate(motion.wheel, progress => { wheelAngle = from + (to - from) * progress; refs.wheel.style.transform = `rotate(${wheelAngle}deg)`; }, token)) return;
        showWinner(winner, index, winners.length);
        host.dispatchEvent(new CustomEvent('lottery:effect-state', {bubbles: true, detail: {mode, phase: 'revealing', groupIndex, winnerId: identity(winner)}}));
        if (index < winners.length - 1 && !await wait(config.reducedMotion ? 50 : 450, token)) return;
      }
    }
    async function revealSpotlight(winners, token) {
      for (let index = 0; index < winners.length; index++) {
        if (!config.reducedMotion) {
          for (const delay of [65, 75, 90, 110, 140, 180, 220]) { refs.spotlight.innerHTML = personContent(randomVisualPerson(), 160); if (!await wait(delay, token)) return; }
          refs.spotlight.classList.add('is-flipping'); if (!await wait(motion.spotlightFlip / 2, token)) return;
        }
        refs.spotlight.innerHTML = personContent(winners[index], 160);
        if (!await wait(config.reducedMotion ? motion.reduced : motion.spotlightFlip / 2, token)) return;
        refs.spotlight.classList.remove('is-flipping');
        showWinner(winners[index], index, winners.length); refs.history.innerHTML = historyMarkup(winners.slice(0, index + 1));
        if (index < winners.length - 1 && !await wait(config.reducedMotion ? 50 : 400, token)) return;
      }
    }
    async function revealMatrix(winners, token) {
      const existingIDs = new Set(visiblePeople.map(identity)); setPreview(winners);
      if (visiblePeople.some(person => !existingIDs.has(identity(person)))) renderMatrix();
      if (!config.reducedMotion) {
        for (const delay of [65, 85, 115, 155, 210, 270, 200]) { activate(refs.matrix, Math.min(3, winners.length)); if (!await wait(delay, token)) return; }
      } else if (!await wait(motion.reduced, token)) return;
      refs.matrix.forEach((card, index) => { const won = winners.some(person => personMatch(person, visiblePeople[index])); card.classList.remove('is-active'); card.classList.toggle('is-winner', won); card.classList.toggle('is-dimmed', !won); });
    }
    function selectEgg(index) {
      selectedEgg = Math.min(refs.eggs.length - 1, Math.max(0, index));
      refs.eggs.forEach((egg, eggIndex) => egg.classList.toggle('is-selected', eggIndex === selectedEgg));
      const eggRect = refs.eggs[selectedEgg].getBoundingClientRect(), sceneRect = refs.scene.getBoundingClientRect();
      refs.hammer.style.left = `${eggRect.left - sceneRect.left + eggRect.width * .45}px`;
      refs.hammer.style.top = `${Math.max(0, eggRect.top - sceneRect.top - 32)}px`;
    }
    async function revealEggs(winners, token) {
      selectEgg(selectedEgg < 0 ? 2 : selectedEgg);
      const egg = refs.eggs[selectedEgg];
      egg.querySelector('.lottery-fx-egg-prize').innerHTML = winners.map(person => `${avatar(person, 48)}<strong>${esc(person.name)}</strong>`).join('');
      if (!config.reducedMotion) {
        refs.hammer.classList.add('is-striking'); if (!await wait(260, token)) return;
        egg.classList.add('is-shaking'); if (!await wait(240, token)) return;
        egg.classList.add('is-cracked'); if (!await wait(250, token)) return;
      }
      egg.classList.add('is-open'); egg.classList.remove('is-shaking');
      if (!await wait(config.reducedMotion ? motion.reduced : 400, token)) return;
      refs.hammer.classList.remove('is-striking');
    }
    async function revealSlots(winners, token) {
      for (let batchIndex = 0; batchIndex < Math.ceil(winners.length / 5); batchIndex++) {
        const batch = winners.slice(batchIndex * 5, batchIndex * 5 + 5);
        if (slotLanes.length !== batch.length || batchIndex > 0) renderSlots(batch.length);
        const settled = await Promise.all(batch.map(async (winner, index) => {
          const lane = slotLanes[index], first = Math.floor(lane.offset / SLOT_HEIGHT), from = modulo(lane.offset, SLOT_HEIGHT), turns = 18 + index * 3;
          const sequence = Array.from({length: turns}, (_, sequenceIndex) => lane.base[(first + sequenceIndex) % lane.base.length]);
          sequence.push(winner); lane.track.innerHTML = sequence.map(slotItem).join('');
          lane.track.style.transform = `translateY(${-from}px)`;
          const target = turns * SLOT_HEIGHT;
          const completed = await animate(motion.slots + index * motion.slotsStagger, progress => { lane.track.style.transform = `translateY(${-(from + (target - from) * progress)}px)`; }, token, easeOutQuint);
          if (completed) lane.track.closest('.lottery-fx-slots-reel').classList.add('is-winner');
          return completed;
        }));
        if (!settled.every(Boolean) || !isCurrent(token)) return;
        refs.result.innerHTML = winnersMarkup(winners.slice(0, (batchIndex + 1) * 5));
        emit('revealing', {batchIndex, batchCount: Math.ceil(winners.length / 5)});
        if (batchIndex < Math.ceil(winners.length / 5) - 1 && !await wait(config.reducedMotion ? 50 : 500, token)) return;
      }
    }
    async function revealPeople(winners, token) {
      setPreview(winners); renderPeople();
      if (!config.reducedMotion) {
        let previous = -1;
        const from = sphereAngle, to = Math.ceil(sphereAngle / 360) * 360 + 360;
        if (!await animate(motion[mode], progress => {
          const step = Math.floor(progress * 12);
          if (step !== previous) { activate(refs.personCards, Math.min(3, winners.length)); previous = step; }
          if (mode === 'sphere') { sphereAngle = from + (to - from) * progress; refs.people.style.transform = `rotateY(${sphereAngle}deg)`; }
        }, token)) return;
      } else if (!await wait(motion.reduced, token)) return;
      refs.personCards.forEach((card, index) => { const won = winners.some(person => personMatch(person, visiblePeople[index])); card.classList.remove('is-active'); card.classList.toggle('is-winner', won); card.classList.toggle('is-dimmed', !won); });
      if (mode === 'sphere') { refs.people.style.transform = 'rotateY(0deg)'; sphereAngle = 0; positionSphere(winners.slice(0, 5)); }
    }
    function reveal(inputWinners) {
      if (destroyed) return Promise.resolve();
      if (pendingReveal) return pendingReveal.promise;
      const winners = normalizeWinners(inputWinners);
      if (!winners.length) { stopLoop(); emit('idle'); syncControls(); return Promise.resolve(); }
      // This is a presentation snapshot of the controller's committed order.
      // Paging never calls the draw callbacks, mutates the pool, or resamples.
      roundWinners = Object.freeze(winners.map(person => Object.freeze({...person}))); roundPrize = prizeText(); resultPage = 1;
      stopLoop(); requestPending = false; const token = ++generation;
      emit('revealing', {winnerCount: winners.length}); syncControls();
      let resolvePromise;
      const promise = new Promise(resolve => { resolvePromise = resolve; });
      const pending = {promise, resolve: resolvePromise}; pendingReveal = pending;
      (async () => {
        try {
          if (mode === 'wheel') await revealWheel(winners, token);
          else if (mode === 'spotlight') await revealSpotlight(winners, token);
          else if (mode === 'matrix') await revealMatrix(winners, token);
          else if (mode === 'eggs') await revealEggs(winners, token);
          else if (mode === 'slots') await revealSlots(winners, token);
          else await revealPeople(winners, token);
          if (isCurrent(token)) { renderRoundResults(); emit('complete', {winnerCount: winners.length, winnerIds: winners.map(identity)}); syncControls(); }
        } catch (error) {
          if (isCurrent(token)) { renderRoundResults(); emit('complete', {winnerCount: winners.length, presentationFallback: true}); syncControls(); }
          if (globalThis.console) console.error('Lottery presentation fallback:', error);
        } finally { if (pendingReveal === pending) pendingReveal = null; pending.resolve(); }
      })();
      return promise;
    }
    function reset(next = {}) {
      if (destroyed) return;
      generation++; cancelTasks(); requestPending = false;
      if (pendingReveal) { pendingReveal.resolve(); pendingReveal = null; }
      config = {
        ...config,
        ...(Object.prototype.hasOwnProperty.call(next, 'people') ? {people: normalizePeople(next.people)} : {}),
        ...(Object.prototype.hasOwnProperty.call(next, 'history') ? {history: normalizeWinners(next.history)} : {}),
        ...(Object.prototype.hasOwnProperty.call(next, 'prize') ? {prize: next.prize || {}} : {}),
        ...(Object.prototype.hasOwnProperty.call(next, 'quantity') ? {quantity: clampQuantity(next.quantity)} : {}),
        ...(Object.prototype.hasOwnProperty.call(next, 'reducedMotion') ? {reducedMotion: Boolean(next.reducedMotion)} : {})
      };
      emit('idle'); baseRender();
    }
    function request(action) {
      if (destroyed || requestPending || phase === 'revealing') return;
      const callback = action === 'start' ? options.onRequestStart : options.onRequestStop;
      if (typeof callback !== 'function') { if (action === 'start') start(); return; }
      requestPending = true;
      try { Promise.resolve(callback()).catch(() => {}).finally(() => { requestPending = false; }); }
      catch (_) { requestPending = false; }
    }
    element.addEventListener('click', event => {
      const pageButton = event.target.closest('[data-fx-result-page]');
      if (pageButton) {
        event.preventDefault(); event.stopPropagation();
        if (phase !== 'complete' || pageButton.disabled || !roundWinners.length) return;
        const page = Number(pageButton.dataset.fxResultPage), pages = Math.ceil(roundWinners.length / RESULT_PAGE_SIZE);
        if (!Number.isInteger(page) || page < 1 || page > pages) return;
        const direction = pageButton.dataset.fxPageDirection;
        resultPage = page; renderRoundResults();
        const nextFocus = refs.result.querySelector(`[data-fx-page-direction="${direction}"]`);
        if (nextFocus && !nextFocus.disabled) nextFocus.focus?.({preventScroll: true});
        else refs.result.querySelector('.lottery-fx-result-pagination')?.focus?.({preventScroll: true});
        host.dispatchEvent(new CustomEvent('lottery:effect-state', {bubbles: true, detail: {mode, phase, reason: 'result-page', resultPage, pageCount: pages, winnerCount: roundWinners.length}}));
        return;
      }
      const egg = event.target.closest('[data-fx-egg]');
      if (egg && phase === 'running' && !requestPending) { selectEgg(Number(egg.dataset.fxEgg)); request('stop'); return; }
      const trigger = event.target.closest('[data-fx-action="toggle"]');
      if (trigger && !trigger.disabled) request(phase === 'running' ? 'stop' : 'start');
    });
    element.addEventListener('keydown', event => {
      // Native buttons still handle Enter/Space. Prevent the parent controller's
      // global Space shortcut from starting a new draw while the user pages.
      if (event.target.closest('.lottery-fx-result') && (event.code === 'Space' || event.key === 'Enter')) event.stopPropagation();
    });
    function destroy() {
      if (destroyed) return;
      destroyed = true; generation++; cancelTasks(); requestPending = false;
      if (pendingReveal) { pendingReveal.resolve(); pendingReveal = null; }
      emit('destroyed'); element.remove(); refs = {}; slotLanes = []; visiblePeople = [];
    }
    baseRender(); emit('idle');
    return Object.freeze({start, reveal, reset, destroy});
  }

  window.MKLotteryEffects = Object.freeze({modes, create, motion});
})();
