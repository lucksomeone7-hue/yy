(() => {
  'use strict';
  const profile = document.getElementById('profileTags');
  const records = [
    {id:'SUB-0908',date:'2026-09-08 10:30',form:'海外业务发展调研',sync:'已更新',text:'客户正在考虑拓展新市场，关注东南亚，希望先了解当地的获客方式。目前使用 Excel 管理客户，尚未确定是否更换现有工具。',qa:[['Are you planning to expand your business into new markets?','考虑中'],['Which markets are you interested in? 您关注哪些市场？','东南亚'],['您希望获得哪些支持？','先了解当地获客方式'],['目前企业系统情况','用 Excel 管理客户，还没想好要不要换']]},
    {id:'SUB-0905',date:'2026-09-05 14:20',form:'制造业数字化专题活动',sync:'已由较新表达替代',text:'客户目前通过邮件与表格协同采购，希望了解供应商协同的实际案例。今年暂无更换系统的计划。',qa:[['当前采购协同方式是什么？','邮件和表格'],['希望了解哪些内容？','供应商协同的实际案例'],['是否有更换系统的计划？','今年暂无计划']]},
    {id:'SUB-0828',date:'2026-08-28 09:45',form:'客户服务需求问卷',sync:'已由较新表达替代',text:'客户希望获取制造业售后服务相关资料，关注工单流转效率，倾向通过邮件接收信息，不希望电话联系。',qa:[['您关注什么问题？','售后工单流转效率'],['希望获取哪些资料？','制造业售后服务资料'],['偏好的联系方式？','邮件，不希望电话联系']]},
    {id:'SUB-0812',date:'2026-08-12 11:00',form:'行业交流活动报名',sync:'已由较新表达替代',text:'客户希望了解制造业数字化案例，本次未说明具体项目或采购计划。',qa:[['参加活动希望了解什么？','制造业数字化案例'],['其他补充信息','']]}
  ];
  const scenario = document.getElementById('expressionScenario');
  const host = document.getElementById('expressionRecords');
  const all = document.getElementById('expressionAll');
  const count = document.getElementById('expressionCount');
  const dialog = document.createElement('dialog'); dialog.className='expression-dialog'; dialog.setAttribute('aria-labelledby','expressionDialogTitle'); document.body.append(dialog);
  const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let returnFocus;
  function close(){dialog.close(); if(returnFocus?.isConnected) returnFocus.focus();}
  function open(title,content){returnFocus=document.activeElement;dialog.innerHTML=`<div class="expression-dialog-head"><h3 id="expressionDialogTitle">${escape(title)}</h3><button class="ghost-button" data-expression-close aria-label="关闭客户表达窗口">关闭</button></div><div class="expression-dialog-body">${content}</div>`;if(!dialog.open)dialog.showModal();}
  dialog.addEventListener('click',e=>{if(e.target.closest('[data-expression-close]'))close();});
  dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  const summaryItems=[...profile.querySelectorAll('.mk-summary-grid article')];
  const factItems=[...profile.querySelectorAll('.profile-field-grid article')];
  const originalSummary=summaryItems.map(e=>e.innerHTML), originalFacts=factItems.map(e=>e.innerHTML);
  const originalStatus=profile.querySelector('.profile-tag-status strong').textContent;
  function identity(employee){
    if(employee){summaryItems.forEach((e,i)=>e.innerHTML=originalSummary[i]);factItems.forEach((e,i)=>e.innerHTML=originalFacts[i]);profile.querySelector('.profile-tag-status strong').textContent=originalStatus;return;}
    const vals=[['统一用户 ID','demo-customer-zhangsan','张三 · 原型示例'],['用户身份','外部客户','customer'],['经营处理','可经营','沿用组织资格规则'],['最近活跃','2 天前','活动问卷提交'],['行为命中总次数','48','行为标签累计命中'],['行为均分','6','近期行为热度参考'],['客户意向分','94','规则计算，与客户表达独立']];
    summaryItems.forEach((e,i)=>{if(vals[i]) e.innerHTML=`<span>${vals[i][0]}</span><strong>${vals[i][1]}</strong><em>${vals[i][2]}</em>`;});
    const facts=[['身份','客户 · customer'],['公司','XX 制造集团'],['部门','采购与供应链中心'],['职位','采购负责人'],['地区','中国上海'],['注册来源','官网活动表单']];
    factItems.slice(0,6).forEach((e,i)=>e.innerHTML=`<span>${facts[i][0]}</span><strong>${facts[i][1]}</strong>`);profile.querySelector('.profile-tag-status strong').textContent='可经营';
  }
  function record(r){return `<article class="expression-record"><div class="expression-meta"><time>${r.date}</time><strong>${escape(r.form)}</strong><span class="expression-badge">AI 整理 · 已生成</span><span class="expression-sync ${r.sync==='已更新'?'':'pending'}">CRM客户表达：${r.sync}</span></div><p>${escape(r.text)}</p><div class="expression-actions"><button data-expression-source="${r.id}">查看原始问答</button></div></article>`;}
  function render(){const mode=scenario.value;identity(mode==='employee');all.hidden=mode!=='customer';count.textContent=mode==='customer'?'4 条有效记录':'';
    if(mode==='customer'){host.innerHTML=records.slice(0,3).map(record).join('');return;}
    if(['waiting_target','sync_failed'].includes(mode)){host.innerHTML=record({...records[0],sync:mode==='waiting_target'?'待关联 CRM 线索':'更新失败 · 自动重试已耗尽'})+'<p class="expression-footnote">'+(mode==='waiting_target'?'客户表达已保存，关联建立后自动更新。':'客户表达已保存，CRM 原有内容保留；异常已记录。')+'</p>';return;}
    const states={employee:['内部员工不参与客户表达整理','原始表单按权限保留，不生成经营摘要或更新 CRM。'],empty:['暂无客户表达记录','该客户暂无已整理的表单记录。'],running:['正在整理客户表达','来源：海外业务发展调研 · 提交于 2026-09-08 10:30。线索原有同步照常运行。'],failed:['客户表达整理失败','原始问答仍可查看，线索原有同步不受影响。自动重试已耗尽，异常已记录。'],validation_failed:['自动校验未通过','自动重生成已耗尽，本次不更新 CRM，已有有效内容保留。'],no_content:['本次提交未提供可整理的客户业务信息','保留原始回答，不更新或清空 CRM 已有有效内容。']};host.innerHTML=`<div class="expression-empty"><strong>${states[mode][0]}</strong><p>${states[mode][1]}</p>${['running','failed','validation_failed','no_content'].includes(mode)?'<button class="ghost-button" data-expression-source="SUB-0908" data-expression-raw-only>查看原始问答</button>':''}</div>`;
  }
  scenario.addEventListener('change',render);
  all.addEventListener('click',()=>open('全部客户表达',`<small>张三 · 4 条记录 · 按提交时间倒序</small>${records.map(record).join('')}`));
  document.addEventListener('click',e=>{
    const source=e.target.closest('[data-expression-source]'); if(!source)return;
    const r=records.find(x=>x.id===source.dataset.expressionSource);if(!r)return;
    const rawOnly=source.hasAttribute('data-expression-raw-only');
    const qa=scenario.value==='no_content'&&rawOnly?[['希望了解哪些内容？',''],['其他补充信息','']]:r.qa;
    open('原始问答',`<small>${escape(r.form)} · ${r.date} · ${r.id} · 原始提交 V1</small>${rawOnly?'':`<h4>客户表达</h4><p>${escape(r.text)}</p>`}<h4>本次表单原文</h4><dl>${qa.map(([q,a])=>`<dt>${escape(q)}</dt><dd>${escape(a||'未填写')}</dd>`).join('')}</dl>`);
  });
  // Both profile routes reuse the same demo records and source dialog.
  const second=document.createElement('section');second.className='work-area expression-module';
  second.innerHTML=`<div class="section-head"><div><h3>客户表达 <span class="expression-count">4 条有效记录</span></h3><span class="module-scope">客户在表单中的实际表达 · 按提交时间保留记录</span></div><button class="ghost-button" data-expression-all>查看全部</button></div>${records.slice(0,3).map(record).join('')}<p class="expression-footnote">CRM 字段展示最新有效表达，完整历史在 MK 保留。示例数据，不执行真实 CRM 写入。</p>`;
  document.querySelector('#customerProfile .customer-profile-summary').after(second);
  second.querySelector('[data-expression-all]').addEventListener('click',()=>open('全部客户表达',`<small>张三 · 4 条记录 · 按提交时间倒序</small>${records.map(record).join('')}`));

  render();
  if(location.hash==='#profileTags') showPage('profileTags');
})();
