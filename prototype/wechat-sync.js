/* 公众号文章同步原型。配置、工作流结果和发布记录均保存在当前浏览器。 */
(() => {
  const storageKey = 'mk-wechat-article-sync-v1';
  const workflows = [['extract', '官网文章信息提炼']];
  const industries = [['manufacturing', '制造业'], ['retail', '消费零售'], ['services', '企业服务']];
  const products = [['bip', '用友 BIP'], ['yonsuite', 'YonSuite'], ['u9', 'U9 cloud']];
  const samples = {
    complete: { title: '用友 BIP 助力制造企业打通产供销', summary: '用友 BIP 连接制造企业的采购、生产与销售，帮助团队统一计划、库存和经营数据。', industry: 'manufacturing', product: 'bip', keywords: '用友 BIP，智能制造，产供销协同' },
    review: { title: '制造业数智化交流会纪实', summary: '来自制造业的企业代表围绕工厂运营、供应链协同和数智化实践展开交流。', industry: 'manufacturing', product: '', keywords: '制造业，数智化，供应链协同' },
  };
  const defaults = { rules: { '用友官方服务号': { enabled: true, category: 'brand', workflow: 'extract' } }, records: [] };
  let state;
  try { state = JSON.parse(localStorage.getItem(storageKey)) || defaults; } catch { state = defaults; }
  const persist = () => { try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* 演示可继续在当前页面操作 */ } };
  const categories = contentCategoryRows.articles;
  const label = (entries, id) => entries.find(([value]) => value === id)?.[1] || '';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const options = (entries, selected, empty = '请选择') => `<option value="">${empty}</option>` + entries.map(([id, name, depth]) => `<option value="${id}" ${id === selected ? 'selected' : ''}>${depth === 2 ? '　' : ''}${name}</option>`).join('');
  const time = () => new Date().toLocaleString('zh-CN', { hour12: false });
  const stageNames = { processing: '处理中', review: '待处理', published: '已发布' };
  const pipeline = [
    ['拉取已发布文章', '获取微信原稿'],
    ['补齐发布信息', '提炼行业、产品和 TDK'],
    ['校验并发布', '进入 MK 目标分类'],
  ];

  const dialog = document.createElement('dialog');
  dialog.className = 'wx-sync-dialog';
  dialog.setAttribute('aria-labelledby', 'wxSyncDialogTitle');
  document.body.append(dialog);
  let panel, account, statusMessage, tab = 'settings';

  function records() {
    return state.records.filter(record => record.account === account[0]);
  }

  function showRecord(record) {
    const editable = record.status === 'review';
    const locked = editable ? '' : 'disabled';
    dialog.innerHTML = `<form class="wx-sync-detail">
      <header><div><p>微信文章同步 / 处理详情</p><h3 id="wxSyncDialogTitle">${escape(record.title)}</h3></div><button type="button" class="wx-sync-close" aria-label="关闭">×</button></header>
      <div class="wx-sync-detail-body">
        <div class="wx-sync-meta"><span>${escape(record.account)} · ${escape(label(categories, record.category))}</span><span class="wx-sync-state ${record.status}">${stageNames[record.status]}</span></div>
        <p class="wx-sync-source">${escape(record.summary)}</p>
        <p class="wx-sync-source">处理工作流 · ${escape(label(workflows, record.workflow))}</p>
        ${editable ? '<p class="wx-sync-note warning">原文没有明确提及产品。请选择对应产品后继续发布。</p>' : ''}
        <div class="wx-sync-fields">
          <label>行业领域<select name="industry" required ${locked}>${options(industries, record.industry)}</select></label>
          <label>产品<select name="product" required ${locked}>${options(products, record.product)}</select></label>
          <label class="wide">SEO 标题（T）<input name="seoTitle" value="${escape(record.seoTitle)}" required ${locked}></label>
          <label class="wide">SEO 描述（D）<textarea name="description" rows="3" required ${locked}>${escape(record.description)}</textarea></label>
          <label class="wide">SEO 关键词（K）<input name="keywords" value="${escape(record.keywords)}" required ${locked}></label>
        </div>
      </div>
      <footer><button type="button" class="ghost-button" data-wx-close>关闭</button>${editable ? '<button class="primary-button" type="submit">保存并发布</button>' : ''}</footer>
    </form>`;
    dialog.querySelectorAll('.wx-sync-close,[data-wx-close]').forEach(button => button.onclick = () => dialog.close());
    dialog.querySelector('form').onsubmit = event => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(event.currentTarget));
      Object.keys(values).forEach(key => values[key] = values[key].trim());
      if (Object.values(values).some(value => !value)) return;
      Object.assign(record, values, { status: 'published', reviewed: true, updated: time() });
      persist();
      dialog.close();
      if (panel?.isConnected) {
        const filter = panel.querySelector('[data-wx-filter]');
        if (filter) filter.value = '';
        render();
        [...panel.querySelectorAll('[data-wechat-view]')].find(button => button.dataset.wechatView === record.id)?.focus();
      }
    };
    dialog.showModal();
  }

  function simulate(kind, rule) {
    const id = `${account[0]}:${kind}`;
    if (state.records.some(record => record.id === id)) {
      panel.querySelector('[data-wx-message]').textContent = '该演示文章已同步，已跳过重复导入。';
      return;
    }
    const sample = samples[kind];
    const record = {
      id, account: account[0], category: rule.category, workflow: rule.workflow,
      ...sample, seoTitle: sample.title, description: sample.summary,
      status: 'processing', updated: time(),
    };
    state.records.unshift(record);
    persist();
    tab = 'records';
    render();
    setTimeout(() => {
      record.status = record.product ? 'published' : 'review';
      record.updated = time();
      persist();
      if (panel?.isConnected && tab === 'records') render();
    }, 650);
  }

  function settingsMarkup(rule) {
    return `<section class="wx-sync-card">
      <div class="wx-sync-card-head"><div><h4>文章自动同步</h4><p>微信发文后，MK 定时拉取并处理可同步的已发布图文。</p></div><span class="wx-sync-state ${rule.enabled ? 'published' : 'processing'}">${rule.enabled ? '已启用' : '已关闭'}</span></div>
      <form data-wx-rule>
        <label class="wx-sync-switch"><input name="enabled" type="checkbox" role="switch" ${rule.enabled ? 'checked' : ''}><span>开启自动同步</span></label>
        <div class="wx-sync-fields">
          <label>MK 文章分类<select name="category" ${rule.enabled ? 'required' : ''}>${options(categories, rule.category, '选择目标分类')}</select><small>发布成功后，文章进入该分类下的文章列表。</small></label>
          <label>文章处理工作流<select name="workflow" ${rule.enabled ? 'required' : ''}>${options(workflows, rule.workflow, '选择处理工作流')}</select><small>识别行业领域和产品，提炼 SEO 标题、描述和关键词。</small></label>
        </div>
        <p class="wx-sync-note">必填信息完整且校验通过后自动发布。需补充的信息可在同步记录中处理。</p>
        <footer><button class="primary-button" type="submit">保存配置</button><span role="status" data-wx-saved>${statusMessage || ''}</span></footer>
      </form>
    </section>
    <section class="wx-sync-card wx-sync-demo"><div><h4>演示同步结果</h4><p>模拟后台收到一篇已发布文章，体验成功和待处理两种结果。</p><span role="status" data-wx-message></span></div><div class="wx-sync-demo-actions"><button class="ghost-button" data-wx-demo="complete" ${rule.enabled ? '' : 'disabled'}>模拟正常文章</button><button class="ghost-button" data-wx-demo="review" ${rule.enabled ? '' : 'disabled'}>模拟缺少产品</button></div></section>`;
  }

  function recordRows(filter = '') {
    const rows = records().filter(record => !filter || record.status === filter);
    return rows.map(record => `<tr>
      <td><strong>${escape(record.title)}</strong></td><td>${escape(label(categories, record.category))}</td>
      <td><span class="wx-sync-state ${record.status}">${stageNames[record.status]}</span></td>
      <td>${record.status === 'review' ? '需要补充产品' : record.status === 'processing' ? '工作流正在提炼' : '已保存至 MK 文章列表'}</td>
      <td>${escape(record.updated)}</td>
      <td><button class="text-button" data-wechat-view="${escape(record.id)}">${record.status === 'review' ? '补充并发布' : '查看详情'}</button></td>
    </tr>`).join('') || '<tr><td colspan="6" class="wx-sync-empty">暂无符合条件的同步记录</td></tr>';
  }

  function render() {
    const rule = state.rules[account[0]] || {};
    const reviewCount = records().filter(record => record.status === 'review').length;
    const filter = panel.querySelector('[data-wx-filter]')?.value || '';
    panel.innerHTML = `<button class="back-button" data-wx-back>← 返回公众号列表</button>
      <header class="wx-sync-heading"><div><p>当前公众号</p><h3>${escape(account[0])}</h3></div><span>${escape(account[1])} · ${escape(account[2])}</span></header>
      <div class="wx-sync-tabs" role="group" aria-label="公众号同步管理">
        <button data-wx-tab="settings" aria-pressed="${tab === 'settings'}">营销设置</button>
        <button data-wx-tab="records" aria-pressed="${tab === 'records'}">同步记录${reviewCount ? ` <span>${reviewCount} 待处理</span>` : ''}</button>
      </div>
      ${tab === 'settings' ? `<ol class="wx-sync-pipeline">${pipeline.map(([title, description], index) => `<li><span>${index + 1}</span><div><strong>${title}</strong><small>${description}</small></div></li>`).join('')}</ol>${settingsMarkup(rule)}` : `
      <section class="wx-sync-card wx-sync-records">
        <div class="wx-sync-card-head"><div><h4>文章同步记录</h4><p>查看每篇微信文章在 MK 的处理和发布结果。</p></div><a class="ghost-button" href="#content/articles">查看 MK 文章列表 ↗</a></div>
        <label class="wx-sync-filter">处理状态<select data-wx-filter>${options(Object.entries(stageNames), filter, '全部状态')}</select></label>
        <div class="wx-sync-table-wrap"><table><thead><tr><th>微信文章</th><th>MK 文章分类</th><th>处理状态</th><th>结果说明</th><th>更新时间</th><th>操作</th></tr></thead><tbody>${recordRows(filter)}</tbody></table></div>
      </section>`}`;
    panel.querySelector('[data-wx-back]').onclick = () => {
      panel.hidden = true;
      panel.parentElement.classList.remove('wx-sync-open');
      panel.parentElement.querySelector('[data-wechat-auth]')?.focus();
    };
    panel.querySelectorAll('[data-wx-tab]').forEach(button => button.onclick = () => {
      tab = button.dataset.wxTab;
      statusMessage = '';
      render();
      panel.querySelector(`[data-wx-tab="${tab}"]`).focus();
    });
    const form = panel.querySelector('[data-wx-rule]');
    if (form) {
      const { enabled, category, workflow } = form.elements;
      enabled.onchange = () => { category.required = workflow.required = enabled.checked; };
      form.onsubmit = event => {
        event.preventDefault();
        state.rules[account[0]] = { enabled: enabled.checked, category: category.value, workflow: workflow.value };
        statusMessage = '配置已保存';
        persist();
        render();
        panel.querySelector('[data-wx-rule] button').focus();
      };
      panel.querySelectorAll('[data-wx-demo]').forEach(button => button.onclick = () => simulate(button.dataset.wxDemo, rule));
    }
    const stateFilter = panel.querySelector('[data-wx-filter]');
    if (stateFilter) stateFilter.onchange = () => { panel.querySelector('tbody').innerHTML = recordRows(stateFilter.value); };
  }

  state.records.forEach(record => {
    if (record.status === 'processing') record.status = record.product ? 'published' : 'review';
  });
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-wechat-view]');
    if (trigger) {
      const record = state.records.find(item => item.id === trigger.dataset.wechatView);
      if (record) showRecord(record);
    }
  });
  window.mkWechatSync = {
    open(root, selectedAccount) {
      account = selectedAccount;
      tab = 'settings';
      statusMessage = '';
      panel = root.querySelector('.wx-sync') || root.appendChild(document.createElement('div'));
      panel.className = 'wx-sync';
      panel.hidden = false;
      root.classList.add('wx-sync-open');
      render();
      panel.querySelector('[data-wx-back]').focus();
    },
    articleRows() {
      return state.records.filter(record => record.status === 'published').map(record => [
        escape(label(categories, record.category)), escape(record.title), 'SEO', '微信同步', '—', '—', '—', record.reviewed ? '运营人员' : '自动发布', escape(record.updated), '已上架', escape(record.id),
      ]);
    },
  };
})();
