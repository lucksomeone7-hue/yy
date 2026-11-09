(() => {
  'use strict';
  const root = document.getElementById('activityLotteryRoot');
  if (!root) return;

  const STORAGE_KEY = 'mk-activity-lottery-v1';
  const PAGE_SIZE = 10;
  const MAX_BATCH_SIZE = 50;
  const roundQuantity = prize => prize?.lastQuantity || 1;
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character]));
  const uid = prefix => `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`}`;
  const giftIcon = '<svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 21h32v19H8zM5 13h38v8H5zM24 13v27"/><path d="M24 13c-9 0-13-2-13-6 0-3 4-5 7-2l6 8Zm0 0c9 0 13-2 13-6 0-3-4-5-7-2l-6 8Z"/></svg>';
  const peopleIcon = '<svg viewBox="0 0 40 40" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="15" cy="13" r="5"/><path d="M5 33v-4c0-6 4-9 10-9s10 3 10 9v4M27 8a5 5 0 0 1 0 10m3 6c4 1 5 4 5 8"/></svg>';
  const clockIcon = '<svg viewBox="0 0 40 40" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="20" cy="20" r="14"/><path d="M20 11v10l7 4"/></svg>';
  const samplePeople = () => [
    ['林知夏', '示例 · 澄光科技', '138****2046'], ['周予安', '示例 · 云屿设计', '139****5182'],
    ['陈星禾', '示例 · 木禾咨询', '137****6093'], ['许清越', '示例 · 远山数字', '136****8371'],
    ['沈书言', '示例 · 星桥科技', '135****4826'], ['顾晚晴', '示例 · 青岚传媒', '158****1608'],
    ['陆景初', '示例 · 晨序服务', '159****7235'], ['苏念川', '示例 · 白鹭创意', '188****3914']
  ].concat(Array.from({length: 56}, (_, index) => [
    ['林','周','陈','许','沈','顾','陆','苏'][index % 8] + ['星宁','知远','思齐','予辰','景行','清和','若安'][Math.floor(index / 8)],
    ['示例 · 澄光科技','示例 · 云屿设计','示例 · 木禾咨询','示例 · 远山数字'][index % 4],
    `139****${String(8000 + index)}`
  ])).map(([name, company, phone], index) => ({id: `sample-person-${index + 1}`, name, company, phone}));
  const makeExample = () => ({
    id: 'screen-annual-demo', name: '年度盛典抽奖', createdAt: '2026-10-22T08:00:00.000Z',
    people: samplePeople(), winners: [],
    prizes: [
      {id: 'prize-first', level: '一等奖', name: '蓝牙耳机', total: 1},
      {id: 'prize-second', level: '二等奖', name: '定制礼盒', total: 5},
      {id: 'prize-third', level: '三等奖', name: '随行杯', total: 10}
    ]
  });
  const textValid = (value, max = 120) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
  const phoneValid = value => typeof value === 'string' && /^(?:1\d{10}|1\d{2}\*{4}\d{4})?$/.test(value);
  function validateStored(data) {
    if (!data || data.version !== 1 || !Array.isArray(data.screens) || data.screens.length > 100) return false;
    const screenIDs = new Set();
    return data.screens.every(screen => {
      if (!screen || !textValid(screen.id) || screenIDs.has(screen.id) || !textValid(screen.name, 80) || !Number.isFinite(Date.parse(screen.createdAt))) return false;
      screenIDs.add(screen.id);
      if (screen.groups !== undefined && (!Array.isArray(screen.groups) || screen.groups.length > 100 || !screen.groups.every(group => textValid(group,40)))) return false;
      if (!Array.isArray(screen.people) || screen.people.length > 10000 || !Array.isArray(screen.prizes) || screen.prizes.length > 100 || !Array.isArray(screen.winners)) return false;
      const peopleIDs = new Set(), prizeIDs = new Set(), winnerIDs = new Set(), roundPeople = new Set();
      if (!screen.people.every(person => {
        if (!person || !textValid(person.id) || peopleIDs.has(person.id) || !textValid(person.name, 60) || typeof person.company !== 'string' || person.company.length > 120 || !phoneValid(person.phone)) return false;
        if (['checked','surveyed','allowed'].some(key => person[key] !== undefined && typeof person[key] !== 'boolean')) return false;
        if (['nickname','source','group'].some(key => person[key] !== undefined && (typeof person[key] !== 'string' || person[key].length > 120))) return false;
        peopleIDs.add(person.id); return true;
      })) return false;
      if (!screen.prizes.every(prize => {
        if (!prize || !textValid(prize.id) || prizeIDs.has(prize.id) || !textValid(prize.name, 80) || !textValid(prize.level, 20) || !Number.isSafeInteger(prize.total) || prize.total < 1 || prize.total > 10000 || (prize.batchSize !== undefined && (!Number.isInteger(prize.batchSize) || prize.batchSize < 1 || prize.batchSize > Math.min(MAX_BATCH_SIZE, prize.total)))) return false;
        if (prize.scope !== undefined && !['all','checked','surveyed','group'].includes(prize.scope) || prize.allowRepeat !== undefined && typeof prize.allowRepeat !== 'boolean') return false;
        if (prize.scope === 'group' && !textValid(prize.group,40)) return false;
        if (prize.lastQuantity !== undefined && (!Number.isInteger(prize.lastQuantity) || prize.lastQuantity < 1 || prize.lastQuantity > MAX_BATCH_SIZE)) return false;
        if (prize.winnerScope !== undefined && !['random','designated'].includes(prize.winnerScope)) return false;
        if (prize.designatedIds !== undefined && (!Array.isArray(prize.designatedIds) || !prize.designatedIds.every(id => peopleIDs.has(id)))) return false;
        prizeIDs.add(prize.id); return true;
      })) return false;
      if (!screen.winners.every(winner => {
        if (!winner || !textValid(winner.id) || winnerIDs.has(winner.id) || !peopleIDs.has(winner.personId) || !prizeIDs.has(winner.prizeId) || !textValid(winner.name, 60) || typeof winner.company !== 'string' || winner.company.length > 120 || !phoneValid(winner.phone) || !textValid(winner.prizeName, 80) || !textValid(winner.level, 20) || !Number.isFinite(Date.parse(winner.drawnAt))) return false;
        const roundKey = `${winner.roundId || winner.id}:${winner.personId}`;
        if (roundPeople.has(roundKey)) return false;
        winnerIDs.add(winner.id); roundPeople.add(roundKey); return true;
      })) return false;
      return screen.prizes.every(prize => screen.winners.filter(winner => winner.prizeId === prize.id).length <= prize.total);
    });
  }
  let storageWarning = '';
  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (validateStored(parsed)) {
          parsed.screens.forEach(screen => screen.prizes.forEach(prize => {
            if (prize.scope === 'group') {
              prize.designatedIds = screen.people.filter(person => person.group === prize.group).map(person => person.id);
              prize.scope = 'all'; prize.winnerScope = 'designated';
              storageWarning = '历史指定分组范围已转为对应内定人员名单，请核对奖项配置。';
            }
            delete prize.group; delete prize.batchSize;
          }));
          return parsed;
        }
        storageWarning = '本地保存的数据格式异常，已恢复示例数据。';
      }
    } catch (_) { storageWarning = '暂时无法读取本地记录。本次操作仍可使用，刷新后可能无法保留。'; }
    return {version: 1, screens: [makeExample()]};
  }
  let state = loadState();
  let selectedScreenId = state.screens[0]?.id || null;
  let view = 'list';
  let tab = 'prizes';
  let poolQuery = '', winnerQuery = '', winnerPrize = '', poolPage = 1, winnerPage = 1;
  let busy = false, drawSession = null, launchDraft = null;
  const DRAW_MODES = [
    {id: 'wheel', label: '幸运转盘', caption: '旋转减速 · 精准定位', max: 1, glyph: '<circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16m-13.7-5.7 11.4 11.4M6.3 17.7 17.7 6.3"/>'},
    {id: 'spotlight', label: '单人滚动', caption: '头像快切 · 聚焦揭晓', max: 1, glyph: '<rect x="5" y="3" width="14" height="18" rx="3"/><circle cx="12" cy="9" r="3"/><path d="M8 18v-1a4 4 0 0 1 8 0v1"/>'},
    {id: 'matrix', label: '头像矩阵', caption: '全员头像 · 随机锁定', max: 50, glyph: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'},
    {id: 'eggs', label: '砸金蛋', caption: '点击金蛋 · 锤击揭晓', max: 1, glyph: '<path d="M19 15c0 4-3 6-7 6s-7-2-7-6S8 3 12 3s7 8 7 12Z"/><path d="m12 8-2 4 4 2-2 4"/>'},
    {id: 'slots', label: '幸运老虎机', caption: '滚轮加速 · 依次停靠', max: 3, glyph: '<rect x="2" y="5" width="17" height="15" rx="2"/><path d="M7 8v9m6-9v9m6-5h3V6"/><circle cx="22" cy="4" r="1"/>'},
    {id: 'list', label: '名单滚动', caption: '简洁卡片 · 批量揭晓', max: 50, glyph: '<path d="M8 6h13M8 12h13M8 18h13M3 6h1M3 12h1M3 18h1"/>'},
    {id: 'sphere', label: '3D 球形', caption: '空间旋转 · 星光聚合', max: 50, glyph: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18m-16-5h14M5 17h14"/>'}
  ];
  const drawMode = id => DRAW_MODES.find(mode => mode.id === id) || DRAW_MODES[0];
  const stageThemes = () => window.MKLotteryThemes?.items || [{id: 'festival', label: '红金盛典'}, {id: 'midnight', label: '深蓝星光'}];
  const stageTheme = id => stageThemes().find(theme => theme.id === id) || stageThemes()[0];
  function presentationFor(screen) {
    const saved = screen.presentation || {};
    return {mode: drawMode(saved.mode).id, theme: stageTheme(saved.theme).id, reducedMotion: typeof saved.reducedMotion === 'boolean' ? saved.reducedMotion : Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)};
  }

  root.innerHTML = '<div class="lottery-workspace"><div class="lottery-view"></div><p class="lottery-notice" role="status" aria-live="polite" hidden></p><div class="lottery-dialogs"></div></div>';
  const viewRoot = root.querySelector('.lottery-view');
  const dialogs = root.querySelector('.lottery-dialogs');
  function currentScreen() { return state.screens.find(screen => screen.id === selectedScreenId); }
  function notify(message, warning = false) {
    const target = root.querySelector('.lottery-notice');
    target.textContent = message; target.hidden = false; target.classList.toggle('is-warning', warning);
  }
  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; }
    catch (_) { notify('操作已在本次页面生效，但本地保存失败；刷新页面可能丢失本次修改。', true); return false; }
  }
  function saveAndRender(message) { const saved = persist(); render(); if (saved && message) notify(message); }
  const wonFor = (screen, prizeId) => screen.winners.filter(winner => winner.prizeId === prizeId).length;
  const scopeLabels = {all: '全部人员', checked: '已签到人员', surveyed: '已填写问卷人员'};
  function eligiblePeople(screen, prize) {
    if (!prize) {
      const ids = new Set(screen.prizes.filter(item => item.total > wonFor(screen, item.id)).flatMap(item => eligiblePeople(screen, item).map(person => person.id)));
      return screen.people.filter(person => ids.has(person.id));
    }
    const won = new Set(screen.winners.map(winner => winner.personId));
    return screen.people.filter(person => person.allowed !== false && (prize.allowRepeat || !won.has(person.id)) &&
      (prize.scope !== 'checked' || person.checked === true) && (prize.scope !== 'surveyed' || person.surveyed === true) &&
      (prize.winnerScope !== 'designated' || (prize.designatedIds || []).includes(person.id)));
  }
  const groupsFor = screen => [...new Set([...(screen.groups || []), ...screen.people.map(person => person.group).filter(Boolean)])];
  let poolFilter = '', selectedPeople = new Set();
  const totalSlots = screen => screen.prizes.reduce((total, prize) => total + prize.total, 0);
  const remainingSlots = screen => totalSlots(screen) - screen.winners.length;
  const maskPhone = phone => /^1\d{10}$/.test(phone) ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : phone || '—';
  const dateLabel = value => new Intl.DateTimeFormat('zh-CN', {year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Shanghai'}).format(new Date(value));
  const timeLabel = value => new Intl.DateTimeFormat('zh-CN', {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Shanghai'}).format(new Date(value));
  const btn = (action, label, extra = '') => `<button type="button" class="lottery-btn" data-lottery-action="${action}" ${extra}>${label}</button>`;

  function renderList() {
    return `${document.body.classList.contains('mk-scheme-c') ? '' : '<div class="lottery-toolbar"><button type="button" class="lottery-btn is-primary" data-lottery-action="new-screen">＋ 新建大屏</button></div>'}<div class="lottery-section-head"><h3>全部大屏 <span class="lottery-muted">${state.screens.length}</span></h3><p class="lottery-muted">选择大屏，继续配置或开始抽奖</p></div>
      ${state.screens.length ? `<div class="lottery-screen-list">${state.screens.map(screen => `<article class="lottery-screen-card"><div class="lottery-prize-icon">${giftIcon}</div><div class="lottery-screen-card-copy"><h3>${escapeHTML(screen.name)}</h3><p class="lottery-screen-meta">创建于 ${escapeHTML(dateLabel(screen.createdAt))} · ${screen.prizes.length} 个奖项 · ${screen.people.length} 位参与人</p><p class="lottery-muted">已抽 ${screen.winners.length} 人次 / 总名额 ${totalSlots(screen)} 人</p></div><div class="lottery-card-actions"><button type="button" class="lottery-btn is-primary" data-lottery-action="open-screen" data-id="${escapeHTML(screen.id)}">管理大屏</button>${btn('edit-screen', '编辑名称', `data-id="${escapeHTML(screen.id)}"`)}${btn('delete-screen', '删除', `data-id="${escapeHTML(screen.id)}"`)}</div></article>`).join('')}</div>` : `<div class="lottery-empty"><div class="lottery-empty-icon">${giftIcon}</div><h3>创建第一个抽奖大屏</h3><p>设置奖项、同步参与名单，即可开始现场抽奖。</p><button type="button" class="lottery-btn is-primary" data-lottery-action="new-screen">新建大屏</button></div>`}`;
  }

  function renderStats(screen) {
    const eligible = eligiblePeople(screen).length;
    return `<div class="lottery-stats" aria-label="抽奖概况"><div class="lottery-stat"><span>参与人数</span><strong>${screen.people.length}<small> 人</small></strong><small>${eligible} 人当前可抽</small></div><div class="lottery-stat"><span>奖项数量</span><strong>${screen.prizes.length}<small> 项</small></strong><small>共 ${totalSlots(screen)} 个中奖名额</small></div><div class="lottery-stat"><span>中奖人次</span><strong>${screen.winners.length}<small> 人</small></strong><small>重复中奖按奖项规则控制</small></div><div class="lottery-stat"><span>剩余名额</span><strong>${remainingSlots(screen)}<small> 个</small></strong><small>${!screen.prizes.length ? '添加奖项后生成名额' : !remainingSlots(screen) ? '全部奖项已抽完' : eligible < remainingSlots(screen) ? `还需补充 ${remainingSlots(screen) - eligible} 位可抽人员` : '可继续抽取'}</small></div></div>`;
  }
  function renderDetail(screen) {
    const noDraw = !screen.prizes.length || !eligiblePeople(screen).length || !remainingSlots(screen);
    return `<div class="lottery-detail-header"><div class="lottery-detail-copy"><button type="button" class="lottery-btn is-quiet lottery-back" data-lottery-action="screen-list">← 全部大屏</button><div class="lottery-title-line"><h2>${escapeHTML(screen.name)}</h2><span class="lottery-status">${screen.winners.length ? remainingSlots(screen) ? '抽奖进行中' : '抽奖已完成' : '准备中'}</span></div></div><div class="lottery-actions"><button type="button" class="lottery-btn is-primary" data-lottery-action="open-draw" ${noDraw ? 'disabled title="请先设置奖项并准备可抽取的参与名单"' : ''}>${!screen.prizes.length ? '请先添加奖项' : !remainingSlots(screen) && screen.winners.length ? '全部奖项已抽完' : !screen.people.length ? '请先同步名单' : !eligiblePeople(screen).length ? '暂无可抽人员' : '选择形式并进入大屏'} <span aria-hidden="true">↗</span></button></div></div>${renderStats(screen)}
      <div class="lottery-tabs" role="tablist" aria-label="抽奖管理">${[['prizes', '奖项设置', screen.prizes.length], ['pool', '抽奖池名单', screen.people.length], ['winners', '中奖记录', screen.winners.length]].map(([key, label, count]) => `<button type="button" id="lottery-tab-${key}" role="tab" aria-selected="${tab === key}" aria-controls="lottery-panel-${key}" tabindex="${tab === key ? 0 : -1}" class="${tab === key ? 'is-active' : ''}" data-lottery-tab="${key}">${label}<span>${count}</span></button>`).join('')}</div>
      <section class="lottery-section" id="lottery-panel-${tab}" role="tabpanel" aria-labelledby="lottery-tab-${tab}" tabindex="0">${tab === 'prizes' ? renderPrizes(screen) : tab === 'pool' ? renderPool(screen) : renderWinners(screen)}</section>`;
  }
  function renderPrizes(screen) {
    const eligible = eligiblePeople(screen).length;
    return `<div class="lottery-section-head"><div><h3>奖项设置</h3><p class="lottery-muted">总名额控制奖品数量，每轮人数控制抽奖节奏；进入舞台前可调整本轮人数。</p></div><button type="button" class="lottery-btn" data-lottery-action="add-prize">＋ 添加奖项</button></div>${screen.prizes.every(prize => !prize.allowRepeat) && eligible < remainingSlots(screen) ? `<p class="lottery-inline-warning"><span aria-hidden="true">ⓘ</span> 当前可抽人数 ${eligible} 人，少于剩余名额 ${remainingSlots(screen)} 个。可前往<button type="button" class="lottery-link" data-lottery-tab="pool">抽奖池名单</button>同步更多参与人。</p>` : ''}
      <div class="lottery-prize-grid">${screen.prizes.map((prize, index) => {
        const won = wonFor(screen, prize.id), left = prize.total - won;
        return `<article class="lottery-prize-card" data-prize-index="${index % 3}"><div class="lottery-prize-card-top"><span class="lottery-prize-badge">${escapeHTML(prize.level)}</span><div class="lottery-prize-icon">${giftIcon}</div></div><h3>${escapeHTML(prize.name)}</h3><p class="lottery-prize-name">${left ? won ? '抽奖进行中' : '待抽奖' : '本奖项已抽完'}</p><div class="lottery-prize-counts"><div><strong>${prize.total}</strong><span>总名额</span></div><div><strong>${won}</strong><span>已抽出</span></div><div><strong>${left}</strong><span>剩余</span></div></div><p class="lottery-rule-summary">${scopeLabels[prize.scope || 'all']} · ${prize.winnerScope === 'designated' ? '内定人员' : '随机抽取'} · ${prize.allowRepeat ? '允许重复中奖' : '不允许重复中奖'} · ${eligiblePeople(screen, prize).length} 人可抽</p><div class="lottery-progress" role="progressbar" aria-label="${escapeHTML(prize.level)}抽取进度" aria-valuemin="0" aria-valuemax="${prize.total}" aria-valuenow="${won}"><span style="width:${Math.min(100, won / prize.total * 100)}%"></span></div><div class="lottery-card-actions">${btn('edit-prize', '编辑奖项', `data-id="${escapeHTML(prize.id)}"`)}<button type="button" class="lottery-btn is-quiet" data-lottery-action="delete-prize" data-id="${escapeHTML(prize.id)}" ${won ? 'disabled title="已有中奖记录的奖项不可删除"' : ''}>删除</button></div></article>`;
      }).join('')}</div>${screen.prizes.length ? '' : '<div class="lottery-empty"><div class="lottery-empty-icon">' + giftIcon + '</div><h3>尚未设置奖项</h3><p>点击右上角“添加奖项”，设置奖品、中奖名额和每轮人数。</p></div>'}`;
  }
  function searchPeople(items, query) {
    const needle = query.toLocaleLowerCase();
    return needle ? items.filter(item => `${item.name} ${item.nickname || ''} ${item.company} ${item.phone}`.toLocaleLowerCase().includes(needle)) : items;
  }
  function pagination(page, total, kind) {
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    return `<div class="lottery-pagination" tabindex="-1"><span>共 ${total} 条 · 每页 ${PAGE_SIZE} 条</span><div><button type="button" class="lottery-btn is-small" aria-label="上一页" data-lottery-action="${kind}-page" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}>上一页</button><span aria-live="polite">${page} / ${pages}</span><button type="button" class="lottery-btn is-small" aria-label="下一页" data-lottery-action="${kind}-page" data-page="${page + 1}" ${page >= pages ? 'disabled' : ''}>下一页</button></div></div>`;
  }
  function poolRows(screen) {
    return searchPeople(screen.people, poolQuery).filter(person => !poolFilter ||
      poolFilter === 'checked' && person.checked || poolFilter === 'unchecked' && !person.checked ||
      poolFilter === 'allowed' && person.allowed !== false || poolFilter === 'blocked' && person.allowed === false ||
      poolFilter === 'surveyed' && person.surveyed || poolFilter === `group:${person.group}`);
  }
  function renderSelection() {
    const count = root.querySelector('[data-pool-selected-count]');
    if (count) count.textContent = `已选择 ${selectedPeople.size} 人`;
    const exportButton = root.querySelector('[data-lottery-action=export-pool]');
    if (exportButton) exportButton.textContent = selectedPeople.size ? '导出已选人员' : '导出筛选名单';
    const inputs = [...root.querySelectorAll('[data-pool-select]')], all = root.querySelector('[data-pool-select-all]');
    if (all) { all.checked = inputs.length > 0 && inputs.every(input => input.checked); all.indeterminate = inputs.some(input => input.checked) && !all.checked; }
    root.querySelectorAll('[data-pool-batch]').forEach(button => { button.disabled = !selectedPeople.size; });
  }
  function renderPool(screen) {
    const rows = poolRows(screen);
    poolPage = Math.min(poolPage, Math.max(1, Math.ceil(rows.length / PAGE_SIZE)));
    const visible = rows.slice((poolPage - 1) * PAGE_SIZE, poolPage * PAGE_SIZE);
    const options = [['', '全部人员'], ['checked', '已签到'], ['unchecked', '未签到'], ['allowed', '允许抽奖'], ['blocked', '禁止抽奖'], ['surveyed', '已填写问卷'], ...groupsFor(screen).map(group => [`group:${group}`, group])];
    return `<div class="lottery-section-head"><div><h3>抽奖池名单</h3><p class="lottery-muted">统一管理签到、分组与抽奖资格；实际可抽人员按各奖项规则筛选。</p></div><div class="lottery-actions">${btn('manage-groups', '分组管理')}${btn('add-person', '添加用户')}<button type="button" class="lottery-btn is-primary" data-lottery-action="sync-people">同步名单</button>${btn('export-pool', selectedPeople.size ? '导出已选人员' : '导出筛选名单')}</div></div>
      <form class="lottery-filters" data-lottery-form="pool-search"><label class="lottery-field"><span>筛选</span><select name="poolFilter">${options.map(([key,label]) => `<option value="${escapeHTML(key)}" ${poolFilter === key ? 'selected' : ''}>${escapeHTML(label)}</option>`).join('')}</select></label><label class="lottery-field"><span>用户名</span><input type="search" name="query" value="${escapeHTML(poolQuery)}" placeholder="姓名、微信昵称、公司或手机号"></label><button class="lottery-btn" type="submit">搜索</button>${btn('reset-pool','重置')}<span class="lottery-filter-summary">筛选 ${rows.length} / ${screen.people.length} 人</span></form>
      <div class="lottery-pool-batch"><span data-pool-selected-count>已选择 ${selectedPeople.size} 人</span>${[['set-checked','设为已签到'],['set-unchecked','设为未签到'],['block-people','禁止抽奖'],['allow-people','允许抽奖'],['assign-group','设置分组']].map(([action,label]) => `<button type="button" class="lottery-btn" data-lottery-action="${action}" data-pool-batch ${selectedPeople.size ? '' : 'disabled'}>${label}</button>`).join('')}</div>
      <div class="lottery-table-wrap"><table class="lottery-table lottery-pool-table"><thead><tr><th><input type="checkbox" data-pool-select-all aria-label="选择当前页人员" ${visible.length && visible.every(person => selectedPeople.has(person.id)) ? 'checked' : ''}></th><th>操作</th><th>真实姓名 / 公司</th><th>微信昵称</th><th>来源</th><th>分组</th><th>签到 / 问卷</th><th>允许抽奖</th><th>手机号码</th><th>进入时间</th></tr></thead><tbody>${visible.map(person => `<tr><td><input type="checkbox" data-pool-select value="${escapeHTML(person.id)}" aria-label="选择${escapeHTML(person.name)}" ${selectedPeople.has(person.id) ? 'checked' : ''}></td><td>${btn('edit-person','编辑',`data-id="${escapeHTML(person.id)}"`)}</td><td><strong>${escapeHTML(person.name)}</strong><small>${escapeHTML(person.company || '—')}</small></td><td>${escapeHTML(person.nickname || '—')}</td><td>${escapeHTML(person.source || '内置示例')}</td><td>${escapeHTML(person.group || '未分组')}</td><td>${person.checked ? '已签到' : '未签到'}<small>${person.surveyed ? '已填写问卷' : '未填写问卷'}</small></td><td><span class="lottery-row-status ${person.allowed === false ? 'is-blocked' : ''}">${person.allowed === false ? '禁止' : '允许'}</span></td><td>${escapeHTML(maskPhone(person.phone))}</td><td>${person.joinedAt ? escapeHTML(timeLabel(person.joinedAt)) : '—'}</td></tr>`).join('') || '<tr><td colspan="10" class="lottery-pool-empty">暂无匹配人员，可调整筛选、添加用户或同步名单。</td></tr>'}</tbody></table></div>${pagination(poolPage, rows.length, 'pool')}`;
  }
  function personEditor(id) {
    const screen = currentScreen(), person = screen.people.find(item => item.id === id);
    openDialog(person ? '编辑用户' : '添加用户', `<div class="lottery-form"><input type="hidden" name="id" value="${escapeHTML(person?.id || '')}">${[['name','真实姓名',60],['nickname','微信昵称',60],['company','公司',120],['phone','手机号',20]].map(([name,label,max]) => `<label>${label}<input name="${name}" maxlength="${max}" ${name === 'name' ? 'required' : ''} value="${escapeHTML(person?.[name] || '')}"></label>`).join('')}<label>分组<select name="group"><option value="">未分组</option>${groupsFor(screen).map(group => `<option ${person?.group === group ? 'selected' : ''}>${escapeHTML(group)}</option>`).join('')}</select></label><div class="lottery-person-flags">${[['checked','已签到'],['surveyed','已填写问卷'],['allowed','允许抽奖']].map(([key,label]) => `<label><input type="checkbox" name="${key}" ${(key === 'allowed' ? person?.allowed !== false : person?.[key]) ? 'checked' : ''}>${label}</label>`).join('')}</div></div>`, `${cancelButton}${submitButton('保存')}`, {form:'person-editor'});
  }
  function syncPeopleDialog() {
    const cells = [...document.querySelectorAll('[data-activity-panel="attendees"] .activity-simple-table > span')];
    const people = [];
    for (let index = 0; index + 4 < cells.length; index += 5) {
      if (cells[index + 2].textContent.trim() !== '已通过') continue;
      people.push({id:`attendee-${index / 5}`, name:cells[index].textContent.trim(), company:cells[index + 1].textContent.trim(), phone:'', checked:cells[index + 3].textContent.trim() === '已签到'});
    }
    openDialog('同步活动参会名单', `<div class="lottery-form"><p>来源：当前活动「用友数智营销峰会」已通过报名的参会人员。</p><p class="lottery-muted">当前原型可同步 ${people.length} 位示例参会人员。已存在人员按来源标识或姓名与公司匹配，仅更新签到状态；已有分组、抽奖资格和中奖记录保留。</p><label>同步范围<select name="syncScope"><option value="all">全部已通过报名人员</option><option value="checked">仅已签到人员</option></select></label></div>`, `${cancelButton}${submitButton('确认同步')}`, {form:'sync-people'});
    const form = dialogs.querySelector('[data-lottery-form="sync-people"]');
    if (form) form.dataset.people = JSON.stringify(people);
  }
  function handleRosterAction(event) {
    const button = event.target.closest('[data-lottery-action]');
    if (!button || button.disabled) return false;
    const screen = currentScreen(), action = button.dataset.lotteryAction;
    if (!screen) return false;
    if (action === 'add-person' || action === 'edit-person') { personEditor(button.dataset.id); return true; }
    if (action === 'manage-groups') {
      openDialog('分组管理', `<div class="lottery-form"><label>分组名称，每行一个<textarea name="groups" rows="6" placeholder="例如：嘉宾组">${escapeHTML(groupsFor(screen).join('\n'))}</textarea></label><p class="lottery-muted">分组用于名单管理；删除分组后，组内人员变为未分组。</p></div>`, `${cancelButton}${submitButton('保存分组')}`, {form:'pool-groups'}); return true;
    }
    if (action === 'assign-group') {
      openDialog('设置人员分组', `<div class="lottery-form"><p>将为 ${selectedPeople.size} 位已选人员设置分组。</p><label>分组<select name="group"><option value="">未分组</option>${groupsFor(screen).map(group => `<option>${escapeHTML(group)}</option>`).join('')}</select></label></div>`, `${cancelButton}${submitButton('确认')}`, {form:'assign-group'}); return true;
    }
    const changes = {'set-checked':{checked:true}, 'set-unchecked':{checked:false}, 'block-people':{allowed:false}, 'allow-people':{allowed:true}};
    if (changes[action]) {
      if (!selectedPeople.size) return true;
      screen.people.filter(person => selectedPeople.has(person.id)).forEach(person => Object.assign(person,changes[action]));
      saveAndRender(`已更新 ${selectedPeople.size} 位人员。`); return true;
    }
    if (action === 'export-pool') {
      const people = poolRows(screen).filter(person => !selectedPeople.size || selectedPeople.has(person.id));
      if (!people.length) { notify('当前没有可导出的人员。',true); return true; }
      downloadCSV('抽奖池名单.csv', [['真实姓名','微信昵称','公司','来源','分组','签到状态','问卷状态','允许抽奖','手机号','进入时间'], ...people.map(person => [person.name,person.nickname || '',person.company,person.source || '内置示例',person.group || '',person.checked ? '已签到' : '未签到',person.surveyed ? '已填写' : '未填写',person.allowed === false ? '否' : '是',maskPhone(person.phone),person.joinedAt ? timeLabel(person.joinedAt) : ''])]); return true;
    }
    return false;
  }
  function submitRosterForm(form, data, kind) {
    if (!['person-editor','pool-groups','assign-group','sync-people'].includes(kind)) return false;
    const screen = currentScreen();
    let message = '名单设置已保存。';
    if (kind === 'person-editor') {
      const id = String(data.get('id') || ''), name = String(data.get('name') || '').trim(), phone = String(data.get('phone') || '').trim();
      if (!textValid(name,60) || !phoneValid(phone)) { formError(form,'请填写姓名和有效手机号，手机号可留空。'); return true; }
      const values = {name,phone,nickname:String(data.get('nickname') || '').trim(),company:String(data.get('company') || '').trim(),group:String(data.get('group') || ''),checked:data.has('checked'),surveyed:data.has('surveyed'),allowed:data.has('allowed')};
      if (screen.people.some(person => person.id !== id && personKey(person) === personKey(values))) { formError(form,'该人员已存在，请编辑已有记录。'); return true; }
      const person = screen.people.find(item => item.id === id);
      if (person) Object.assign(person,values);
      else { if (screen.people.length >= 10000) { formError(form,'每个大屏最多 10,000 人。'); return true; } screen.people.push({id:uid('person'),...values,source:'手动添加',joinedAt:new Date().toISOString()}); }
    } else if (kind === 'pool-groups') {
      const groups = [...new Set(String(data.get('groups') || '').split('\n').map(value => value.trim()).filter(Boolean))];
      if (groups.length > 100 || groups.some(group => group.length > 40)) { formError(form,'最多 100 个分组，每个名称最多 40 字。'); return true; }
      screen.groups = groups; screen.people.forEach(person => { if (!groups.includes(person.group)) person.group = ''; });
    } else if (kind === 'assign-group') {
      screen.people.filter(person => selectedPeople.has(person.id)).forEach(person => { person.group = String(data.get('group') || ''); });
    } else {
      const people = JSON.parse(form.dataset.people).filter(person => data.get('syncScope') !== 'checked' || person.checked);
      const additions = people.filter(person => !screen.people.some(item => item.attendeeId === person.id || personKey(item) === personKey(person)));
      if (screen.people.length + additions.length > 10000) { formError(form,'同步后将超过 10,000 人。'); return true; }
      message = `同步完成：新增 ${additions.length} 人，更新 ${people.length - additions.length} 人。`;
      people.forEach(person => {
        const existing = screen.people.find(item => item.attendeeId === person.id || personKey(item) === personKey(person));
        if (existing) { existing.checked = person.checked; existing.attendeeId = person.id; }
        else screen.people.push({...person,id:uid('person'),attendeeId:person.id,source:'活动参会人',allowed:true,joinedAt:new Date().toISOString()});
      });
    }
    form.dataset.committed = 'true'; selectedPeople.clear(); form.closest('dialog').close(); saveAndRender(message); return true;
  }
  function renderWinners(screen) {
    const filtered = searchPeople(screen.winners.filter(winner => !winnerPrize || winner.prizeId === winnerPrize), winnerQuery).slice().reverse();
    winnerPage = Math.min(winnerPage, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
    return `<div class="lottery-section-head"><div><h3>中奖记录</h3><p class="lottery-muted">抽奖结果自动保存，可按奖项筛选并导出当前结果。</p></div><button type="button" class="lottery-btn" data-lottery-action="export-winners" ${filtered.length ? '' : 'disabled'}>导出记录${filtered.length ? `（${filtered.length}）` : ''}</button></div>
      <form class="lottery-filters" data-lottery-form="winner-search"><label class="lottery-field"><span>奖项</span><select name="prize" aria-label="按奖项筛选"><option value="">全部奖项</option>${screen.prizes.map(prize => `<option value="${escapeHTML(prize.id)}" ${winnerPrize === prize.id ? 'selected' : ''}>${escapeHTML(prize.level)} · ${escapeHTML(prize.name)}</option>`).join('')}</select></label><label class="lottery-field"><span>关键词</span><input type="search" name="query" value="${escapeHTML(winnerQuery)}" maxlength="120" placeholder="搜索姓名、公司或手机号" aria-label="搜索中奖记录"></label><button class="lottery-btn is-primary" type="submit">搜索</button><button class="lottery-btn is-quiet" type="button" data-lottery-action="reset-winners">重置</button><span class="lottery-filter-summary">${winnerPrize || winnerQuery ? `筛选 ${filtered.length} / ${screen.winners.length} 条` : `共 ${screen.winners.length} 条记录`}</span></form>
      ${filtered.length ? `<div class="lottery-table-wrap"><table class="lottery-table"><thead><tr><th scope="col">获奖人</th><th scope="col">奖项 / 奖品</th><th scope="col">公司</th><th scope="col">手机号</th><th scope="col">抽奖时间</th></tr></thead><tbody>${filtered.slice((winnerPage - 1) * PAGE_SIZE, winnerPage * PAGE_SIZE).map(winner => `<tr><td><span class="lottery-person-avatar" aria-hidden="true">${escapeHTML(winner.name.slice(0, 1))}</span><strong>${escapeHTML(winner.name)}</strong></td><td><span class="lottery-prize-badge">${escapeHTML(winner.level)}</span> ${escapeHTML(winner.prizeName)}</td><td>${escapeHTML(winner.company || '—')}</td><td class="lottery-numeric">${escapeHTML(maskPhone(winner.phone))}</td><td class="lottery-numeric">${escapeHTML(timeLabel(winner.drawnAt))}</td></tr>`).join('')}</tbody></table></div>${pagination(winnerPage, filtered.length, 'winner')}` : `<div class="lottery-empty"><div class="lottery-empty-icon">${clockIcon}</div><h3>${screen.winners.length ? '没有匹配的中奖记录' : '幸运时刻，等待开启'}</h3><p>${screen.winners.length ? '调整奖项或关键词，查看其他中奖记录。' : '完成奖项和名单设置后，在抽奖大屏开始抽奖，结果将自动出现在这里。'}</p><div class="lottery-empty-actions">${screen.winners.length ? btn('reset-winners', '重置筛选') : `<button type="button" class="lottery-btn is-primary" data-lottery-action="open-draw" ${!screen.prizes.length || !eligiblePeople(screen).length || !remainingSlots(screen) ? 'disabled' : ''}>开始抽奖</button><button type="button" class="lottery-btn" data-lottery-tab="prizes">前往奖项设置</button>`}</div></div>`}`;
  }
  function render() {
    const screen = currentScreen();
    if (!screen) view = 'list';
    const createButton = document.getElementById('activityLotteryCreate');
    if (createButton) createButton.hidden = view !== 'list';
    viewRoot.innerHTML = view === 'list' ? renderList() : renderDetail(screen);
  }
  function resetFilters() { poolFilter = ''; selectedPeople.clear(); poolQuery = ''; winnerQuery = ''; winnerPrize = ''; poolPage = 1; winnerPage = 1; }
  function switchTab(next) { if (!['prizes', 'pool', 'winners'].includes(next)) return; tab = next; render(); root.querySelector(`#lottery-tab-${next}`)?.focus(); }

  function restoreFocus(opener, fallback) {
    if (opener?.isConnected) { opener.focus(); return; }
    let target;
    if (fallback) target = root.querySelector(`${fallback}:not(:disabled)`);
    (target || root.querySelector(`[data-lottery-tab="${tab}"]`) || document.getElementById('activityLotteryCreate') || root.querySelector('[data-lottery-action="new-screen"]'))?.focus();
  }
  function openDialog(title, content, footer, options = {}) {
    if (dialogs.querySelector('dialog[open]')) return null;
    const opener = document.activeElement;
    const dialog = document.createElement('dialog');
    dialog.className = `lottery-dialog ${options.className || ''}`;
    dialog.setAttribute('aria-labelledby', 'lottery-dialog-title');
    dialog.innerHTML = `<form class="lottery-modal-form" data-lottery-form="${options.form || 'dialog'}"><div class="lottery-dialog-head"><div><h2 id="lottery-dialog-title">${escapeHTML(title)}</h2>${options.description ? `<p class="lottery-muted">${escapeHTML(options.description)}</p>` : ''}</div><button type="button" class="lottery-close" data-lottery-action="close-dialog" aria-label="关闭弹窗">×</button></div>${content}<p class="lottery-form-error" role="alert" hidden></p>${footer ? `<div class="lottery-dialog-footer">${footer}</div>` : ''}</form>`;
    dialog.addEventListener('close', () => {
      if (options.onClose) options.onClose();
      dialog.remove(); restoreFocus(opener, options.fallback);
    }, {once: true});
    dialogs.append(dialog);
    dialog.showModal();
    return dialog;
  }
  const cancelButton = '<button type="button" class="lottery-btn" data-lottery-action="close-dialog">取消</button>';
  const submitButton = label => `<button type="submit" class="lottery-btn is-primary">${label}</button>`;
  function formError(form, message) { const element = form.querySelector('.lottery-form-error'); element.textContent = message; element.hidden = false; }
  function screenEditor(id) {
    const screen = state.screens.find(item => item.id === id);
    const dialog = openDialog(screen ? '编辑大屏名称' : '新建抽奖大屏', `<div class="lottery-form"><input type="hidden" name="id" value="${escapeHTML(screen?.id || '')}"><label>大屏名称 <span class="lottery-required">*</span><input autofocus name="name" required maxlength="80" placeholder="例如：年度盛典抽奖" value="${escapeHTML(screen?.name || '')}"></label><p class="lottery-muted">创建后可添加奖项并同步名单。所有数据仅用于当前浏览器中的原型演示。</p></div>`, `${cancelButton}${submitButton(screen ? '保存修改' : '创建大屏')}`, {form: 'screen-editor', fallback: '[data-lottery-action="new-screen"]'});
    dialog?.querySelector('input[name="name"]')?.focus();
  }
  function prizeEditor(id) {
    const screen = currentScreen(); if (!screen) return;
    const prize = screen.prizes.find(item => item.id === id);
    const min = prize ? Math.max(1, wonFor(screen, prize.id)) : 1;
    const dialog = openDialog(prize ? '编辑奖项' : '添加奖项', `<div class="lottery-form">
      <input type="hidden" name="id" value="${escapeHTML(prize?.id || '')}">
      <label>奖项名称<input name="level" autofocus required maxlength="20" value="${escapeHTML(prize?.level || '')}" placeholder="例如：一等奖"></label>
      <label>奖品名称<input name="name" required maxlength="80" value="${escapeHTML(prize?.name || '')}" placeholder="例如：蓝牙耳机"></label>
      <label>总中奖名额<input name="total" type="number" required min="${min}" max="10000" step="1" value="${prize?.total || 1}"><small>该奖项可发出的奖品总数，不能少于已抽出的 ${prize ? wonFor(screen,prize.id) : 0} 个名额。</small></label>
      <div class="lottery-prize-fields"><label>抽奖范围<select name="scope">${Object.entries(scopeLabels).map(([key,label]) => `<option value="${key}" ${(prize?.scope || 'all') === key ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
      <label>允许重复中奖<select name="allowRepeat"><option value="no">否</option><option value="yes" ${prize?.allowRepeat ? 'selected' : ''}>是</option></select></label></div>
      <label>中奖范围<select name="winnerScope"><option value="random">随机抽取</option><option value="designated" ${prize?.winnerScope === 'designated' ? 'selected' : ''}>内定人员</option></select></label>
      <fieldset class="lottery-designated" ${prize?.winnerScope === 'designated' ? '' : 'hidden'}><legend>选择内定人员</legend><input type="search" data-designated-search placeholder="搜索姓名、公司或手机号" aria-label="搜索内定人员"><div class="lottery-designated-list">${screen.people.map(person => `<label data-designated-person><input type="checkbox" name="designatedIds" value="${escapeHTML(person.id)}" ${(prize?.designatedIds || []).includes(person.id) ? 'checked' : ''}><span>${escapeHTML(person.name)}<small>${escapeHTML(person.company || '')} ${escapeHTML(maskPhone(person.phone))}${person.allowed === false ? ' · 已禁止抽奖' : ''}</small></span></label>`).join('') || '<p class="lottery-muted">请先在抽奖池名单添加或同步人员。</p>'}</div><p class="lottery-muted" data-designated-count></p></fieldset>
      <p class="lottery-muted">选择内定人员后，仅从该名单抽取；名单人数多于名额时，在名单内随机选出。内定人员仍须符合抽奖范围及允许抽奖资格。选择允许重复中奖后，已中奖人员可再次参与；同一轮每人最多中奖一次。当前符合规则人数为 0 时可保存配置，开始抽奖前须补齐资格。</p>
      </div>`, `${cancelButton}${submitButton(prize ? '保存修改' : '添加奖项')}`, {form: 'prize-editor', fallback: '[data-lottery-action="add-prize"]'});
    if (!dialog) return;
    const form = dialog.querySelector('form'), fieldset = dialog.querySelector('.lottery-designated');
    const refresh = () => {
      fieldset.hidden = form.elements.winnerScope.value !== 'designated';
      const ids = [...form.querySelectorAll('[name="designatedIds"]:checked')].map(input => input.value);
      const rules = {scope:form.elements.scope.value, allowRepeat:form.elements.allowRepeat.value === 'yes', winnerScope:'designated', designatedIds:ids};
      dialog.querySelector('[data-designated-count]').textContent = `已选择 ${ids.length} 人 · 当前符合规则 ${eligiblePeople(screen,rules).length} 人`;
    };
    form.addEventListener('change', refresh);
    dialog.querySelector('[data-designated-search]').addEventListener('input', event => {
      const query = event.target.value.trim().toLocaleLowerCase();
      dialog.querySelectorAll('[data-designated-person]').forEach(row => { row.hidden = !row.textContent.toLocaleLowerCase().includes(query); });
    });
    refresh(); form.elements.level.focus();
  }
  function confirmDelete(kind, id) {
    const screen = kind === 'screen' ? state.screens.find(item => item.id === id) : currentScreen();
    const target = kind === 'screen' ? screen : screen?.prizes.find(item => item.id === id);
    if (!target) return;
    if (kind === 'prize' && wonFor(screen, id)) { notify('已有中奖记录的奖项不可删除，以保留完整抽奖记录。', true); return; }
    openDialog(kind === 'screen' ? '删除这个大屏？' : '删除这个奖项？', `<div class="lottery-form"><input type="hidden" name="kind" value="${kind}"><input type="hidden" name="id" value="${escapeHTML(id)}"><p>确认删除「${escapeHTML(target.name)}」？</p><p class="lottery-muted">${kind === 'screen' ? '该大屏下的奖项、参与名单和中奖记录将从此浏览器删除，此操作无法撤销。' : '删除后，该奖项的中奖名额也会一并移除。'}</p></div>`, `${cancelButton}<button type="submit" class="lottery-btn is-danger">确认删除</button>`, {form: 'delete', fallback: kind === 'screen' ? '[data-lottery-action="new-screen"]' : '[data-lottery-action="add-prize"]'});
  }

  function csvCell(value) {
    let text = String(value ?? '');
    if (/^[\s\u0000-\u001f]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  }
  function downloadCSV(filename, rows) {
    const blob = new Blob(['\uFEFF', rows.map(row => row.map(csvCell).join(',')).join('\r\n')], {type: 'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob), anchor = document.createElement('a');
    anchor.href = url; anchor.download = filename; document.body.append(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function personKey(person) { return person.phone.trim() ? `phone:${person.phone.replace(/[\s()-]/g, '')}` : `person:${person.name.trim().toLocaleLowerCase()}|${person.company.trim().toLocaleLowerCase()}`; }
  function randomIndex(length) {
    if (!globalThis.crypto?.getRandomValues) throw new Error('此浏览器不支持安全随机数，请使用较新的浏览器进行演示。');
    const array = new Uint32Array(1), limit = Math.floor(0x100000000 / length) * length;
    do { globalThis.crypto.getRandomValues(array); } while (array[0] >= limit);
    return array[0] % length;
  }
  function drawOptions(screen, selected) {
    return screen.prizes.map(prize => `<option value="${escapeHTML(prize.id)}" ${prize.id === selected ? 'selected' : ''} ${wonFor(screen, prize.id) >= prize.total || !eligiblePeople(screen, prize).length ? 'disabled' : ''}>${escapeHTML(prize.level)} · ${escapeHTML(prize.name)}（剩余 ${prize.total - wonFor(screen, prize.id)}）</option>`).join('');
  }
  function stylePicker(mode) {
    return `<div class="lottery-style-picker" role="group" aria-label="抽奖样式">${DRAW_MODES.map(item => `<button type="button" class="lottery-style-option ${item.id === mode ? 'is-active' : ''}" data-lottery-mode="${item.id}" aria-pressed="${item.id === mode}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${item.glyph}</svg><span><strong>${item.label}</strong><small>${item.caption}</small></span></button>`).join('')}</div>`;
  }
  function themePicker(theme) {
    return `<div class="lottery-theme-picker" role="group" aria-label="舞台主题">${stageThemes().map(item => `<button type="button" class="lottery-theme-option" data-theme="${item.id}" data-lottery-theme="${item.id}" aria-pressed="${item.id === theme}"><strong>${escapeHTML(item.label)}</strong><small>${escapeHTML(item.description || '')}</small></button>`).join('')}</div>`;
  }
  function afterDialogClose(dialog, callback) {
    dialog.addEventListener('close', () => queueMicrotask(callback), {once: true});
    dialog.close();
  }
  function rememberLaunch(form) {
    const screen = currentScreen(); if (!screen) return;
    launchDraft = {screenId: screen.id, mode: drawMode(form.elements.setupMode.value).id, theme: stageTheme(form.elements.setupTheme.value).id, reducedMotion: form.elements.setupReducedMotion.checked, prizeId: form.elements.setupPrize.value, quantity: Number(form.elements.setupQuantity.value)};
  }
  function updateLaunchForm(dialog, useDefault = false) {
    const screen = currentScreen(); if (!screen || !dialog?.open) return;
    const form = dialog.querySelector('form'), prize = screen.prizes.find(item => item.id === form.elements.setupPrize.value);
    const mode = drawMode(form.elements.setupMode.value), quantity = form.elements.setupQuantity;
    const left = prize ? prize.total - wonFor(screen, prize.id) : 0, eligible = eligiblePeople(screen, prize).length;
    const max = Math.min(left, eligible, mode.max), desired = useDefault ? roundQuantity(prize) : Number(quantity.value);
    quantity.max = String(Math.max(1, max));
    if (useDefault || mode.max === 1 || Number(quantity.value) > max) quantity.value = String(Math.max(1, Math.min(desired, max)));
    const count = Number(quantity.value), valid = Number.isInteger(count) && count >= 1 && count <= max;
    quantity.readOnly = mode.max === 1;
    quantity.setAttribute('aria-readonly', String(mode.max === 1));
    dialog.querySelector('.lottery-launch-availability').textContent = `剩余 ${left} 个名额 · 当前可抽 ${eligible} 人${mode.max === 1 ? ' · 本形式每轮固定抽取 1 人' : ` · 本轮最多抽取 ${max} 人`} · ${prize?.winnerScope === 'designated' ? '仅从内定人员中抽取' : '随机抽取'}`;
    dialog.querySelector('.lottery-launch-summary').innerHTML = `<strong>进入舞台前确认</strong><p>${escapeHTML(prize ? `${prize.level} · ${prize.name}` : '请选择奖项')} <span> / </span> ${mode.label} <span> / </span> ${valid ? count : '—'} 人 <span> / </span> ${escapeHTML(stageTheme(form.elements.setupTheme.value).label)}</p><small>${valid ? count === left ? '本轮将抽完该奖项的剩余名额。' : `本轮结束后，该奖项还剩 ${left - count} 个名额。` : `请输入 1–${Math.max(0, max)} 的整数。`} ${valid && count > 10 ? `结果每页展示 10 人，共 ${Math.ceil(count / 10)} 页；翻页不会再次抽取。` : valid && count > 5 ? '揭晓后切换为本轮名单主画面。' : '少量中奖人以头像卡突出展示。'} 进入舞台仅预览，点击开始后滚动，点击停止时才生成结果。</small>`;
    dialog.querySelector('[type="submit"]').disabled = !valid;
    rememberLaunch(form);
  }
  function drawSetupDialog() {
    if (dialogs.querySelector('dialog[open]')) return;
    const screen = currentScreen(); if (!screen) return;
    const fallbackPrize = screen.prizes.find(item => item.total > wonFor(screen, item.id) && eligiblePeople(screen, item).length);
    if (!fallbackPrize || !eligiblePeople(screen, fallbackPrize).length) { notify('请检查剩余名额、抽奖范围和人员资格。', true); return; }
    const preferences = presentationFor(screen);
    if (!screen.presentation?.mode && roundQuantity(fallbackPrize) > 3) preferences.mode = 'matrix';
    const saved = {...preferences, prizeId: launchDraft?.screenId === screen.id ? launchDraft.prizeId : fallbackPrize.id};
    const prize = screen.prizes.find(item => item.id === saved.prizeId && item.total > wonFor(screen, item.id) && eligiblePeople(screen, item).length) || fallbackPrize;
    const mode = drawMode(saved.mode), theme = stageTheme(saved.theme).id;
    const max = Math.min(mode.max, prize.total - wonFor(screen, prize.id), eligiblePeople(screen, prize).length);
    const count = Math.min(roundQuantity(prize), max);
    const dialog = openDialog('选择抽奖形式与舞台', `<div class="lottery-launch-body"><div class="lottery-launch-fields"><section><h3>01 / 本轮奖项与人数</h3><div class="lottery-prize-fields"><label>选择奖项<select name="setupPrize">${drawOptions(screen, prize.id)}</select></label><label>本轮抽取人数<input type="number" name="setupQuantity" min="1" max="${max}" step="1" required value="${count}"></label></div><p class="lottery-launch-availability lottery-muted"></p></section><section><h3>02 / 选择抽奖形式</h3><input type="hidden" name="setupMode" value="${mode.id}">${stylePicker(mode.id)}<p class="lottery-muted">转盘 / 单人 / 金蛋：1 人；老虎机：最多 3 人；矩阵 / 名单 / 球形：最多 50 人。批量抽奖建议选择头像矩阵或名单滚动。</p></section><section><h3>03 / 选择舞台主题</h3><input type="hidden" name="setupTheme" value="${theme}">${themePicker(theme)}<p class="lottery-muted">6 套系统预置，其中 4 套为图片背景；主题适用于全部抽奖形式。当前不提供自定义图片上传。</p></section><label class="lottery-launch-motion"><input type="checkbox" name="setupReducedMotion" ${saved.reducedMotion ? 'checked' : ''}>减少动态效果（跳过快速旋转与滚动）</label></div><aside class="lottery-launch-summary" aria-live="polite"></aside></div>`, `${cancelButton}${submitButton('进入抽奖舞台')}`, {className: 'lottery-launch-dialog', form: 'draw-setup', description: '奖项与名单已准备好；在这里确认展示和本轮配置，进入后再开始抽奖。', fallback: '[data-lottery-action="open-draw"]'});
    if (dialog) updateLaunchForm(dialog);
  }
  function phaseLabel(phase) { return ({idle: '准备就绪', running: '抽奖进行中', settling: '正在揭晓', revealed: '本轮已揭晓'})[phase] || '准备就绪'; }
  function setDrawPhase(dialog, session, phase) {
    session.phase = phase;
    dialog.dataset.phase = phase;
    dialog.querySelector('.lottery-presentation').dataset.phase = phase;
    dialog.querySelector('.lottery-live-status').textContent = phaseLabel(phase);
    dialog.dispatchEvent(new CustomEvent('lottery:round-state', {bubbles: true, detail: {phase, mode: session.mode, roundId: session.roundId || null}}));
  }
  function drawAvailability(screen, prize, mode) {
    return prize ? `剩余 ${prize.total - wonFor(screen, prize.id)} 个名额 · 当前可抽 ${eligiblePeople(screen, prize).length} 人 · 本轮最多 ${Math.min(prize.total - wonFor(screen, prize.id), eligiblePeople(screen, prize).length, drawMode(mode).max)} 人` : '全部奖项已抽取完毕。';
  }
  function savePresentation(screen, session) {
    screen.presentation = {mode: session.mode, theme: session.theme, reducedMotion: session.reducedMotion};
    persist();
  }
  function mountDrawEffect(dialog, session) {
    const screen = state.screens.find(item => item.id === session.screenId);
    if (!screen || session.closed) return;
    session.engine?.destroy();
    const prize = screen.prizes.find(item => item.id === dialog.querySelector('[name="drawPrize"]').value);
    session.engine = window.MKLotteryEffects.create({host: dialog.querySelector('.lottery-effect-host'), mode: session.mode, people: eligiblePeople(screen, prize).map(person => ({...person})), history: screen.winners.map(winner => ({...winner})), prize, quantity: Number(dialog.querySelector('[name="quantity"]').value) || 1, reducedMotion: session.reducedMotion, onRequestStart: () => toggleDraw(dialog), onRequestStop: () => toggleDraw(dialog)});
    updateDrawControls(dialog);
  }
  function updateDrawControls(dialog) {
    const session = drawSession;
    const screen = state.screens.find(item => item.id === session?.screenId);
    if (!screen || session.closed || !dialog.open) return;
    const select = dialog.querySelector('[name="drawPrize"]');
    let prize = screen.prizes.find(item => item.id === select.value);
    if (!prize || prize.total <= wonFor(screen, prize.id) || !eligiblePeople(screen, prize).length) prize = screen.prizes.find(item => item.total > wonFor(screen, item.id) && eligiblePeople(screen, item).length);
    select.innerHTML = drawOptions(screen, prize?.id || select.value);
    const max = prize ? Math.min(prize.total - wonFor(screen, prize.id), eligiblePeople(screen, prize).length, drawMode(session.mode).max) : 0;
    const quantity = dialog.querySelector('[name="quantity"]');
    quantity.readOnly = drawMode(session.mode).max === 1;
    quantity.max = String(Math.max(1, max));
    quantity.value = String(Math.min(Math.max(1, Number(quantity.value) || 1), Math.max(1, max)));
    const locked = session.phase === 'running' || session.phase === 'settling';
    select.disabled = locked || !max; quantity.disabled = locked || !max;
    dialog.querySelectorAll('[data-lottery-mode], [name="theme"], [name="reducedMotion"], [data-lottery-action="fill-demo"]').forEach(button => { button.disabled = locked; });
    const start = dialog.querySelector('.lottery-start');
    start.disabled = session.phase === 'settling' || !max;
    start.textContent = session.phase === 'running' ? (session.mode === 'eggs' ? '砸开金蛋 · 揭晓结果' : '停止抽奖 · 揭晓结果') : session.phase === 'settling' ? '减速揭晓中…' : !max ? (prize ? '当前奖项无符合规则的人员' : '全部奖项已抽完') : session.phase === 'revealed' ? '开始下一轮' : '开始抽奖';
    dialog.querySelector('.lottery-draw-availability').textContent = drawAvailability(screen, prize, session.mode);
    dialog.querySelector('.lottery-current-style').textContent = drawMode(session.mode).label;
    const displayedPrize = session.phase === 'revealed' && session.resultPrize ? session.resultPrize : prize;
    dialog.querySelector('.lottery-round-prize').textContent = displayedPrize ? `${displayedPrize.level} · ${displayedPrize.name}` : '本轮抽奖已结束';
    if (!max && !locked) dialog.querySelectorAll('[data-fx-action="toggle"]').forEach(button => { button.disabled = true; button.textContent = '本轮已结束'; button.setAttribute('aria-label', '没有可抽取的人员或奖项'); });
    dialog.querySelector('.lottery-presentation-footer-count').textContent = `可抽 ${eligiblePeople(screen, prize).length} 人 · 已中奖 ${screen.winners.length} 人次`;
    dialog.querySelector('.lottery-motion-note').textContent = session.reducedMotion ? '减少动态效果已开启：保留结果与状态，跳过快速旋转和滚动。' : session.phase === 'running' && session.mode === 'eggs' ? '请选择舞台上的任意金蛋，或点击“砸开金蛋”揭晓。' : '空格开始 / 停止 · F 全屏 · Esc 退出 / 返回';
    dialog.querySelector('.lottery-repeat-rule').textContent = `${prize?.winnerScope === 'designated' ? '按内定名单抽取 · ' : ''}${prize?.allowRepeat ? '允许跨轮重复中奖，同轮每人一次' : '已中奖人员不再参与当前奖项'}`;
    session.selectedPrize = prize?.id || '';
    const back = dialog.querySelector('[data-lottery-action="return-setup"]'); if (back) back.disabled = locked;
  }
  function disposeDrawSession(session) {
    session.closed = true;
    session.engine?.destroy();
    session.engine = null;
    if (session.fullscreenListener) document.removeEventListener('fullscreenchange', session.fullscreenListener);
    if (drawSession === session) drawSession = null;
  }
  async function toggleFullscreen(dialog) {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (dialog.querySelector('.lottery-modal-form').requestFullscreen) await dialog.querySelector('.lottery-modal-form').requestFullscreen();
      else formError(dialog.querySelector('form'), '当前浏览器未提供全屏接口，可最大化窗口查看。');
    } catch (_) { formError(dialog.querySelector('form'), '未能进入全屏，请使用浏览器的全屏或窗口最大化功能。'); }
  }
  function drawDialog(configuration = {}) {
    if (dialogs.querySelector('dialog[open]')) return;
    const screen = currentScreen(); if (!screen) return;
    if (!window.MKLotteryEffects?.create) { notify('抽奖动效组件未能加载，请刷新页面后重试。', true); return; }
    const prize = screen.prizes.find(item => item.id === configuration.prizeId && item.total > wonFor(screen, item.id) && eligiblePeople(screen, item).length) || screen.prizes.find(item => item.total > wonFor(screen, item.id) && eligiblePeople(screen, item).length);
    if (!prize || !eligiblePeople(screen, prize).length) { notify('当前奖项没有符合范围和资格的可抽人员，请检查奖项规则与名单。', true); return; }
    const session = {...presentationFor(screen), ...configuration, mode: drawMode(configuration.mode || presentationFor(screen).mode).id, theme: stageTheme(configuration.theme || presentationFor(screen).theme).id, screenId: screen.id, phase: 'idle', selectedPrize: prize.id, closed: false, engine: null, roundId: null};
    drawSession = session;
    const dialog = openDialog('现场抽奖大屏', `<div class="lottery-draw-layout"><section class="lottery-presentation" data-phase="idle" aria-label="抽奖展示舞台"><header class="lottery-presentation-header"><div><span class="lottery-stage-kicker">LUCKY MOMENT <span>·</span> <span class="lottery-current-style">${drawMode(session.mode).label}</span></span><h3>${escapeHTML(screen.name)}</h3><p class="lottery-round-prize">${escapeHTML(prize.level)} · ${escapeHTML(prize.name)}</p></div><span class="lottery-live-status" role="status">准备就绪</span></header><div class="lottery-effect-host"></div><footer class="lottery-presentation-footer"><span class="lottery-presentation-footer-count">可抽 ${eligiblePeople(screen, prize).length} 人</span><span class="lottery-repeat-rule">${prize.allowRepeat ? '允许跨轮重复中奖' : '已中奖者不再参与本奖项'}</span></footer></section><aside class="lottery-draw-controls" aria-label="抽奖控制台"><div class="lottery-control-heading"><h3>抽奖控制台</h3><span class="lottery-control-step">01 / 选择样式</span></div>${stylePicker(session.mode)}<div class="lottery-appearance-row"><label class="lottery-field"><span>舞台主题</span><select name="theme">${stageThemes().map(theme => `<option value="${theme.id}" ${session.theme === theme.id ? 'selected' : ''}>${escapeHTML(theme.label)}</option>`).join('')}</select></label><label class="lottery-motion-toggle"><input type="checkbox" name="reducedMotion" ${session.reducedMotion ? 'checked' : ''}>减少动态效果</label></div><div class="lottery-control-divider"></div><span class="lottery-control-step">02 / 设置本轮</span><label class="lottery-field"><span>选择奖项</span><select name="drawPrize">${drawOptions(screen, prize.id)}</select></label><label class="lottery-field"><span>本轮抽取人数</span><input type="number" name="quantity" min="1" max="${Math.min(prize.total, eligiblePeople(screen, prize).length, drawMode(session.mode).max)}" step="1" value="${Math.min(configuration.quantity || roundQuantity(prize), drawMode(session.mode).max, prize.total - wonFor(screen, prize.id), eligiblePeople(screen, prize).length)}" required></label><p class="lottery-draw-availability lottery-muted"></p><button type="button" class="lottery-btn is-primary lottery-start" data-lottery-action="toggle-draw">开始抽奖</button><p class="lottery-motion-note"></p>${screen.id === 'screen-annual-demo' && samplePeople().some(person => !screen.people.some(existing => existing.id === person.id)) ? '<button type="button" class="lottery-btn lottery-demo-fill" data-lottery-action="fill-demo">补齐内置示例人员</button>' : ''}<details class="lottery-motion-spec"><summary>交互与研发说明</summary><p>开始仅播放动效；停止时统一抽取并保存本轮结果，再减速揭晓。切换样式不重新抽取已揭晓结果。</p><p>滚动时关闭取消本轮；停止后关闭，已保存记录保留。转盘超过 12 人按分组展示，中奖对象仍是个人。</p><a href="./lottery-motion-guide.html" target="_blank" rel="noopener">打开动效与接口说明 ↗</a></details></aside></div>`, '', {className: 'lottery-draw-dialog lottery-effects-dialog', form: 'draw', description: '七种展示形式 · 共用奖项、名单与中奖记录', fallback: '[data-lottery-action="open-draw"]', onClose: () => { const committed = session.phase === 'settling'; disposeDrawSession(session); render(); if (committed) notify(session.saved === false ? '本轮结果已生成，但本地保存失败；请及时导出中奖记录。' : '本轮结果已保存，可在“中奖记录”中查看。'); }});
    if (!dialog) { disposeDrawSession(session); return; }
    dialog.dataset.theme = session.theme;
    dialog.dataset.reducedMotion = String(session.reducedMotion);
    dialog.dataset.phase = 'idle';
    const header = dialog.querySelector('.lottery-dialog-head'), close = header.querySelector('.lottery-close');
    const headerActions = document.createElement('div'); headerActions.className = 'lottery-display-actions';
    headerActions.innerHTML = '<button type="button" data-lottery-action="return-setup">返回设置</button><button type="button" data-lottery-action="toggle-controls" aria-expanded="true">收起控制台</button><button type="button" data-lottery-action="fullscreen">进入全屏</button>';
    headerActions.append(close); header.append(headerActions);
    session.fullscreenListener = () => { if (dialog.open) dialog.querySelector('[data-lottery-action="fullscreen"]').textContent = document.fullscreenElement && dialog.contains(document.fullscreenElement) ? '退出全屏' : '进入全屏'; };
    document.addEventListener('fullscreenchange', session.fullscreenListener);
    dialog.addEventListener('keydown', event => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || event.target.matches('input,select,textarea,[contenteditable="true"]')) return;
      if (event.code === 'Space' && !event.target.closest('button,a,summary,[role="button"]')) { event.preventDefault(); toggleDraw(dialog); }
      else if (event.key.toLowerCase() === 'f') { event.preventDefault(); toggleFullscreen(dialog); }
    });
    updateDrawControls(dialog);
    mountDrawEffect(dialog, session);
    dialog.querySelector('.lottery-start').focus({preventScroll: true});
  }
  async function toggleDraw(dialog) {
    const session = drawSession;
    if (!dialog?.open || !session || session.closed || busy || session.phase === 'settling') return;
    const screen = state.screens.find(item => item.id === session.screenId); if (!screen) return;
    const form = dialog.querySelector('form');
    let committed = false;
    try {
      if (session.phase === 'idle' || session.phase === 'revealed') {
        const prize = screen.prizes.find(item => item.id === form.elements.drawPrize.value);
        const quantity = Number(form.elements.quantity.value);
        const max = prize ? Math.min(prize.total - wonFor(screen, prize.id), eligiblePeople(screen, prize).length, drawMode(session.mode).max) : 0;
        if (!prize || !Number.isInteger(quantity) || quantity < 1 || quantity > max) { formError(form, `本轮人数必须是 1–${max} 的整数。`); return; }
        if (!globalThis.crypto?.getRandomValues) { formError(form, '此浏览器不支持安全随机数，请更换浏览器后演示。'); return; }
        form.querySelector('.lottery-form-error').hidden = true;
        prize.lastQuantity = quantity; persist();
        session.selectedPrize = prize.id; session.quantity = quantity; session.roundId = uid('round');
        session.engine.reset({people: eligiblePeople(screen, prize).map(person => ({...person})), history: screen.winners.map(winner => ({...winner})), prize, quantity});
        setDrawPhase(dialog, session, 'running'); session.engine.start(); updateDrawControls(dialog);
        return;
      }
      if (session.phase !== 'running') return;
      setDrawPhase(dialog, session, 'settling');
      updateDrawControls(dialog);
      const prize = screen.prizes.find(item => item.id === session.selectedPrize), pool = eligiblePeople(screen, prize);
      session.resultPrize = {level: prize.level, name: prize.name};
      const count = Math.min(session.quantity, prize.total - wonFor(screen, prize.id), pool.length);
      if (!count) throw new Error('本轮没有可抽取的人员或剩余名额。');
      const winners = [];
      for (let index = 0; index < count; index++) {
        const chosen = pool.splice(randomIndex(pool.length), 1)[0];
        winners.push({id: uid('winner'), roundId: session.roundId, mode: session.mode, personId: chosen.id, prizeId: prize.id, name: chosen.name, company: chosen.company, phone: chosen.phone, prizeName: prize.name, level: prize.level, drawnAt: new Date().toISOString()});
      }
      screen.winners.push(...winners); committed = true;
      const saved = persist(); session.saved = saved; render();
      if (!saved) formError(form, '本轮结果已在当前页面生成，但本地保存失败，请返回管理页面及时导出。');
      await session.engine.reveal(winners);
      if (drawSession !== session || session.closed || !dialog.open) return;
      setDrawPhase(dialog, session, 'revealed'); updateDrawControls(dialog);
    } catch (error) {
      if (drawSession !== session || session.closed || !dialog.open) return;
      setDrawPhase(dialog, session, committed ? 'revealed' : 'idle');
      formError(form, committed ? '本轮结果已保存，动效展示未完成。可返回“中奖记录”查看结果。' : error.message || '抽奖暂时未能完成，请重试。');
      updateDrawControls(dialog);
    }
  }


  root.addEventListener('click', event => {
    const setup = event.target.closest('dialog.lottery-launch-dialog');
    if (setup) {
      const mode = event.target.closest('[data-lottery-mode]'), theme = event.target.closest('[data-lottery-theme]');
      if (mode || theme) {
        const form = setup.querySelector('form'), item = mode || theme;
        const attribute = mode ? 'data-lottery-mode' : 'data-lottery-theme';
        form.elements[mode ? 'setupMode' : 'setupTheme'].value = item.getAttribute(attribute);
        setup.querySelectorAll(`[${attribute}]`).forEach(button => { button.setAttribute('aria-pressed', String(button === item)); button.classList.toggle('is-active', button === item); });
        updateLaunchForm(setup); return;
      }
    }
    const modeButton = event.target.closest('[data-lottery-mode]');
    if (modeButton && drawSession && ['idle', 'revealed'].includes(drawSession.phase)) {
      const session = drawSession, dialog = modeButton.closest('dialog'), screen = currentScreen();
      if (!dialog || !screen || modeButton.disabled) return;
      session.mode = drawMode(modeButton.dataset.lotteryMode).id;
      dialog.querySelectorAll('[data-lottery-mode]').forEach(button => { button.classList.toggle('is-active', button === modeButton); button.setAttribute('aria-pressed', String(button === modeButton)); });
      setDrawPhase(dialog, session, 'idle');
      savePresentation(screen, session); updateDrawControls(dialog); mountDrawEffect(dialog, session);
      return;
    }
    if (handleRosterAction(event)) return;
    const tabButton = event.target.closest('[data-lottery-tab]');
    if (tabButton) { switchTab(tabButton.dataset.lotteryTab); return; }
    const button = event.target.closest('[data-lottery-action]'); if (!button || button.disabled) return;
    const action = button.dataset.lotteryAction, id = button.dataset.id;
    if (action === 'close-dialog') { button.closest('dialog')?.close(); return; }
    if (action === 'fullscreen') { toggleFullscreen(button.closest('dialog')); return; }
    if (action === 'toggle-controls') {
      const dialog = button.closest('dialog'), collapsed = dialog.classList.toggle('is-controls-hidden');
      button.textContent = collapsed ? '展开控制台' : '收起控制台'; button.setAttribute('aria-expanded', String(!collapsed)); return;
    }
    if (action === 'fill-demo') {
      const screen = currentScreen(), session = drawSession;
      if (!screen || screen.id !== 'screen-annual-demo' || !session || !['idle','revealed'].includes(session.phase)) return;
      const keys = new Set(screen.people.map(personKey));
      const additions = samplePeople().filter(person => !screen.people.some(existing => existing.id === person.id) && !keys.has(personKey(person)));
      if (screen.people.length + additions.length > 10000) return;
      screen.people.push(...additions); persist(); render();
      const dialog = button.closest('dialog'); button.remove();
      setDrawPhase(dialog, session, 'idle'); updateDrawControls(dialog); mountDrawEffect(dialog, session);
      dialog.querySelector('.lottery-motion-note').textContent = `已补充 ${additions.length} 位虚构示例参与人，当前共 ${screen.people.length} 人。`; return;
    }
    if (busy) return;
    if (action === 'screen-list') { view = 'list'; render(); (document.getElementById('activityLotteryCreate') || root.querySelector('[data-lottery-action="new-screen"]'))?.focus(); }
    else if (action === 'new-screen') screenEditor();
    else if (action === 'edit-screen') screenEditor(id);
    else if (action === 'delete-screen') confirmDelete('screen', id);
    else if (action === 'open-screen') { selectedScreenId = id; view = 'detail'; tab = 'prizes'; resetFilters(); render(); root.querySelector('[data-lottery-action="screen-list"]')?.focus(); }
    else if (action === 'add-prize') prizeEditor();
    else if (action === 'edit-prize') prizeEditor(id);
    else if (action === 'delete-prize') confirmDelete('prize', id);
    else if (action === 'reset-pool') { poolFilter = ''; selectedPeople.clear(); poolQuery = ''; poolPage = 1; render(); root.querySelector('[data-lottery-form="pool-search"] input')?.focus(); }
    else if (action === 'reset-winners') { winnerQuery = ''; winnerPrize = ''; winnerPage = 1; render(); root.querySelector('[data-lottery-form="winner-search"] input')?.focus(); }
    else if (action === 'pool-page' || action === 'winner-page') { const page = Number(button.dataset.page); if (action === 'pool-page') poolPage = Math.max(1, page); else winnerPage = Math.max(1, page); render(); root.querySelector('.lottery-pagination')?.focus({preventScroll: true}); root.querySelector('.lottery-table-wrap')?.scrollIntoView({block: 'nearest'}); }
    else if (action === 'import-people' || action === 'sync-people') syncPeopleDialog();
    else if (action === 'export-winners') {
      const screen = currentScreen(); if (!screen) return;
      const rows = searchPeople(screen.winners.filter(winner => !winnerPrize || winner.prizeId === winnerPrize), winnerQuery).slice().reverse();
      if (!rows.length) return;
      downloadCSV('抽奖中奖记录.csv', [['姓名', '奖项等级', '奖品名称', '公司', '手机号', '抽奖时间'], ...rows.map(winner => [winner.name, winner.level, winner.prizeName, winner.company, maskPhone(winner.phone), timeLabel(winner.drawnAt)])]); notify(`已导出当前筛选的 ${rows.length} 条中奖记录，手机号使用掩码显示。`);
    }
    else if (action === 'open-draw') drawSetupDialog();
    else if (action === 'return-setup' && drawSession && ['idle','revealed'].includes(drawSession.phase)) {
      const dialog = button.closest('dialog'), form = dialog.querySelector('form');
      launchDraft = {screenId: drawSession.screenId, mode: drawSession.mode, theme: drawSession.theme, reducedMotion: drawSession.reducedMotion, prizeId: form.elements.drawPrize.value, quantity: Number(form.elements.quantity.value)};
      afterDialogClose(dialog, drawSetupDialog);
    }
    else if (action === 'toggle-draw') toggleDraw(button.closest('dialog'));
  });
  root.addEventListener('input', event => {
    const setup = event.target.closest('dialog.lottery-launch-dialog');
    if (setup && event.target.name === 'setupQuantity') updateLaunchForm(setup);
  });
  root.addEventListener('change', event => {
    if (event.target.matches('[data-pool-select]')) { event.target.checked ? selectedPeople.add(event.target.value) : selectedPeople.delete(event.target.value); renderSelection(); return; }
    if (event.target.matches('[data-pool-select-all]')) { root.querySelectorAll('[data-pool-select]').forEach(input => { input.checked = event.target.checked; input.checked ? selectedPeople.add(input.value) : selectedPeople.delete(input.value); }); renderSelection(); return; }
    const setup = event.target.closest('dialog.lottery-launch-dialog');
    if (setup) { updateLaunchForm(setup, event.target.name === 'setupPrize'); return; }
    const session = drawSession;
    if (!session || !['idle','revealed'].includes(session.phase)) return;
    const dialog = event.target.closest('dialog'), screen = currentScreen(); if (!dialog || !screen) return;
    if (event.target.matches('[name="theme"]')) { session.theme = stageTheme(event.target.value).id; dialog.dataset.theme = session.theme; savePresentation(screen, session); updateDrawControls(dialog); return; }
    else if (event.target.matches('[name="reducedMotion"]')) { session.reducedMotion = event.target.checked; dialog.dataset.reducedMotion = String(session.reducedMotion); savePresentation(screen, session); }
    else if (event.target.matches('[name="drawPrize"]')) { const prize = screen.prizes.find(item => item.id === event.target.value); dialog.querySelector('[name="quantity"]').value = String(roundQuantity(prize)); }
    else if (!event.target.matches('[name="quantity"]')) return;
    setDrawPhase(dialog, session, 'idle'); updateDrawControls(dialog); mountDrawEffect(dialog, session);
  });
  root.addEventListener('keydown', event => {
    const target = event.target.closest('[role="tab"]'); if (!target || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault(); const tabs = ['prizes', 'pool', 'winners'], index = tabs.indexOf(tab);
    switchTab(tabs[event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : 2)) % 3]);
  });
  root.addEventListener('submit', event => {
    const form = event.target.closest('[data-lottery-form]'); if (!form) return;
    event.preventDefault(); if (busy || form.dataset.committed === 'true') return;
    const kind = form.dataset.lotteryForm, screen = currentScreen(), data = new FormData(form);
    if (submitRosterForm(form, data, kind)) return;
    if (kind === 'draw') return;
    if (kind === 'draw-setup') {
      updateLaunchForm(form.closest('dialog'));
      const prize = screen?.prizes.find(item => item.id === launchDraft?.prizeId);
      const max = prize ? Math.min(drawMode(launchDraft.mode).max, prize.total - wonFor(screen, prize.id), eligiblePeople(screen, prize).length) : 0;
      if (!launchDraft || !Number.isInteger(launchDraft.quantity) || launchDraft.quantity < 1 || launchDraft.quantity > max) { formError(form, '请检查本轮奖项和人数。'); return; }
      const configuration = {...launchDraft}; prize.lastQuantity = configuration.quantity; screen.presentation = {mode: configuration.mode, theme: configuration.theme, reducedMotion: configuration.reducedMotion}; persist();
      form.dataset.committed = 'true'; afterDialogClose(form.closest('dialog'), () => drawDialog(configuration)); return;
    }
    if (kind === 'pool-search') { poolQuery = String(data.get('query') || '').trim(); poolFilter = String(data.get('poolFilter') || ''); selectedPeople.clear(); poolPage = 1; render(); root.querySelector('[data-lottery-form="pool-search"] input')?.focus(); return; }
    if (kind === 'winner-search') { winnerQuery = String(data.get('query') || '').trim(); winnerPrize = String(data.get('prize') || ''); winnerPage = 1; render(); root.querySelector('[data-lottery-form="winner-search"] input')?.focus(); return; }
    if (kind === 'screen-editor') {
      const id = String(data.get('id') || ''), name = String(data.get('name') || '').trim();
      if (!textValid(name, 80)) { formError(form, '请填写 1–80 个字符的大屏名称。'); return; }
      if (id) { const edited = state.screens.find(item => item.id === id); if (!edited) return; form.dataset.committed = 'true'; edited.name = name; }
      else { if (state.screens.length >= 100) { formError(form, '当前浏览器最多保存 100 个大屏。'); return; } form.dataset.committed = 'true'; const added = {id: uid('screen'), name, createdAt: new Date().toISOString(), people: [], prizes: [], winners: []}; state.screens.push(added); selectedScreenId = added.id; view = 'detail'; tab = 'prizes'; resetFilters(); }
      form.closest('dialog').close(); saveAndRender(id ? '大屏名称已更新。' : '大屏已创建。接下来设置奖项并同步名单。');
    } else if (kind === 'prize-editor' && screen) {
      const id = String(data.get('id') || ''), name = String(data.get('name') || '').trim(), level = String(data.get('level') || '').trim(), total = Number(data.get('total'));
      const existing = screen.prizes.find(prize => prize.id === id), minimum = existing ? Math.max(1, wonFor(screen, id)) : 1;
      if (!textValid(name, 80) || !textValid(level, 20) || !Number.isSafeInteger(total) || total < minimum || total > 10000) { formError(form, `请填写奖项等级、奖品名称，中奖名额须为 ${minimum}–10,000 的整数。`); return; }
      const scope = String(data.get('scope') || 'all'), allowRepeat = data.get('allowRepeat') === 'yes';
      const winnerScope = String(data.get('winnerScope') || 'random'), designatedIds = [...new Set(data.getAll('designatedIds').map(String))];
      if (!scopeLabels[scope] || !['random','designated'].includes(winnerScope)) { formError(form, '请选择有效的抽奖范围和中奖范围。'); return; }
      if (winnerScope === 'designated' && !designatedIds.length) { formError(form, '请选择至少一位内定人员。'); return; }
      const rules = {scope, allowRepeat, winnerScope, designatedIds: winnerScope === 'designated' ? designatedIds : []};
      if (existing) { form.dataset.committed = 'true'; Object.assign(existing, {name, level, total, ...rules}); }
      else { if (screen.prizes.length >= 100) { formError(form, '每个大屏最多设置 100 个奖项。'); return; } form.dataset.committed = 'true'; screen.prizes.push({id: uid('prize'), name, level, total, ...rules}); }
      tab = 'prizes'; form.closest('dialog').close(); saveAndRender(existing ? '奖项已更新；历史中奖记录保留抽奖时的奖品名称。' : '奖项已添加。');
    } else if (kind === 'delete') {
      const id = String(data.get('id') || '');
      if (data.get('kind') === 'screen') { form.dataset.committed = 'true'; state.screens = state.screens.filter(item => item.id !== id); if (selectedScreenId === id) { selectedScreenId = state.screens[0]?.id || null; view = 'list'; resetFilters(); } }
      else if (screen) { if (wonFor(screen, id)) { formError(form, '该奖项已有中奖记录，无法删除。'); return; } form.dataset.committed = 'true'; screen.prizes = screen.prizes.filter(prize => prize.id !== id); }
      form.closest('dialog').close(); saveAndRender('已删除。');
    }
  });
  window.mkLottery = Object.freeze({
    get isListView() { return view === 'list'; },
    createScreen: () => screenEditor(),
    open: () => { if (currentScreen()) view = 'detail'; render(); },
    showList: () => { view = 'list'; render(); },
    showPrizes: () => { view = 'detail'; tab = 'prizes'; render(); },
    openDraw: drawDialog,
    openSetup: drawSetupDialog,
    closeDialogs: () => { dialogs.querySelectorAll('dialog[open]').forEach(dialog => dialog.close()); }
  });
  window.addEventListener('pagehide', () => { dialogs.querySelectorAll('dialog[open]').forEach(dialog => dialog.close()); if (drawSession) disposeDrawSession(drawSession); });
  render();
  if (storageWarning) notify(storageWarning, true);
  if (new URLSearchParams(location.search).get('lotteryDemo') === '1' && location.hash.startsWith('#activityDetail/lottery')) queueMicrotask(drawDialog);
})();
