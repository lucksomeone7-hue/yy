/* Enterprise marketing insight. All actions below are local prototype previews. */
(() => {
  const page = document.getElementById('account');
  if (!page) return;
  const esc = v => String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const companies = [...document.querySelectorAll('.company-list-row')].map((row,i)=>{
    const cells=[...row.children];
    return {id:`enterprise-${i+1}`,name:cells[0].textContent.trim(),score:cells[1].textContent.trim(),change:cells[3].textContent.trim(),industry:cells[9].textContent.trim(),crm:row.dataset.crm,product:cells[6].textContent.trim(),last:cells[7].textContent.trim(),contracts:cells[8].textContent.trim(),saved:{},sync:'有新动态待同步'};
  });
  if (!companies.length) return;
  let company=companies[0], days=30, dialogFocus;
  const periods={7:{active:3,roles:2,event:1,downloads:1,visits:5},30:{active:8,roles:3,event:5,downloads:4,visits:18},90:{active:12,roles:4,event:9,downloads:7,visits:32}};
  const people=[{name:'张三',role:'采购负责人 · 关键角色',score:94,interest:'财务、供应链云',channel:'邮件',last:'10-18 下载供应链白皮书',touch:'10-16 邮件 · 已点击',eligible:true},{name:'李四',role:'信息化经理 · 关键角色',score:82,interest:'数据分析、智能决策',channel:'邮件、企业微信',last:'10-19 访问智能决策方案',touch:'10-17 企微 · 已访问',eligible:true},{name:'赵敏',role:'业务经理',score:71,interest:'数据分析',channel:'暂无可用渠道',last:'10-17 报名主题活动',touch:'暂无触达记录',eligible:false}];
  const dialog=document.createElement('dialog');dialog.className='am-dialog';dialog.setAttribute('aria-labelledby','amDialogTitle');document.body.append(dialog);
  function close(){dialog.close();dialogFocus?.focus();}
  function open(title,body,confirm){dialogFocus=document.activeElement;dialog.innerHTML=`<header><h3 id="amDialogTitle">${esc(title)}</h3><button class="ghost-button" data-am-close>关闭</button></header>${body}<footer><button class="ghost-button" data-am-close>取消</button>${confirm?`<button class="primary-button" data-am-confirm>${confirm}</button>`:''}</footer>`;dialog.showModal();}
  dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  function render(){
    const p=periods[days], product=company.product==='暂无'?'企业数智化':'智能决策扩容';
    page.innerHTML=`<button class="text-button" data-am="back">← 返回企业客户</button>
      <div class="account-hero"><div><span class="eyebrow">企业营销洞察</span><h3>${esc(company.name)}</h3><p>${esc(company.industry)} · 企业规模暂无数据 · ${esc(company.product==='暂无'?'潜在客户':'历史签约客户')}</p><small class="am-note">CRM ${esc(company.crm)} · 所属销售：${company.crm==='未建档'?'暂未分配':'周一鸣'} · 营销数据截至 2026-10-20 10:00</small></div><div class="account-score"><span>企业意向分</span><strong>${esc(company.score)}</strong><button class="text-button" data-am="score">查看评分口径</button></div></div>
      <div class="am-toolbar"><div><button class="primary-button" data-am="group">加入营销分组</button><button class="ghost-button" data-am="nurture">创建培育任务</button><button class="ghost-button" data-am="sync">同步营销信号</button></div><label>统计范围 <select id="amPeriod" aria-label="统计范围">${[7,30,90].map(d=>`<option value="${d}" ${days===d?'selected':''}>近${d}天</option>`).join('')}</select></label></div>
      <section class="work-area"><div class="section-head"><div><h3>营销互动与意向变化</h3><span class="module-scope">近${days}天 · 按有效外部联系人去重，内部员工不参与</span></div><button class="text-button" data-am="evidence">查看行为依据</button></div><div class="am-metrics"><article><span>活跃联系人</span><strong>${p.active}</strong><small>累计有效联系人 12 人</small></article><article><span>关键角色活跃</span><strong>${p.roles}</strong><small>来自职位与角色标签</small></article><article><span>活动参与人数</span><strong>${p.event}</strong><small>资料下载 ${p.downloads} 次</small></article><article><span>近7天意向变化</span><strong>${esc(company.change)}</strong><small>${company.change.startsWith('-')?'近期降温，建议持续培育':'近期升温，关注内容响应'}</small></article></div><p class="am-note">方案页访问 ${p.visits} 次 · 企业分变化固定对比7天前；行为指标随统计范围切换。</p></section>
      <div class="account-grid"><section class="work-area"><div class="section-head"><h3>企业兴趣偏好</h3><button class="text-button" data-am="evidence">查看依据</button></div><div class="am-interest">${[['数据分析 / 智能决策',80],['财务 / 供应链云',60],['企业数智化案例',40]].map(([s,n])=>`<div><span>${s}</span><div class="am-bar"><i style="width:${n}%"></i></div><small>${Math.max(1,Math.round(p.visits*n/180))}次</small></div>`).join('')}</div><p class="am-note">偏好内容：产品方案、实践案例、白皮书<br>近${days}天已记录访问中的主题命中次数；同一次行为可命中多个主题。</p></section><section class="work-area"><div class="section-head"><h3>营销建议</h3><span class="source-tag ai">AI 辅助</span></div><div class="am-recommend"><strong>围绕${product}开展定向内容培育</strong><p>向张三、李四推荐相关案例或邀请参加主题活动，根据点击和报名情况调整后续内容。</p><p>依据：两名关键角色近期访问方案与下载资料。采购预算、项目计划及决策权限尚未确认。</p></div><div class="am-actions"><button class="primary-button" data-am="content">推荐相关内容</button><button class="ghost-button" data-am="evidence">查看推荐依据</button></div></section></div>
      <section class="work-area"><div class="section-head"><div><h3>企业联系人</h3><span class="module-scope">12 名有效联系人 · 展示近期活跃的 3 人 · 内部员工已排除</span></div><button class="text-button" data-am="people">查看全部联系人</button></div><div class="am-contact-wrap"><table class="am-contact"><thead><tr><th>联系人 / 角色</th><th>意向分</th><th>兴趣主题</th><th>可触达渠道</th><th>最近行为</th><th>最近营销触达</th></tr></thead><tbody>${people.map(x=>`<tr><td>${x.name}<small>${x.role}</small></td><td>${x.score}</td><td>${x.interest}</td><td>${x.channel}<small>${x.eligible?'当前授权有效':'仅观察，暂不纳入发送'}</small></td><td>${x.last}</td><td>${x.touch}</td></tr>`).join('')}</tbody></table></div></section>
      <div class="account-grid"><section class="work-area"><div class="section-head"><h3>近期触达与培育效果</h3></div><div class="am-history"><article><div>10-17 · 智能决策主题邀请<small><br>企业微信 · 1人送达 / 1人访问</small></div><span>已响应</span></article><article><div>10-16 · 供应链实践案例<small><br>邮件 · 2人送达 / 1人点击</small></div><span>继续培育</span></article>${company.saved.task?'<article><div>本次创建 · 定向内容培育<small><br>2 名有效联系人 · 待选择发送时间</small></div><span>草稿</span></article>':''}</div><p class="am-note">以上为最近触达记录；点击、报名表示营销响应，不能据此认定采购意向。</p></section><section class="work-area"><div class="section-head"><h3>关键行为时间线</h3></div><ol class="timeline"><li><time>10-19</time><span>李四访问智能决策方案页</span></li><li><time>10-18</time><span>张三下载供应链白皮书</span></li><li><time>10-17</time><span>赵敏报名数据分析主题活动</span></li></ol><button class="text-button" data-am="evidence">查看完整依据</button></section></div>
      <section class="work-area"><div class="section-head"><h3>内部系统同步</h3><span class="source-tag">${esc(company.sync)}</span></div><p>同步企业兴趣、活跃联系人与关键行为摘要，辅助销售了解近期营销动态。</p><p class="am-note">${company.saved.sync?'本次原型会话已模拟同步 · 等待内部系统反馈':'最近同步：暂无记录'} · CRM ${esc(company.crm)} · 销售查看与反馈：暂无数据</p><button class="ghost-button" data-am="sync">预览同步内容</button></section>
      <details class="work-area"><summary>产品与合作背景</summary><div class="profile-grid"><article><span>已购买产品</span><strong>${esc(company.product)}</strong></article><article><span>最近签约</span><strong>${esc(company.last)}</strong></article><article><span>累计签约</span><strong>${esc(company.contracts)}</strong></article><article><span>激活 / 使用 / 到期情况</span><strong>暂无产品系统数据</strong></article></div><p class="am-note">来源：内部合同记录（原型示例）。已签约不等同于正在使用；同产品培育需确认扩容、版本升级或续约场景。</p></details>
      <details class="work-area"><summary>企业基础与工商资料</summary><div class="profile-grid"><article><span>行业</span><strong>${esc(company.industry)}</strong></article>${['企业规模','参保人数','注册资本','成立日期','所在地区','统一社会信用代码'].map(x=>`<article><span>${x}</span><strong>暂无数据</strong></article>`).join('')}</div><p class="am-note">工商数据尚未接入。接入后分别显示来源及更新时间；参保人数与员工总数分开标注。</p></details><p class="am-note" role="status" id="amFeedback">原型示例数据 · 操作仅保存在当前页面会话，不执行真实发送或内部系统写入。</p>`;
    document.getElementById('amPeriod').addEventListener('change',e=>{days=Number(e.target.value);render();});
    if(page.classList.contains('active')) document.getElementById('pageTitle').textContent='企业营销洞察';
  }
  page.addEventListener('click',e=>{
    const action=e.target.closest('[data-am]')?.dataset.am;if(!action)return;
    if(action==='back'){showPage('companies');return;}
    if(action==='score'){open('企业意向分口径','<p>由有效外部联系人的意向分、关键角色、兴趣与近期高价值行为综合计算，内部员工不参与。企业分不是联系人分数的简单平均。</p><p>近7天变化＝当前分－7天前分；主题访问不代表已确认采购需求。当前为原型示例分值。</p>');return;}
    if(action==='people'){open('全部企业联系人','<p>共12名有效联系人；其中3人有近期可展示的行为明细，其余9人暂无近期行为。</p><ul>'+people.map(x=>`<li>${x.name} · ${x.role} · ${x.score}分 · ${x.channel}</li>`).join('')+'</ul><p>其余9名联系人的详细资料尚未提供，接入联系人系统后展示。</p>');return;}
    if(action==='evidence'){open('营销行为依据',`<p>${esc(company.name)} · 近${days}天 · 外部联系人行为</p><ul><li>10-19 李四：访问智能决策方案页（信息化经理，82分）</li><li>10-18 张三：下载供应链白皮书（采购负责人，94分）</li><li>10-17 赵敏：报名数据分析主题活动（业务经理，71分）</li></ul><p>以上为代表行为；近${days}天汇总：${periods[days].visits}次方案访问、${periods[days].downloads}次资料下载。角色依据为联系人职位标签，未确认决策权限。</p>`);return;}
    const titles={group:'加入营销分组',nurture:'创建培育任务',content:'推荐相关内容',sync:'同步营销信号'};
    dialog.dataset.action=action;
    open(titles[action],action==='sync'?`<p>目标：内部CRM · ${esc(company.name)}（${esc(company.crm)}）</p><ul><li>企业意向分 ${esc(company.score)}，近7天 ${esc(company.change)}</li><li>关注主题：数据分析、财务与供应链</li><li>关键人员：张三、李四及近期行为</li></ul><p>${company.crm==='未建档'?'企业尚未关联CRM记录，本次仅保存待关联信号。':'更新企业营销动态摘要，等待销售查看与反馈。'}</p>`:`<p>目标企业：${esc(company.name)} · 2名可触达联系人；赵敏因暂无可用渠道被排除。</p><label><input type="checkbox" checked disabled> 张三 · 邮件授权有效</label><label><input type="checkbox" checked disabled> 李四 · 邮件授权有效</label>${action==='group'?'<label>分组名称<input type="text" id="amName" value="企业关键角色内容培育" required></label>':'<label>推荐内容<select id="amContent"><option>智能决策产品实践案例</option><option>供应链数智化白皮书</option><option>数据分析主题活动邀请</option></select></label><p>渠道：邮件 · 频控检查通过。将保存为培育草稿，后续在营销任务中选择时间并确认发送。</p>'}`,'确认并保存（模拟）');
  });
  dialog.addEventListener('click',e=>{
    if(e.target.closest('[data-am-close]')){close();return;}
    if(!e.target.closest('[data-am-confirm]'))return;
    const a=dialog.dataset.action;
    if(a==='group'&&!document.getElementById('amName').value.trim()){document.getElementById('amName').reportValidity();return;}
    company.saved[a]=a==='group'?document.getElementById('amName').value.trim():a==='sync'?true:document.getElementById('amContent').value;
    if(a==='nurture'||a==='content')company.saved.task=true;
    if(a==='sync')company.sync=company.crm==='未建档'?'待关联内部企业记录':'已模拟同步';
    close();render();document.getElementById('amFeedback').textContent=({group:'已模拟加入营销分组，包含2名可触达联系人。',nurture:'已保存培育任务草稿，尚未发送。',content:'已保存推荐内容草稿，尚未发送。',sync:company.crm==='未建档'?'已保存待关联营销信号，尚未写入内部系统。':'已模拟同步营销摘要，真实接口尚未接入。'})[a];
  });
  document.querySelectorAll('[data-jump="account"]').forEach(button=>button.addEventListener('click',()=>{
    const row=button.closest('.company-list-row');if(row)company=companies[[...document.querySelectorAll('.company-list-row')].indexOf(row)];render();
  }));
  if(typeof pageTitles!=='undefined')pageTitles.account='企业营销洞察';
  render();
})();
