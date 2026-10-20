/* Evidence-aware marketing views. Scenario actions create local drafts only. */
(() => {
  const escape=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const contact=document.getElementById('profileTags'), account=document.getElementById('account');
  const scenarios={
    complete:{label:'资料与行为较完整',name:'张三',status:'可开展定向培育',known:['XX制造集团 · 采购负责人','近30天访问供应链方案3次、下载资料1次','邮件授权有效，最近触达于10月16日'],missing:['预算、采购时间和决策权限尚未确认'],next:'围绕供应链管理推荐实践案例，根据点击和报名调整后续内容。',action:'创建定向培育草稿',company:'XX制造集团',role:'采购负责人',interest:'供应链管理',score:'94 · 行为意向分',channel:'邮件 · 授权有效',recent:'2026-10-18',behavior:true,expression:true},
    basic:{label:'新联系人 · 基础资料为主',name:'陈晨',status:'可开展初始培育',known:['制造业企业 · 财务岗位','来源：行业活动报名表','邮件授权有效'],missing:['尚无可用的近期互动记录','关注主题、预算与项目计划未知'],next:'按制造业财务岗位推荐入门案例；初次触达后观察响应，再建立兴趣偏好。',action:'创建初始培育草稿',company:'某制造企业',role:'财务岗位',interest:'尚未识别',score:'依据不足 · 暂不分层',channel:'邮件 · 授权有效',recent:'暂无互动记录'},
    behavior:{label:'仅行为 · 身份待补充',name:'匿名访客 V-028',status:'兴趣已发现，身份待补充',known:['近7天访问供应链方案3次','通过自然搜索进入，最近访问于10月19日'],missing:['姓名、企业、职位尚未识别','没有可用于直接发送的渠道'],next:'继续提供供应链相关站内内容，在下载资料或报名时逐步收集企业与角色信息。',action:'保存站内内容建议',company:'尚未关联',role:'尚未识别',interest:'供应链管理（行为推测）',score:'身份未识别 · 暂不纳入联系人分层',channel:'暂无直接触达渠道',recent:'2026-10-19',behavior:true},
    expression:{label:'有客户表达 · 行为少',name:'张三',status:'可围绕明确表达提供内容',known:['客户在表单中表示关注东南亚市场及当地获客方式','希望先了解相关资料，尚未确定更换工具','邮件授权有效'],missing:['近期行为样本不足','预算与采购时间未知'],next:'推荐东南亚市场获客资料；保留“先了解、尚未确定”的表达，不自动认定采购需求。',action:'创建需求响应草稿',company:'XX制造集团',role:'采购负责人',interest:'东南亚市场获客（客户表达）',score:'行为依据不足 · 暂不分层',channel:'邮件 · 授权有效',recent:'暂无近期行为记录',expression:true},
    sparse:{label:'资料与行为均不足',name:'待完善联系人 L-031',status:'先补充识别与触达信息',known:['来源：导入名单','系统有联系人记录，尚无有效企业关联'],missing:['身份、企业、岗位待确认','暂无有效行为和可用触达渠道'],next:'核对名单来源与企业关联，等待客户通过表单或后续互动补充信息；当前不创建发送任务。',action:'创建资料核对待办',company:'尚未关联',role:'未填写',interest:'尚未识别',score:'依据不足 · 暂不分层',channel:'暂无可用渠道',recent:'暂无记录'},
    dormant:{label:'历史活跃 · 近期沉默',name:'刘敏',status:'可尝试重新激活',known:['某服务企业 · 运营岗位','历史关注数字营销，最近互动为2026年6月20日','邮件授权有效，近30天未发送'],missing:['近30天无互动记录','历史兴趣是否仍适用尚未确认'],next:'以一封近期行业内容进行轻量激活，根据响应更新兴趣；无响应时延长触达间隔。',action:'创建重新激活草稿',company:'某服务企业',role:'运营岗位',interest:'数字营销（历史，待确认）',score:'近期无互动 · 不据此判断采购需求',channel:'邮件 · 授权有效',recent:'2026-06-20'}
  };
  let selected='complete';
  const saved=new Map();
  const dialog=document.createElement('dialog');dialog.className='pe-dialog';dialog.setAttribute('aria-labelledby','peDialogTitle');document.body.append(dialog);let focus, pending;
  const card=(title,content)=>`<section class="pe-card"><h3>${title}</h3>${content}</section>`;
  const list=items=>`<ul>${items.map(x=>`<li>${escape(x)}</li>`).join('')}</ul>`;
  function judgment(s){return `<span class="pe-badge">${s.status}</span><div class="pe-columns"><div><strong>已知信息</strong>${list(s.known)}</div><div><strong>待补充 / 判断边界</strong>${list(s.missing)}</div></div><div class="pe-next"><strong>下一步营销建议</strong><p>${s.next}</p></div>`;}
  function setupContact(){
    if(!contact)return;
    // Retain existing customer-expression nodes and handlers; hide obsolete demo modules.
    [...contact.children].forEach(node=>{node.dataset.peOriginal='';node.hidden=true;});
    const view=document.createElement('div');view.id='peContactView';contact.prepend(view);
    function render(){const s=scenarios[selected];
      view.innerHTML=`<div class="pe-switch"><div><strong>联系人画像</strong><br><small>根据现有资料与行为决定营销动作；未知不等于低意向。</small></div><label>数据场景 <select id="peContactScenario">${Object.entries(scenarios).map(([k,v])=>`<option value="${k}" ${k===selected?'selected':''}>${v.label}</option>`).join('')}</select></label></div>${card(s.name,judgment(s)+`<div class="pe-actions"><button class="primary-button" data-pe-action="contact">${s.action}</button>${selected==='complete'||selected==='expression'?'<button class="ghost-button" data-pe-enterprise>查看所属企业</button>':''}</div><p class="pe-status" role="status">${saved.get('contact-'+selected)||''}</p>`)}${card('基础与触达信息',`<div class="pe-fields">${[['所属企业',s.company],['职位 / 角色',s.role],['可触达渠道',s.channel],['最近互动',s.recent],['意向判断',s.score],['资料状态',s.missing.length?'有待补充项':'已核实']].map(([k,v])=>`<article><span>${k}</span><strong>${v}</strong></article>`).join('')}</div><p class="pe-muted">资料完整度与行为意向分分开呈现。无行为记录不自动归为低意向；可触达渠道需在执行任务时再次校验。</p>`)}${card('兴趣与行为依据',`<p><strong>${s.interest}</strong></p>${s.behavior?`<table class="pe-table"><thead><tr><th>时间</th><th>行为</th><th>说明</th></tr></thead><tbody><tr><td>2026-10-19</td><td>访问供应链方案</td><td>近7天3次访问，按内容聚合</td></tr>${selected==='complete'?'<tr><td>2026-10-18</td><td>下载供应链资料</td><td>1次有效下载</td></tr>':''}</tbody></table><p class="pe-muted">内容偏好由行为推测，不代表任职行业或已确认采购需求。</p>`:`<div class="pe-empty">${selected==='dormant'?'保留历史兴趣，当前缺少近期证据。':s.expression?'优先参考下方客户表达，暂不生成行为热度图。':'暂无足够行为依据，后续互动后再更新兴趣；不展示零分图表。'}</div>`}`)}<p class="pe-muted">数据场景均为原型示例，操作仅生成本地会话草稿或待办。</p>`;
      const expression=contact.querySelector('.expression-module');expression.hidden=!s.expression;
      if(s.expression){expression.querySelector('#expressionScenario').value='customer';expression.querySelector('#expressionScenario').dispatchEvent(new Event('change'));expression.querySelector('.expression-demo').hidden=true;}
      view.querySelector('select').addEventListener('change',e=>{selected=e.target.value;render();});
    }render();
  }
  const enterpriseModes={
    coverage:{label:'企业联系人覆盖不足',status:'企业兴趣依据有限',known:['目前仅关联1名有效联系人：采购岗位','该联系人近7天访问供应链方案3次','该联系人邮件授权有效'],missing:['其他相关角色尚未识别','单人兴趣不足以代表企业整体需求'],next:'继续培育现有联系人，并通过活动报名或资料表单补充企业内其他相关角色。',action:'创建角色覆盖待办'},
    basic:{label:'仅有企业基础资料',status:'可规划目标企业培育',known:['已知企业行业及名称','尚未关联有效联系人'],missing:['无有效联系人和直接触达渠道','暂无企业互动记录，无法判断兴趣'],next:'按企业行业选择初始内容，先补充有效联系人；当前不安排直接发送。',action:'创建联系人补充待办'},
    dormant:{label:'企业近期沉默',status:'历史兴趣待重新验证',known:['历史关联4名联系人，2名邮件授权有效','历史关注供应链主题，近30天无互动'],missing:['历史兴趣是否仍有效尚未确认','当前项目计划和采购需求未知'],next:'向授权有效的联系人提供一轮轻量激活内容，观察响应后再更新企业兴趣。',action:'创建企业激活草稿'}
  };
  let companyMode='full';
  function setupAccount(){
    if(!account||account.querySelector('#peAccountState'))return;
    const original=document.createElement('div');original.dataset.peOriginal='';while(account.firstChild)original.append(account.firstChild);account.append(original);
    const panel=document.createElement('div');panel.id='peAccountState';account.prepend(panel);
    function render(){const name=original.querySelector('.account-hero h3')?.textContent||'企业客户';const s=enterpriseModes[companyMode];original.hidden=companyMode!=='full';
      panel.innerHTML=`<div class="pe-switch"><div><strong>企业画像 · 数据覆盖</strong><br><small>人员覆盖和行为证据决定判断范围。</small></div><label>数据场景 <select id="peEnterpriseScenario"><option value="full">资料与行为较完整</option>${Object.entries(enterpriseModes).map(([k,v])=>`<option value="${k}" ${k===companyMode?'selected':''}>${v.label}</option>`).join('')}</select></label></div>${s?card(escape(name),judgment(s)+`<div class="pe-actions"><button class="primary-button" data-pe-action="enterprise">${s.action}</button><button class="ghost-button" data-pe-back>返回企业客户</button></div><p class="pe-status" role="status">${saved.get('enterprise-'+name+'-'+companyMode)||''}</p>`)+card('企业营销覆盖',`<div class="pe-fields">${(companyMode==='coverage'?[['已关联联系人','1人'],['可触达联系人','1人'],['已识别角色','采购'],['近7天活跃','1人'],['企业兴趣','供应链 · 单人依据'],['企业热度','覆盖不足，暂不评级']]:companyMode==='basic'?[['已关联联系人','0人'],['可触达联系人','0人'],['已知信息','企业名称与行业'],['企业兴趣','尚未识别'],['企业热度','依据不足，暂不评级'],['工商信息','其余待补充']]:[['已关联联系人','4人'],['可触达联系人','2人'],['近30天活跃','0人'],['历史兴趣','供应链 · 待验证'],['企业热度','近期无互动记录'],['采购需求','尚未确认']]).map(([k,v])=>`<article><span>${k}</span><strong>${v}</strong></article>`).join('')}</div><p class="pe-muted">覆盖不足、未知和无互动分别呈现，不根据联系人缺失判定低价值。不将单人表达扩写为企业确定需求。</p>`):card('当前依据与判断范围','<span class="pe-badge">可开展定向营销</span><p>已关联12名有效联系人，近30天8人活跃、3名关键角色活跃。可参考多人互动开展内容培育；预算、采购时间及决策权限仍未确认。</p><p class="pe-muted">下方互动指标可切换时间范围。资料缺失项不影响现有有效行为的展示。</p>')}`;
      panel.querySelector('select').value=companyMode;panel.querySelector('select').addEventListener('change',e=>{companyMode=e.target.value;render();});
    }render();
    panel.addEventListener('pe-render',render);
  }
  function close(){dialog.close();if(focus?.isConnected)focus.focus();}
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-pe-enterprise]')){document.querySelectorAll('.company-list-row').forEach(row=>{if(row.children[0].textContent.trim()==='XX 制造集团')row.querySelector('[data-jump="account"]').click();});return;}
    if(e.target.closest('[data-pe-back]')){showPage('companies');return;}
    const action=e.target.closest('[data-pe-action]');if(!action)return;
    const enterprise=action.dataset.peAction==='enterprise',s=enterprise?enterpriseModes[companyMode]:scenarios[selected];
    const name=enterprise?account.querySelector('.account-hero h3')?.textContent||'企业客户':s.name;
    pending={key:enterprise?'enterprise-'+name+'-'+companyMode:'contact-'+selected,label:s.action};focus=action;
    dialog.innerHTML=`<h3 id="peDialogTitle">${s.action}</h3><p>对象：${escape(name)}</p><p>${s.next}</p><label>任务名称<input id="peTaskName" required value="${escape(s.action.replace('创建','').replace('保存',''))}"></label><p class="pe-muted">${s.action.includes('草稿')?'保存后为待配置草稿，后续确认内容、渠道和发送时间。':'保存为资料核对、角色补充或内容建议待办，等待人工处理。'} 本次不执行发送，也不写入内部系统。</p><footer><button class="ghost-button" data-pe-close>取消</button><button class="primary-button" data-pe-save>保存（模拟）</button></footer>`;dialog.showModal();
  });
  dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  dialog.addEventListener('click',e=>{
    if(e.target.closest('[data-pe-close]'))close();
    if(e.target.closest('[data-pe-save]')){const input=dialog.querySelector('input');if(!input.value.trim()){input.value='';input.reportValidity();return;}const message=`已保存「${input.value.trim()}」，仅当前会话有效。`;saved.set(pending.key,message);const target=pending.key.startsWith('contact')?contact:account;target.querySelector('.pe-status').textContent=message;close();}
  });
  setupContact();setupAccount();
  // Account renderer refreshes after switching enterprises or time ranges.
  if(account)new MutationObserver(()=>{if(!account.querySelector('#peAccountState'))setupAccount();}).observe(account,{childList:true});
})();
