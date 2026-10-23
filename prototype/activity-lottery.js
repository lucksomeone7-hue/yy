(() => {
  'use strict';
  const root = document.getElementById('activityLotteryRoot');
  if (!root) return;

  const STORAGE_KEY = 'mk-activity-lottery-v1';
  const PAGE_SIZE = 10;
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
      if (!Array.isArray(screen.people) || screen.people.length > 10000 || !Array.isArray(screen.prizes) || screen.prizes.length > 100 || !Array.isArray(screen.winners)) return false;
      const peopleIDs = new Set(), prizeIDs = new Set(), winnerIDs = new Set(), wonPeople = new Set();
      if (!screen.people.every(person => {
        if (!person || !textValid(person.id) || peopleIDs.has(person.id) || !textValid(person.name, 60) || typeof person.company !== 'string' || person.company.length > 120 || !phoneValid(person.phone)) return false;
        peopleIDs.add(person.id); return true;
      })) return false;
      if (!screen.prizes.every(prize => {
        if (!prize || !textValid(prize.id) || prizeIDs.has(prize.id) || !textValid(prize.name, 80) || !textValid(prize.level, 20) || !Number.isSafeInteger(prize.total) || prize.total < 1 || prize.total > 10000) return false;
        prizeIDs.add(prize.id); return true;
      })) return false;
      if (!screen.winners.every(winner => {
        if (!winner || !textValid(winner.id) || winnerIDs.has(winner.id) || !peopleIDs.has(winner.personId) || wonPeople.has(winner.personId) || !prizeIDs.has(winner.prizeId) || !textValid(winner.name, 60) || typeof winner.company !== 'string' || winner.company.length > 120 || !phoneValid(winner.phone) || !textValid(winner.prizeName, 80) || !textValid(winner.level, 20) || !Number.isFinite(Date.parse(winner.drawnAt))) return false;
        winnerIDs.add(winner.id); wonPeople.add(winner.personId); return true;
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
        if (validateStored(parsed)) return parsed;
        storageWarning = '本地保存的数据格式异常，已恢复示例数据。';
      }
    } catch (_) { storageWarning = '暂时无法读取本地记录。本次操作仍可使用，刷新后可能无法保留。'; }
    return {version: 1, screens: [makeExample()]};
  }
  let state = loadState();
  let selectedScreenId = state.screens[0]?.id || null;
  let view = selectedScreenId ? 'detail' : 'list';
  let tab = 'prizes';
  let poolQuery = '', winnerQuery = '', winnerPrize = '', poolPage = 1, winnerPage = 1;
  let busy = false, drawSession = null;
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
  function presentationFor(screen) {
    const saved = screen.presentation || {};
    return {mode: drawMode(saved.mode).id, theme: saved.theme === 'midnight' ? 'midnight' : 'festival', reducedMotion: typeof saved.reducedMotion === 'boolean' ? saved.reducedMotion : Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)};
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
  const eligiblePeople = screen => { const won = new Set(screen.winners.map(winner => winner.personId)); return screen.people.filter(person => !won.has(person.id)); };
  const totalSlots = screen => screen.prizes.reduce((total, prize) => total + prize.total, 0);
  const remainingSlots = screen => totalSlots(screen) - screen.winners.length;
  const maskPhone = phone => /^1\d{10}$/.test(phone) ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : phone || '—';
  const dateLabel = value => new Intl.DateTimeFormat('zh-CN', {year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Shanghai'}).format(new Date(value));
  const timeLabel = value => new Intl.DateTimeFormat('zh-CN', {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Shanghai'}).format(new Date(value));
  const demoNote = '<p class="lottery-demo-note"><span class="lottery-demo-badge">原型演示</span> 当前为固定活动示例，内置参与人为虚构数据；导入名单、配置与抽奖结果仅保存在当前浏览器。</p>';
  const btn = (action, label, extra = '') => `<button type="button" class="lottery-btn" data-lottery-action="${action}" ${extra}>${label}</button>`;

  function renderList() {
    return `<div class="lottery-toolbar"><div class="lottery-screen-heading"><p class="lottery-eyebrow">签到与互动 / 互动抽奖</p><h2>抽奖大屏</h2><p class="lottery-muted">统一管理大屏、奖项与参与名单，让现场抽奖准备更清晰。</p></div><div class="lottery-actions"><button type="button" class="lottery-btn is-primary" data-lottery-action="new-screen">＋ 新建大屏</button></div></div>${demoNote}
      <div class="lottery-section-head"><h3>全部大屏 <span class="lottery-muted">${state.screens.length}</span></h3><p class="lottery-muted">选择大屏，继续配置或开始抽奖</p></div>
      ${state.screens.length ? `<div class="lottery-screen-list">${state.screens.map(screen => `<article class="lottery-screen-card"><div class="lottery-prize-icon">${giftIcon}</div><div class="lottery-screen-card-copy"><h3>${escapeHTML(screen.name)}</h3><p class="lottery-screen-meta">创建于 ${escapeHTML(dateLabel(screen.createdAt))} · ${screen.prizes.length} 个奖项 · ${screen.people.length} 位参与人</p><p class="lottery-muted">已抽 ${screen.winners.length} 人 / 总名额 ${totalSlots(screen)} 人</p></div><div class="lottery-card-actions"><button type="button" class="lottery-btn is-primary" data-lottery-action="open-screen" data-id="${escapeHTML(screen.id)}">管理大屏</button>${btn('edit-screen', '编辑名称', `data-id="${escapeHTML(screen.id)}"`)}${btn('delete-screen', '删除', `data-id="${escapeHTML(screen.id)}"`)}</div></article>`).join('')}</div>` : `<div class="lottery-empty"><div class="lottery-empty-icon">${giftIcon}</div><h3>创建第一个抽奖大屏</h3><p>设置奖项、导入参与名单，即可开始现场抽奖。</p><button type="button" class="lottery-btn is-primary" data-lottery-action="new-screen">新建大屏</button></div>`}`;
  }

  function renderStats(screen) {
    const eligible = eligiblePeople(screen).length;
    return `<div class="lottery-stats" aria-label="抽奖概况"><div class="lottery-stat"><span>参与人数</span><strong>${screen.people.length}<small> 人</small></strong><small>${eligible} 人当前可抽</small></div><div class="lottery-stat"><span>奖项设置</span><strong>${screen.prizes.length}<small> 项</small></strong><small>共 ${totalSlots(screen)} 个中奖名额</small></div><div class="lottery-stat"><span>已中奖人数</span><strong>${screen.winners.length}<small> 人</small></strong><small>同一参与人只中奖一次</small></div><div class="lottery-stat"><span>剩余名额</span><strong>${remainingSlots(screen)}<small> 个</small></strong><small>${eligible < remainingSlots(screen) ? '当前可抽人数少于剩余名额' : '名单与奖项已同步'}</small></div></div>`;
  }
  function renderDetail(screen) {
    const noDraw = !screen.prizes.length || !eligiblePeople(screen).length || !remainingSlots(screen);
    return `<div class="lottery-detail-header"><div class="lottery-detail-copy"><button type="button" class="lottery-btn is-quiet lottery-back" data-lottery-action="screen-list">← 全部大屏</button><div class="lottery-title-line"><h2>${escapeHTML(screen.name)}</h2><span class="lottery-status">${screen.winners.length ? remainingSlots(screen) ? '抽奖进行中' : '抽奖已完成' : '准备中'}</span></div><p class="lottery-muted">设置奖项 → 准备名单 → 开启大屏，中奖结果自动同步。</p></div><div class="lottery-actions">${btn('edit-screen', '编辑名称', `data-id="${escapeHTML(screen.id)}"`)}<button type="button" class="lottery-btn is-primary" data-lottery-action="open-draw" ${noDraw ? 'disabled title="请先设置奖项并准备可抽取的参与名单"' : ''}>打开抽奖大屏 <span aria-hidden="true">↗</span></button></div></div>${demoNote}${renderStats(screen)}
      <div class="lottery-tabs" role="tablist" aria-label="抽奖管理">${[['prizes', '奖项设置', screen.prizes.length], ['pool', '抽奖池名单', screen.people.length], ['winners', '中奖记录', screen.winners.length]].map(([key, label, count]) => `<button type="button" id="lottery-tab-${key}" role="tab" aria-selected="${tab === key}" aria-controls="lottery-panel-${key}" tabindex="${tab === key ? 0 : -1}" class="${tab === key ? 'is-active' : ''}" data-lottery-tab="${key}">${label}<span>${count}</span></button>`).join('')}</div>
      <section class="lottery-section" id="lottery-panel-${tab}" role="tabpanel" aria-labelledby="lottery-tab-${tab}" tabindex="0">${tab === 'prizes' ? renderPrizes(screen) : tab === 'pool' ? renderPool(screen) : renderWinners(screen)}</section>`;
  }
  function renderPrizes(screen) {
    const eligible = eligiblePeople(screen).length;
    return `<div class="lottery-section-head"><div><h3>奖项设置</h3><p class="lottery-muted">设置奖品与名额，抽奖后自动扣减剩余数量。</p></div><button type="button" class="lottery-btn" data-lottery-action="add-prize">＋ 添加奖项</button></div>${eligible < remainingSlots(screen) ? `<p class="lottery-inline-warning"><span aria-hidden="true">ⓘ</span> 当前可抽人数 ${eligible} 人，少于剩余名额 ${remainingSlots(screen)} 个。可前往<button type="button" class="lottery-link" data-lottery-tab="pool">抽奖池名单</button>导入更多参与人。</p>` : ''}
      <div class="lottery-prize-grid">${screen.prizes.map((prize, index) => {
        const won = wonFor(screen, prize.id), left = prize.total - won;
        return `<article class="lottery-prize-card" data-prize-index="${index % 3}"><div class="lottery-prize-card-top"><span class="lottery-prize-badge">${escapeHTML(prize.level)}</span><div class="lottery-prize-icon">${giftIcon}</div></div><h3>${escapeHTML(prize.name)}</h3><p class="lottery-prize-name">${left ? '等待幸运时刻' : '本奖项已抽完'}</p><div class="lottery-prize-counts"><div><strong>${prize.total}</strong><span>总名额</span></div><div><strong>${won}</strong><span>已抽出</span></div><div><strong>${left}</strong><span>剩余</span></div></div><div class="lottery-progress" role="progressbar" aria-label="${escapeHTML(prize.level)}抽取进度" aria-valuemin="0" aria-valuemax="${prize.total}" aria-valuenow="${won}"><span style="width:${Math.min(100, won / prize.total * 100)}%"></span></div><div class="lottery-card-actions">${btn('edit-prize', '编辑奖项', `data-id="${escapeHTML(prize.id)}"`)}<button type="button" class="lottery-btn is-quiet" data-lottery-action="delete-prize" data-id="${escapeHTML(prize.id)}" ${won ? 'disabled title="已有中奖记录的奖项不可删除"' : ''}>删除</button></div></article>`;
      }).join('')}<button type="button" class="lottery-add-card" data-lottery-action="add-prize"><span class="lottery-add-icon" aria-hidden="true">＋</span><strong>添加奖项</strong><span>设置更多惊喜</span></button></div>`;
  }
  function searchPeople(items, query) {
    const needle = query.toLocaleLowerCase();
    return needle ? items.filter(item => `${item.name} ${item.company} ${item.phone}`.toLocaleLowerCase().includes(needle)) : items;
  }
  function pagination(page, total, kind) {
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    return `<div class="lottery-pagination" tabindex="-1"><span>共 ${total} 条 · 每页 ${PAGE_SIZE} 条</span><div><button type="button" class="lottery-btn is-small" aria-label="上一页" data-lottery-action="${kind}-page" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}>上一页</button><span aria-live="polite">${page} / ${pages}</span><button type="button" class="lottery-btn is-small" aria-label="下一页" data-lottery-action="${kind}-page" data-page="${page + 1}" ${page >= pages ? 'disabled' : ''}>下一页</button></div></div>`;
  }
  function renderPool(screen) {
    const rows = searchPeople(screen.people, poolQuery);
    poolPage = Math.min(poolPage, Math.max(1, Math.ceil(rows.length / PAGE_SIZE)));
    const won = new Set(screen.winners.map(winner => winner.personId));
    return `<div class="lottery-section-head"><div><h3>抽奖池名单</h3><p class="lottery-muted">每位参与人最多中奖一次；已中奖人员自动排除后续抽取。</p></div><div class="lottery-actions">${btn('download-template', '下载导入模板')}<button type="button" class="lottery-btn is-primary" data-lottery-action="import-people">导入名单</button></div></div>
      <form class="lottery-filters" data-lottery-form="pool-search"><label class="lottery-field"><span>关键词</span><input type="search" name="query" value="${escapeHTML(poolQuery)}" maxlength="120" placeholder="搜索姓名、公司或手机号" aria-label="搜索抽奖池名单"></label><button class="lottery-btn is-primary" type="submit">搜索</button><button class="lottery-btn is-quiet" type="button" data-lottery-action="reset-pool">重置</button><span class="lottery-filter-summary">${poolQuery ? `筛选 ${rows.length} / ${screen.people.length} 人` : `${screen.people.length} 位参与人`} · ${eligiblePeople(screen).length} 人可抽</span></form>
      ${rows.length ? `<div class="lottery-table-wrap"><table class="lottery-table"><thead><tr><th scope="col">姓名</th><th scope="col">公司</th><th scope="col">手机号</th><th scope="col">抽奖状态</th></tr></thead><tbody>${rows.slice((poolPage - 1) * PAGE_SIZE, poolPage * PAGE_SIZE).map(person => `<tr><td><span class="lottery-person-avatar" aria-hidden="true">${escapeHTML(person.name.slice(0, 1))}</span><strong>${escapeHTML(person.name)}</strong></td><td>${escapeHTML(person.company || '—')}</td><td class="lottery-numeric">${escapeHTML(maskPhone(person.phone))}</td><td><span class="lottery-row-status ${won.has(person.id) ? 'is-won' : ''}">${won.has(person.id) ? '已中奖' : '待抽取'}</span></td></tr>`).join('')}</tbody></table></div>${pagination(poolPage, rows.length, 'pool')}` : `<div class="lottery-empty"><div class="lottery-empty-icon">${peopleIcon}</div><h3>${poolQuery ? '没有找到匹配的参与人' : '还没有参与人'}</h3><p>${poolQuery ? '试试其他关键词，或重置搜索条件。' : '使用 CSV 模板导入姓名、公司与手机号，即可准备抽奖。'}</p><div class="lottery-empty-actions">${poolQuery ? btn('reset-pool', '重置搜索') : '<button type="button" class="lottery-btn is-primary" data-lottery-action="import-people">导入名单</button>'}</div></div>`}`;
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
    viewRoot.innerHTML = view === 'list' ? renderList() : renderDetail(screen);
  }
  function resetFilters() { poolQuery = ''; winnerQuery = ''; winnerPrize = ''; poolPage = 1; winnerPage = 1; }
  function switchTab(next) { if (!['prizes', 'pool', 'winners'].includes(next)) return; tab = next; render(); root.querySelector(`#lottery-tab-${next}`)?.focus(); }

  function restoreFocus(opener, fallback) {
    if (opener?.isConnected) { opener.focus(); return; }
    let target;
    if (fallback) target = root.querySelector(`${fallback}:not(:disabled)`);
    (target || root.querySelector(`[data-lottery-tab="${tab}"]`) || root.querySelector('[data-lottery-action="new-screen"]'))?.focus();
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
    const dialog = openDialog(screen ? '编辑大屏名称' : '新建抽奖大屏', `<div class="lottery-form"><input type="hidden" name="id" value="${escapeHTML(screen?.id || '')}"><label>大屏名称 <span class="lottery-required">*</span><input autofocus name="name" required maxlength="80" placeholder="例如：年度盛典抽奖" value="${escapeHTML(screen?.name || '')}"></label><p class="lottery-muted">创建后可添加奖项并导入名单。所有数据仅用于当前浏览器中的原型演示。</p></div>`, `${cancelButton}${submitButton(screen ? '保存修改' : '创建大屏')}`, {form: 'screen-editor', fallback: '[data-lottery-action="new-screen"]'});
    dialog?.querySelector('input[name="name"]')?.focus();
  }
  function prizeEditor(id) {
    const screen = currentScreen(); if (!screen) return;
    const prize = screen.prizes.find(item => item.id === id);
    const min = prize ? Math.max(1, wonFor(screen, prize.id)) : 1;
    const dialog = openDialog(prize ? '编辑奖项' : '添加奖项', `<div class="lottery-form"><input type="hidden" name="id" value="${escapeHTML(prize?.id || '')}"><label>奖项等级 <span class="lottery-required">*</span><input name="level" autofocus required maxlength="20" value="${escapeHTML(prize?.level || '')}" placeholder="例如：一等奖"></label><label>奖品名称 <span class="lottery-required">*</span><input name="name" required maxlength="80" value="${escapeHTML(prize?.name || '')}" placeholder="例如：蓝牙耳机"></label><label>中奖名额 <span class="lottery-required">*</span><input name="total" type="number" required min="${min}" max="10000" step="1" value="${prize?.total || 1}"></label><p class="lottery-muted">名额须为 1–10,000 的整数${prize && min > 1 ? `，且不能少于已抽出的 ${min} 人` : prize && wonFor(screen, prize.id) ? '，且不能少于已中奖人数' : ''}。</p></div>`, `${cancelButton}${submitButton(prize ? '保存修改' : '添加奖项')}`, {form: 'prize-editor', fallback: '[data-lottery-action="add-prize"]'});
    dialog?.querySelector('input[name="level"]')?.focus();
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
  function parseCSV(source) {
    const text = source.replace(/^\uFEFF/, ''), rows = [];
    let row = [], cell = '', inQuotes = false, closedQuote = false;
    function endCell() { row.push(cell); cell = ''; closedQuote = false; }
    function endRow() { endCell(); rows.push(row); row = []; }
    for (let index = 0; index < text.length; index++) {
      const char = text[index];
      if (inQuotes) {
        if (char === '"') { if (text[index + 1] === '"') { cell += '"'; index++; } else { inQuotes = false; closedQuote = true; } }
        else cell += char;
      } else if (char === '"') {
        if (cell.length || closedQuote) throw new Error('CSV 引号格式不正确，请使用模板另存为 UTF-8 CSV。');
        inQuotes = true;
      } else if (char === ',') endCell();
      else if (char === '\n' || char === '\r') { endRow(); if (char === '\r' && text[index + 1] === '\n') index++; }
      else if (closedQuote && !/\s/.test(char)) throw new Error('CSV 引号后存在无效字符，请检查文件。');
      else if (!closedQuote) cell += char;
    }
    if (inQuotes) throw new Error('CSV 中有未闭合的引号，请检查文件。');
    if (cell.length || row.length || closedQuote) endRow();
    return rows;
  }
  function personKey(person) { return person.phone.trim() ? `phone:${person.phone.replace(/[\s()-]/g, '')}` : `person:${person.name.trim().toLocaleLowerCase()}|${person.company.trim().toLocaleLowerCase()}`; }
  function importDialog() {
    openDialog('导入抽奖池名单', `<div class="lottery-form"><p>上传 UTF-8 编码的 <strong>.csv</strong> 文件，首行必须包含「姓名、公司、手机号」三列，顺序可调整。</p><p class="lottery-muted">姓名必填，公司和手机号可留空。支持带引号的逗号与换行；按手机号去重，没有手机号时按姓名＋公司去重。已有名单将保留。</p><button type="button" class="lottery-btn" data-lottery-action="download-template">下载 CSV 模板</button><label>选择 CSV 文件 <span class="lottery-required">*</span><input name="file" type="file" accept=".csv,text/csv" required aria-describedby="lottery-file-help"></label><p class="lottery-muted" id="lottery-file-help">文件不超过 2 MB；每个大屏最多保存 10,000 位参与人。手机号支持 11 位手机号或 138****0000 格式。</p></div>`, `${cancelButton}${submitButton('导入名单')}`, {form: 'import', fallback: '[data-lottery-action="import-people"]'});
  }
  async function importPeople(form) {
    const file = form.elements.file.files[0], screen = currentScreen();
    if (!file || !screen) return;
    if (!/\.csv$/i.test(file.name)) return formError(form, '请选择 .csv 文件。');
    if (file.size > 2 * 1024 * 1024) return formError(form, '文件超过 2 MB，请拆分后导入。');
    const submit = form.querySelector('[type="submit"]'); submit.disabled = true; submit.textContent = '正在导入…'; busy = true;
    try {
      const source = await file.text();
      if (!form.isConnected) return;
      if (source.includes('\uFFFD') || source.includes('\0')) throw new Error('文件编码无法识别，请另存为 UTF-8 CSV 后重试。');
      const rows = parseCSV(source);
      if (!rows.length) throw new Error('文件为空，请下载模板填写后再导入。');
      const headers = rows.shift().map(value => value.trim());
      const nameIndex = headers.indexOf('姓名'), companyIndex = headers.indexOf('公司'), phoneIndex = headers.indexOf('手机号');
      if ([nameIndex, companyIndex, phoneIndex].some(index => index < 0) || new Set(headers).size !== headers.length) throw new Error('表头必须包含且不能重复：姓名、公司、手机号。');
      const keys = new Set(screen.people.map(personKey)), additions = [];
      let skipped = 0, duplicates = 0, invalid = 0;
      rows.forEach(cells => {
        if (cells.every(cell => !cell.trim())) return;
        const person = {id: uid('person'), name: (cells[nameIndex] || '').trim(), company: (cells[companyIndex] || '').trim(), phone: (cells[phoneIndex] || '').trim().replace(/[\s()-]/g, '')};
        if (cells.length !== headers.length || !textValid(person.name, 60) || person.company.length > 120 || person.phone && !/^(?:1\d{10}|1\d{2}\*{4}\d{4})$/.test(person.phone)) { skipped++; invalid++; return; }
        const key = personKey(person);
        if (keys.has(key)) { skipped++; duplicates++; return; }
        keys.add(key); additions.push(person);
      });
      if (screen.people.length + additions.length > 10000) throw new Error('导入后将超过 10,000 位参与人，请减少文件中的人数后重试。');
      screen.people.push(...additions); poolPage = 1; poolQuery = ''; tab = 'pool';
      form.closest('dialog').close();
      saveAndRender(`导入完成：新增 ${additions.length} 人，跳过 ${skipped} 行（重复 ${duplicates} 行、格式无效 ${invalid} 行）。当前共 ${screen.people.length} 位参与人。`);
    } catch (error) { if (form.isConnected) formError(form, error.message || '导入失败，请检查 CSV 格式后重试。'); }
    finally { busy = false; if (submit.isConnected) { submit.disabled = false; submit.textContent = '导入名单'; } }
  }

  function randomIndex(length) {
    if (!globalThis.crypto?.getRandomValues) throw new Error('此浏览器不支持安全随机数，请使用较新的浏览器进行演示。');
    const array = new Uint32Array(1), limit = Math.floor(0x100000000 / length) * length;
    do { globalThis.crypto.getRandomValues(array); } while (array[0] >= limit);
    return array[0] % length;
  }
  function drawOptions(screen, selected) {
    return screen.prizes.map(prize => `<option value="${escapeHTML(prize.id)}" ${prize.id === selected ? 'selected' : ''} ${wonFor(screen, prize.id) >= prize.total ? 'disabled' : ''}>${escapeHTML(prize.level)} · ${escapeHTML(prize.name)}（剩余 ${prize.total - wonFor(screen, prize.id)}）</option>`).join('');
  }
  function stylePicker(mode) {
    return `<div class="lottery-style-picker" role="group" aria-label="抽奖样式">${DRAW_MODES.map(item => `<button type="button" class="lottery-style-option ${item.id === mode ? 'is-active' : ''}" data-lottery-mode="${item.id}" aria-pressed="${item.id === mode}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${item.glyph}</svg><span><strong>${item.label}</strong><small>${item.caption}</small></span></button>`).join('')}</div>`;
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
    return prize ? `剩余 ${prize.total - wonFor(screen, prize.id)} 个名额 · ${eligiblePeople(screen).length} 人可抽 · 此样式每轮最多 ${drawMode(mode).max} 人` : '全部奖项已抽取完毕。';
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
    session.engine = window.MKLotteryEffects.create({host: dialog.querySelector('.lottery-effect-host'), mode: session.mode, people: eligiblePeople(screen).map(person => ({...person})), history: screen.winners.map(winner => ({...winner})), prize, quantity: Number(dialog.querySelector('[name="quantity"]').value) || 1, reducedMotion: session.reducedMotion, onRequestStart: () => toggleDraw(dialog), onRequestStop: () => toggleDraw(dialog)});
    updateDrawControls(dialog);
  }
  function updateDrawControls(dialog) {
    const session = drawSession;
    const screen = state.screens.find(item => item.id === session?.screenId);
    if (!screen || session.closed || !dialog.open) return;
    const select = dialog.querySelector('[name="drawPrize"]');
    let prize = screen.prizes.find(item => item.id === select.value);
    if (!prize || prize.total <= wonFor(screen, prize.id)) prize = screen.prizes.find(item => item.total > wonFor(screen, item.id));
    select.innerHTML = drawOptions(screen, prize?.id);
    const max = prize ? Math.min(prize.total - wonFor(screen, prize.id), eligiblePeople(screen).length, drawMode(session.mode).max) : 0;
    const quantity = dialog.querySelector('[name="quantity"]');
    quantity.max = String(Math.max(1, max));
    quantity.value = String(Math.min(Math.max(1, Number(quantity.value) || 1), Math.max(1, max)));
    const locked = session.phase === 'running' || session.phase === 'settling';
    select.disabled = locked || !max; quantity.disabled = locked || !max;
    dialog.querySelectorAll('[data-lottery-mode], [name="theme"], [name="reducedMotion"], [data-lottery-action="fill-demo"]').forEach(button => { button.disabled = locked; });
    const start = dialog.querySelector('.lottery-start');
    start.disabled = session.phase === 'settling' || !max;
    start.textContent = session.phase === 'running' ? (session.mode === 'eggs' ? '砸开金蛋 · 揭晓结果' : '停止抽奖 · 揭晓结果') : session.phase === 'settling' ? '减速揭晓中…' : !max ? (prize ? '可抽人员已全部中奖' : '全部奖项已抽完') : session.phase === 'revealed' ? '开始下一轮' : '开始抽奖';
    dialog.querySelector('.lottery-draw-availability').textContent = drawAvailability(screen, prize, session.mode);
    dialog.querySelector('.lottery-current-style').textContent = drawMode(session.mode).label;
    const displayedPrize = session.phase === 'revealed' && session.resultPrize ? session.resultPrize : prize;
    dialog.querySelector('.lottery-round-prize').textContent = displayedPrize ? `${displayedPrize.level} · ${displayedPrize.name}` : '本轮抽奖已结束';
    if (!max && !locked) dialog.querySelectorAll('[data-fx-action="toggle"]').forEach(button => { button.disabled = true; button.textContent = '本轮已结束'; button.setAttribute('aria-label', '没有可抽取的人员或奖项'); });
    dialog.querySelector('.lottery-presentation-footer-count').textContent = `可抽 ${eligiblePeople(screen).length} 人 · 已中奖 ${screen.winners.length} 人`;
    dialog.querySelector('.lottery-motion-note').textContent = session.reducedMotion ? '减少动态效果已开启：保留结果与状态，跳过快速旋转和滚动。' : session.phase === 'running' && session.mode === 'eggs' ? '请选择舞台上的任意金蛋，或点击“砸开金蛋”揭晓。' : '空格开始 / 停止 · F 全屏 · Esc 退出 / 返回';
    session.selectedPrize = prize?.id || '';
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
  function drawDialog() {
    if (dialogs.querySelector('dialog[open]')) return;
    const screen = currentScreen(); if (!screen) return;
    if (!window.MKLotteryEffects?.create) { notify('抽奖动效组件未能加载，请刷新页面后重试。', true); return; }
    const prize = screen.prizes.find(item => item.total > wonFor(screen, item.id));
    if (!prize || !eligiblePeople(screen).length) { notify('请先设置剩余奖项，并准备尚未中奖的参与名单。', true); return; }
    const session = {...presentationFor(screen), screenId: screen.id, phase: 'idle', selectedPrize: prize.id, closed: false, engine: null, roundId: null};
    drawSession = session;
    const dialog = openDialog('现场抽奖大屏', `<div class="lottery-draw-layout"><section class="lottery-presentation" data-phase="idle" aria-label="抽奖展示舞台"><header class="lottery-presentation-header"><div><span class="lottery-stage-kicker">LUCKY MOMENT <span>·</span> <span class="lottery-current-style">${drawMode(session.mode).label}</span></span><h3>${escapeHTML(screen.name)}</h3><p class="lottery-round-prize">${escapeHTML(prize.level)} · ${escapeHTML(prize.name)}</p></div><span class="lottery-live-status" role="status">准备就绪</span></header><div class="lottery-effect-host"></div><footer class="lottery-presentation-footer"><span class="lottery-presentation-footer-count">可抽 ${eligiblePeople(screen).length} 人</span><span>演示模式 · 每人仅中奖一次</span></footer></section><aside class="lottery-draw-controls" aria-label="抽奖控制台"><div class="lottery-control-heading"><h3>抽奖控制台</h3><span class="lottery-control-step">01 / 选择样式</span></div>${stylePicker(session.mode)}<div class="lottery-appearance-row"><label class="lottery-field"><span>舞台主题</span><select name="theme"><option value="festival" ${session.theme === 'festival' ? 'selected' : ''}>红金盛典</option><option value="midnight" ${session.theme === 'midnight' ? 'selected' : ''}>深蓝星光</option></select></label><label class="lottery-motion-toggle"><input type="checkbox" name="reducedMotion" ${session.reducedMotion ? 'checked' : ''}>减少动态效果</label></div><div class="lottery-control-divider"></div><span class="lottery-control-step">02 / 设置本轮</span><label class="lottery-field"><span>选择奖项</span><select name="drawPrize">${drawOptions(screen, prize.id)}</select></label><label class="lottery-field"><span>本轮抽取人数</span><input type="number" name="quantity" min="1" max="${Math.min(prize.total, eligiblePeople(screen).length, drawMode(session.mode).max)}" step="1" value="1" required></label><p class="lottery-draw-availability lottery-muted"></p><button type="button" class="lottery-btn is-primary lottery-start" data-lottery-action="toggle-draw">开始抽奖</button><p class="lottery-motion-note"></p>${screen.id === 'screen-annual-demo' && samplePeople().some(person => !screen.people.some(existing => existing.id === person.id)) ? '<button type="button" class="lottery-btn lottery-demo-fill" data-lottery-action="fill-demo">补齐内置示例人员</button>' : ''}<details class="lottery-motion-spec"><summary>交互与研发说明</summary><p>开始仅播放动效；停止时统一抽取并保存本轮结果，再减速揭晓。切换样式不重新抽取已揭晓结果。</p><p>滚动时关闭取消本轮；停止后关闭，已保存记录保留。转盘超过 12 人按分组展示，中奖对象仍是个人。</p><a href="./lottery-motion-guide.html" target="_blank" rel="noopener">打开动效与接口说明 ↗</a></details></aside></div>`, '', {className: 'lottery-draw-dialog lottery-effects-dialog', form: 'draw', description: '七种展示形式 · 共用奖项、名单与中奖记录', fallback: '[data-lottery-action="open-draw"]', onClose: () => { const committed = session.phase === 'settling'; disposeDrawSession(session); render(); if (committed) notify(session.saved === false ? '本轮结果已生成，但本地保存失败；请及时导出中奖记录。' : '本轮结果已保存，可在“中奖记录”中查看。'); }});
    if (!dialog) { disposeDrawSession(session); return; }
    dialog.dataset.theme = session.theme;
    dialog.dataset.reducedMotion = String(session.reducedMotion);
    dialog.dataset.phase = 'idle';
    const header = dialog.querySelector('.lottery-dialog-head'), close = header.querySelector('.lottery-close');
    const headerActions = document.createElement('div'); headerActions.className = 'lottery-display-actions';
    headerActions.innerHTML = '<button type="button" data-lottery-action="toggle-controls" aria-expanded="true">收起控制台</button><button type="button" data-lottery-action="fullscreen">进入全屏</button>';
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
        const max = prize ? Math.min(prize.total - wonFor(screen, prize.id), eligiblePeople(screen).length, drawMode(session.mode).max) : 0;
        if (!prize || !Number.isInteger(quantity) || quantity < 1 || quantity > max) { formError(form, `本轮人数必须是 1–${max} 的整数。`); return; }
        if (!globalThis.crypto?.getRandomValues) { formError(form, '此浏览器不支持安全随机数，请更换浏览器后演示。'); return; }
        form.querySelector('.lottery-form-error').hidden = true;
        session.selectedPrize = prize.id; session.quantity = quantity; session.roundId = uid('round');
        session.engine.reset({people: eligiblePeople(screen).map(person => ({...person})), history: screen.winners.map(winner => ({...winner})), prize, quantity});
        setDrawPhase(dialog, session, 'running'); session.engine.start(); updateDrawControls(dialog);
        return;
      }
      if (session.phase !== 'running') return;
      setDrawPhase(dialog, session, 'settling');
      updateDrawControls(dialog);
      const prize = screen.prizes.find(item => item.id === session.selectedPrize), pool = eligiblePeople(screen);
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
    if (action === 'screen-list') { view = 'list'; render(); root.querySelector('[data-lottery-action="new-screen"]')?.focus(); }
    else if (action === 'new-screen') screenEditor();
    else if (action === 'edit-screen') screenEditor(id);
    else if (action === 'delete-screen') confirmDelete('screen', id);
    else if (action === 'open-screen') { selectedScreenId = id; view = 'detail'; tab = 'prizes'; resetFilters(); render(); root.querySelector('[data-lottery-action="screen-list"]')?.focus(); }
    else if (action === 'add-prize') prizeEditor();
    else if (action === 'edit-prize') prizeEditor(id);
    else if (action === 'delete-prize') confirmDelete('prize', id);
    else if (action === 'reset-pool') { poolQuery = ''; poolPage = 1; render(); root.querySelector('[data-lottery-form="pool-search"] input')?.focus(); }
    else if (action === 'reset-winners') { winnerQuery = ''; winnerPrize = ''; winnerPage = 1; render(); root.querySelector('[data-lottery-form="winner-search"] input')?.focus(); }
    else if (action === 'pool-page' || action === 'winner-page') { const page = Number(button.dataset.page); if (action === 'pool-page') poolPage = Math.max(1, page); else winnerPage = Math.max(1, page); render(); root.querySelector('.lottery-pagination')?.focus({preventScroll: true}); root.querySelector('.lottery-table-wrap')?.scrollIntoView({block: 'nearest'}); }
    else if (action === 'download-template') { downloadCSV('抽奖名单导入模板.csv', [['姓名', '公司', '手机号'], ['示例参与人', '示例公司', '13800000001']]); notify('已下载 CSV 模板，请替换示例行后导入。'); }
    else if (action === 'import-people') importDialog();
    else if (action === 'export-winners') {
      const screen = currentScreen(); if (!screen) return;
      const rows = searchPeople(screen.winners.filter(winner => !winnerPrize || winner.prizeId === winnerPrize), winnerQuery).slice().reverse();
      if (!rows.length) return;
      downloadCSV('抽奖中奖记录.csv', [['姓名', '奖项等级', '奖品名称', '公司', '手机号', '抽奖时间'], ...rows.map(winner => [winner.name, winner.level, winner.prizeName, winner.company, maskPhone(winner.phone), timeLabel(winner.drawnAt)])]); notify(`已导出当前筛选的 ${rows.length} 条中奖记录，手机号使用掩码显示。`);
    }
    else if (action === 'open-draw') drawDialog();
    else if (action === 'toggle-draw') toggleDraw(button.closest('dialog'));
  });
  root.addEventListener('change', event => {
    const session = drawSession;
    if (!session || !['idle','revealed'].includes(session.phase)) return;
    const dialog = event.target.closest('dialog'), screen = currentScreen(); if (!dialog || !screen) return;
    if (event.target.matches('[name="theme"]')) { session.theme = event.target.value === 'midnight' ? 'midnight' : 'festival'; dialog.dataset.theme = session.theme; savePresentation(screen, session); }
    else if (event.target.matches('[name="reducedMotion"]')) { session.reducedMotion = event.target.checked; dialog.dataset.reducedMotion = String(session.reducedMotion); savePresentation(screen, session); }
    else if (!event.target.matches('[name="drawPrize"], [name="quantity"]')) return;
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
    if (kind === 'draw') return;
    if (kind === 'pool-search') { poolQuery = String(data.get('query') || '').trim(); poolPage = 1; render(); root.querySelector('[data-lottery-form="pool-search"] input')?.focus(); return; }
    if (kind === 'winner-search') { winnerQuery = String(data.get('query') || '').trim(); winnerPrize = String(data.get('prize') || ''); winnerPage = 1; render(); root.querySelector('[data-lottery-form="winner-search"] input')?.focus(); return; }
    if (kind === 'import') { importPeople(form); return; }
    if (kind === 'screen-editor') {
      const id = String(data.get('id') || ''), name = String(data.get('name') || '').trim();
      if (!textValid(name, 80)) { formError(form, '请填写 1–80 个字符的大屏名称。'); return; }
      if (id) { const edited = state.screens.find(item => item.id === id); if (!edited) return; form.dataset.committed = 'true'; edited.name = name; }
      else { if (state.screens.length >= 100) { formError(form, '当前浏览器最多保存 100 个大屏。'); return; } form.dataset.committed = 'true'; const added = {id: uid('screen'), name, createdAt: new Date().toISOString(), people: [], prizes: [], winners: []}; state.screens.push(added); selectedScreenId = added.id; view = 'detail'; tab = 'prizes'; resetFilters(); }
      form.closest('dialog').close(); saveAndRender(id ? '大屏名称已更新。' : '大屏已创建。接下来设置奖项并导入名单。');
    } else if (kind === 'prize-editor' && screen) {
      const id = String(data.get('id') || ''), name = String(data.get('name') || '').trim(), level = String(data.get('level') || '').trim(), total = Number(data.get('total'));
      const existing = screen.prizes.find(prize => prize.id === id), minimum = existing ? Math.max(1, wonFor(screen, id)) : 1;
      if (!textValid(name, 80) || !textValid(level, 20) || !Number.isSafeInteger(total) || total < minimum || total > 10000) { formError(form, `请填写奖项等级、奖品名称，中奖名额须为 ${minimum}–10,000 的整数。`); return; }
      if (existing) { form.dataset.committed = 'true'; Object.assign(existing, {name, level, total}); }
      else { if (screen.prizes.length >= 100) { formError(form, '每个大屏最多设置 100 个奖项。'); return; } form.dataset.committed = 'true'; screen.prizes.push({id: uid('prize'), name, level, total}); }
      tab = 'prizes'; form.closest('dialog').close(); saveAndRender(existing ? '奖项已更新；历史中奖记录保留抽奖时的奖品名称。' : '奖项已添加。');
    } else if (kind === 'delete') {
      const id = String(data.get('id') || '');
      if (data.get('kind') === 'screen') { form.dataset.committed = 'true'; state.screens = state.screens.filter(item => item.id !== id); if (selectedScreenId === id) { selectedScreenId = state.screens[0]?.id || null; view = 'list'; resetFilters(); } }
      else if (screen) { if (wonFor(screen, id)) { formError(form, '该奖项已有中奖记录，无法删除。'); return; } form.dataset.committed = 'true'; screen.prizes = screen.prizes.filter(prize => prize.id !== id); }
      form.closest('dialog').close(); saveAndRender('已删除。');
    }
  });
  window.mkLottery = Object.freeze({
    open: () => { if (currentScreen()) view = 'detail'; render(); },
    showList: () => { view = 'list'; render(); },
    showPrizes: () => { view = 'detail'; tab = 'prizes'; render(); },
    openDraw: drawDialog,
    closeDialogs: () => { dialogs.querySelectorAll('dialog[open]').forEach(dialog => dialog.close()); }
  });
  window.addEventListener('pagehide', () => { dialogs.querySelectorAll('dialog[open]').forEach(dialog => dialog.close()); if (drawSession) disposeDrawSession(drawSession); });
  render();
  if (storageWarning) notify(storageWarning, true);
  if (new URLSearchParams(location.search).get('lotteryDemo') === '1' && location.hash.startsWith('#activityDetail/lottery')) queueMicrotask(drawDialog);
})();
