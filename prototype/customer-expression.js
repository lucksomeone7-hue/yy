(() => {
  'use strict';
  const profile = document.getElementById('profileTags');
  const records = [
    {id:'SUB-0908',date:'2026-09-08 10:30',form:'海外业务发展调研',sync:'已更新',text:'客户正在考虑拓展新市场，关注东南亚，希望先了解当地的获客方式。目前使用 Excel 管理客户，尚未确定是否更换现有工具。',qa:[['Are you planning to expand your business into new markets?','考虑中'],['Which markets are you interested in? 您关注哪些市场？','东南亚'],['您希望获得哪些支持？','先了解当地获客方式'],['目前企业系统情况','用 Excel 管理客户，还没想好要不要换']]},
    {id:'SUB-0905',date:'2026-09-05 14:20',form:'制造业数字化专题活动',sync:'待关联 CRM',text:'客户目前通过邮件与表格协同采购，希望了解供应商协同的实际案例。今年暂无更换系统的计划。',qa:[['当前采购协同方式是什么？','邮件和表格'],['希望了解哪些内容？','供应商协同的实际案例'],['是否有更换系统的计划？','今年暂无计划']]},
    {id:'SUB-0828',date:'2026-08-28 09:45',form:'客户服务需求问卷',sync:'已更新',text:'客户希望获取制造业售后服务相关资料，关注工单流转效率，倾向通过邮件接收信息，不希望电话联系。',qa:[['您关注什么问题？','售后工单流转效率'],['希望获取哪些资料？','制造业售后服务资料'],['偏好的联系方式？','邮件，不希望电话联系']]},
    {id:'SUB-0812',date:'2026-08-12 11:00',form:'行业交流活动报名',sync:'已更新',text:'客户希望了解制造业数字化案例，本次未说明具体项目或采购计划。',qa:[['参加活动希望了解什么？','制造业数字化案例'],['其他补充信息','']]}
  ];
  const feedback = new Map();
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
  function record(r){return `<article class="expression-record"><div class="expression-meta"><time>${r.date}</time><strong>${escape(r.form)}</strong><span class="expression-badge">AI 整理</span><span class="expression-sync ${r.sync==='已更新'?'':'pending'}">CRM需求文本：${r.sync}</span></div><p>${escape(r.text)}</p><div class="expression-actions"><button data-expression-source="${r.id}">查看原始问答</button><button data-expression-feedback="${r.id}">${feedback.has(r.id)?'已反馈 · 修改反馈':'反馈'}</button></div></article>`;}
  function render(){const mode=scenario.value;identity(mode==='employee');all.hidden=mode!=='customer';count.textContent=mode==='customer'?'4 条有效记录':'';
    if(mode==='customer'){host.innerHTML=records.slice(0,3).map(record).join('');return;}
    const states={employee:['内部员工不参与客户表达整理','原始表单按权限保留，不生成经营摘要或更新 CRM。'],empty:['暂无客户表达记录','该客户暂无已整理的表单记录。'],running:['正在整理客户表达','来源：海外业务发展调研 · 提交于 2026-09-08 10:30。线索原有同步照常运行。'],failed:['客户表达整理失败','原始问答仍可查看，线索原有同步不受影响。请联系管理员重试。'],no_content:['本次提交未提供可整理的客户业务信息','保留原始回答，不向 CRM 写入空泛摘要。']};host.innerHTML=`<div class="expression-empty"><strong>${states[mode][0]}</strong><p>${states[mode][1]}</p></div>`;
  }
  scenario.addEventListener('change',render);
  all.addEventListener('click',()=>open('全部客户表达',`<small>张三 · 4 条记录 · 按提交时间倒序</small>${records.map(record).join('')}`));
  document.addEventListener('click',e=>{
    const source=e.target.closest('[data-expression-source]'),fb=e.target.closest('[data-expression-feedback]'); if(!source&&!fb)return;
    const r=records.find(x=>x.id===(source?.dataset.expressionSource||fb.dataset.expressionFeedback));if(!r)return;
    if(source){open('原始问答',`<small>${escape(r.form)} · ${r.date} · V1</small><h4>客户表达</h4><p>${escape(r.text)}</p><h4>本次表单原文</h4><dl>${r.qa.map(([q,a])=>`<dt>${escape(q)}</dt><dd>${escape(a||'未填写')}</dd>`).join('')}</dl>`);return;}
    const previous=feedback.get(r.id)||{};
    const options=(values,selected)=>'<option value="">请选择</option>'+values.map(x=>`<option ${x===selected?'selected':''}>${x}</option>`).join('');
    open('客户表达反馈',`<p>${escape(r.text)}</p><form id="expressionFeedbackForm"><label>内容是否准确<select name="accuracy">${options(['准确','部分不符','明显不符'],previous.accuracy)}</select></label><label>是否帮助跟进<select name="useful">${options(['有帮助','帮助有限','尚未使用'],previous.useful)}</select></label><label>原因<select name="reason">${options(['更快理解客户','提供沟通切入点','原文理解错误','遗漏重要信息','信息太泛','已经知道','客户情况已变化'],previous.reason)}</select></label><label>补充说明（选填）<textarea name="comment" maxlength="500">${escape(previous.comment||'')}</textarea></label><small>反馈仅在本次原型页面中保存，不写入真实 CRM。</small><p id="expressionFeedbackError" role="alert"></p><button class="primary-button" type="submit">保存反馈</button></form>`);
    document.getElementById('expressionFeedbackForm').addEventListener('submit',ev=>{ev.preventDefault();const values=Object.fromEntries(new FormData(ev.target));const error=document.getElementById('expressionFeedbackError');if(!values.accuracy&&!values.useful){error.textContent='请至少评价一个维度。';return;}if(['部分不符','明显不符'].includes(values.accuracy)&&!values.reason){error.textContent='请选择内容不符的原因。';return;}feedback.set(r.id,values);render();open('反馈已保存','<p role="status">感谢反馈，已关联本条客户表达的 V1 版本。</p><small>本次原型演示不会改变线索同步状态。</small>');});
  });
  render();
  if(location.hash==='#profileTags') showPage('profileTags');
})();
