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
  ].map(([name, company, phone], index) => ({id: `sample-person-${index + 1}`, name, company, phone}));
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
  let busy = false, drawTimer = null, drawSession = null;

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
  function stagePeople(screen, rolling) {
    const names = eligiblePeople(screen);
    if (!names.length) return '<p class="lottery-stage-empty">名单中的参与人已全部中奖</p>';
    const offset = rolling ? Math.floor(Date.now() / 120) % names.length : 0;
    return Array.from({length: Math.min(names.length, 30)}, (_, index) => {
      const person = names[(index + offset) % names.length];
      return `<span class="lottery-stage-name" style="--person-index:${index};--person-count:${Math.min(names.length, 30)}">${escapeHTML(person.name)}</span>`;
    }).join('');
  }
  function drawDialog() {
    const screen = currentScreen(); if (!screen) return;
    const prize = screen.prizes.find(item => item.total > wonFor(screen, item.id));
    if (!prize || !eligiblePeople(screen).length) { notify('请先设置剩余奖项，并准备尚未中奖的参与名单。', true); return; }
    drawSession = {screenId: screen.id, running: false, mode: '2d', selectedPrize: prize.id};
    const dialog = openDialog('抽奖大屏', `<div class="lottery-draw-layout"><div class="lottery-stage"><div class="lottery-stage-header"><span class="lottery-demo-badge">演示模式</span><h3>${escapeHTML(screen.name)}</h3><p>每人仅中奖一次 · 使用浏览器随机数演示抽奖</p></div><div class="lottery-stage-orb"><div class="lottery-stage-names">${stagePeople(screen, false)}</div></div><div class="lottery-stage-result" role="status" aria-live="polite"><p class="lottery-stage-hint">准备就绪，点击开始抽奖</p></div><p class="lottery-stage-footer">当前可抽 ${eligiblePeople(screen).length} 人 · 本大屏仅为原型演示</p></div><div class="lottery-draw-controls"><h3>抽奖控制</h3><div class="lottery-field"><span id="lottery-mode-label">展示模式</span><div class="lottery-mode-switch" role="group" aria-labelledby="lottery-mode-label"><button type="button" class="is-active" aria-pressed="true" data-lottery-mode="2d">2D 列表</button><button type="button" aria-pressed="false" data-lottery-mode="3d">3D 球形</button></div></div><label class="lottery-field"><span>选择奖项</span><select name="drawPrize">${drawOptions(screen, prize.id)}</select></label><label class="lottery-field"><span>本轮抽取人数</span><input type="number" name="quantity" min="1" max="${Math.min(prize.total - wonFor(screen, prize.id), eligiblePeople(screen).length)}" step="1" value="1" required></label><p class="lottery-draw-availability lottery-muted">${drawAvailability(screen, prize)}</p><button type="button" class="lottery-btn is-primary lottery-start" data-lottery-action="toggle-draw">开始抽奖</button><p class="lottery-muted lottery-draw-help">点击开始滚动名单，再点击停止抽奖揭晓本轮结果。关闭大屏将取消正在进行的滚动。</p><button type="button" class="lottery-btn" data-lottery-action="close-dialog">返回管理页面</button></div></div>`, '', {className: 'lottery-draw-dialog', form: 'draw', description: '2D / 3D 展示共享同一份名单与抽奖记录', fallback: '[data-lottery-action="open-draw"]', onClose: () => { clearInterval(drawTimer); drawTimer = null; drawSession = null; render(); }});
    return dialog;
  }
  function drawAvailability(screen, prize) { return `该奖项剩余 ${prize.total - wonFor(screen, prize.id)} 个名额，当前 ${eligiblePeople(screen).length} 人可抽。`; }
  function updateDrawControls(dialog) {
    const screen = state.screens.find(item => item.id === drawSession?.screenId); if (!screen) return;
    const select = dialog.querySelector('[name="drawPrize"]');
    let prize = screen.prizes.find(item => item.id === select.value);
    if (!prize || prize.total <= wonFor(screen, prize.id)) prize = screen.prizes.find(item => item.total > wonFor(screen, item.id));
    select.innerHTML = drawOptions(screen, prize?.id);
    const max = prize ? Math.min(prize.total - wonFor(screen, prize.id), eligiblePeople(screen).length) : 0;
    const quantity = dialog.querySelector('[name="quantity"]'); quantity.max = String(Math.max(1, max));
    quantity.value = String(Math.min(Math.max(1, Number(quantity.value) || 1), Math.max(1, max)));
    dialog.querySelector('.lottery-draw-availability').textContent = prize ? drawAvailability(screen, prize) : '全部奖项已抽取完毕。';
    const start = dialog.querySelector('.lottery-start'); start.disabled = !max;
    start.textContent = max ? '开始抽奖' : prize ? '可抽人员已全部中奖' : '全部奖项已抽完';
    select.disabled = !max; quantity.disabled = !max;
    dialog.querySelector('.lottery-stage-footer').textContent = `当前可抽 ${eligiblePeople(screen).length} 人 · 本大屏仅为原型演示`;
    drawSession.selectedPrize = prize?.id || '';
  }
  function toggleDraw(dialog) {
    if (!drawSession || busy) return;
    const screen = state.screens.find(item => item.id === drawSession.screenId); if (!screen) return;
    const form = dialog.querySelector('form'), stage = dialog.querySelector('.lottery-stage');
    if (!drawSession.running) {
      const prize = screen.prizes.find(item => item.id === form.elements.drawPrize.value);
      const quantity = Number(form.elements.quantity.value);
      const max = prize ? Math.min(prize.total - wonFor(screen, prize.id), eligiblePeople(screen).length) : 0;
      if (!prize || !Number.isInteger(quantity) || quantity < 1 || quantity > max) { formError(form, `本轮人数必须是 1–${max} 的整数。`); return; }
      if (!globalThis.crypto?.getRandomValues) { formError(form, '此浏览器不支持安全随机数，请更换浏览器后演示。'); return; }
      form.querySelector('.lottery-form-error').hidden = true;
      drawSession.running = true; drawSession.selectedPrize = prize.id; drawSession.quantity = quantity;
      stage.classList.add('is-running');
      dialog.querySelector('.lottery-stage-result').innerHTML = '<p class="lottery-stage-hint">幸运正在靠近…</p>';
      dialog.querySelector('.lottery-start').textContent = '停止抽奖 · 揭晓结果';
      form.elements.drawPrize.disabled = true; form.elements.quantity.disabled = true;
      dialog.querySelectorAll('[data-lottery-mode]').forEach(button => { button.disabled = true; });
      drawTimer = setInterval(() => { if (dialog.isConnected) dialog.querySelector('.lottery-stage-names').innerHTML = stagePeople(screen, true); }, 120);
      return;
    }
    busy = true;
    try {
      clearInterval(drawTimer); drawTimer = null; stage.classList.remove('is-running'); drawSession.running = false;
      const prize = screen.prizes.find(item => item.id === drawSession.selectedPrize), pool = eligiblePeople(screen);
      const count = Math.min(drawSession.quantity, prize.total - wonFor(screen, prize.id), pool.length);
      const winners = [];
      for (let index = 0; index < count; index++) {
        const chosen = pool.splice(randomIndex(pool.length), 1)[0];
        winners.push({id: uid('winner'), personId: chosen.id, prizeId: prize.id, name: chosen.name, company: chosen.company, phone: chosen.phone, prizeName: prize.name, level: prize.level, drawnAt: new Date().toISOString()});
      }
      screen.winners.push(...winners);
      const saved = persist(); render();
      dialog.querySelector('.lottery-stage-names').innerHTML = stagePeople(screen, false);
      dialog.querySelector('.lottery-stage-result').innerHTML = `<p class="lottery-result-label">恭喜获得 ${escapeHTML(prize.level)} · ${escapeHTML(prize.name)}</p><div class="lottery-winner-names">${winners.map(winner => `<strong>${escapeHTML(winner.name)}</strong>`).join('')}</div><p>${winners.length} 位获奖人${saved ? ' · 已保存中奖记录' : ' · 本地保存失败，请及时导出记录'}</p>`;
      dialog.querySelectorAll('[data-lottery-mode]').forEach(button => { button.disabled = false; });
      updateDrawControls(dialog);
    } catch (error) { formError(form, error.message || '抽奖暂时未能完成，请重试。'); updateDrawControls(dialog); }
    finally { busy = false; }
  }

  root.addEventListener('click', event => {
    const modeButton = event.target.closest('[data-lottery-mode]');
    if (modeButton && drawSession && !drawSession.running) {
      drawSession.mode = modeButton.dataset.lotteryMode;
      const dialog = modeButton.closest('dialog'); dialog.querySelector('.lottery-stage').classList.toggle('is-3d', drawSession.mode === '3d');
      dialog.querySelectorAll('[data-lottery-mode]').forEach(button => { button.classList.toggle('is-active', button === modeButton); button.setAttribute('aria-pressed', String(button === modeButton)); });
      return;
    }
    const tabButton = event.target.closest('[data-lottery-tab]');
    if (tabButton) { switchTab(tabButton.dataset.lotteryTab); return; }
    const button = event.target.closest('[data-lottery-action]'); if (!button || button.disabled) return;
    const action = button.dataset.lotteryAction, id = button.dataset.id;
    if (action === 'close-dialog') { button.closest('dialog')?.close(); return; }
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
  root.addEventListener('change', event => { if (event.target.matches('[name="drawPrize"]') && drawSession && !drawSession.running) updateDrawControls(event.target.closest('dialog')); });
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
    closeDialogs: () => { dialogs.querySelectorAll('dialog[open]').forEach(dialog => dialog.close()); }
  });
  window.addEventListener('pagehide', () => { clearInterval(drawTimer); drawTimer = null; });
  render();
  if (storageWarning) notify(storageWarning, true);
})();
