/* 邮件营销交互原型：演示数据，不连接真实邮件服务。 */
(() => {
  const campaigns = [
    {name:'产品线上研讨会邀请',subject:'用友网络邮箱验证激活邮件',type:'通知邮件',status:'草稿',sent:0,open:'—',click:'—',owner:'陈玉琴',time:'今天 10:32'},
    {name:'制造业峰会会前提醒',subject:'2026 制造业数智化峰会参会提醒',type:'活动邮件',status:'定时发送',sent:862,open:'—',click:'—',owner:'杨晨',time:'09-22 09:00'},
    {name:'白皮书下载通知',subject:'资料已准备好，请查收',type:'通知邮件',status:'已发送',sent:1248,open:'42.6%',click:'18.3%',owner:'郭涛',time:'09-18 15:20'},
    {name:'AI 产品月度精选',subject:'本月值得关注的 5 个 AI 实践',type:'营销邮件',status:'已发送',sent:3560,open:'35.2%',click:'11.8%',owner:'李小琳',time:'09-12 10:00'},
    {name:'活动报名成功通知',subject:'报名成功｜期待与您现场相见',type:'活动邮件',status:'已发送',sent:628,open:'68.7%',click:'24.1%',owner:'陈玉琴',time:'09-08 18:00'}
  ];
  const templates = [
    {name:'资料下载通知样式 2',category:'通知邮件',kind:'页面模板',desc:'下载链接、资料说明和服务联系方式。',tone:'blue'},
    {name:'资料下载通知',category:'通知邮件',kind:'页面模板',desc:'适合白皮书、手册等资料交付。',tone:'red'},
    {name:'表单数据提醒通知',category:'通知邮件',kind:'页面模板',desc:'表单提交后向内部人员发送提醒。',tone:'brand'},
    {name:'问卷数据提醒通知',category:'通知邮件',kind:'页面模板',desc:'问卷提交及结果更新提醒。',tone:'brand'},
    {name:'活动开始通知',category:'活动邮件',kind:'页面模板',desc:'活动时间、地点和参会入口提醒。',tone:'event'},
    {name:'活动报名成功通知',category:'活动邮件',kind:'页面模板',desc:'报名结果、活动日程及注意事项。',tone:'brand'}
  ];
  const states={emailManagement:{tab:'全部',query:''},emailTemplates:{kind:'页面模板',category:'所有模板',query:''}};
  const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const notice=message=>{const node=document.getElementById('mkNavNotice');if(!node)return;node.textContent=message;node.hidden=false;setTimeout(()=>node.hidden=true,2400);};

  function renderCampaigns(){
    const root=document.getElementById('emailManagement'),state=states.emailManagement;
    const rows=campaigns.filter(item=>(state.tab==='全部'||item.status===state.tab)&&(!state.query||`${item.name}${item.subject}`.toLowerCase().includes(state.query.toLowerCase())));
    root.innerHTML=`<div class="sms-header"><div><h3>邮件列表</h3><p>统一创建、发送并查看邮件触达效果。</p></div><button class="primary-button" data-email-create>＋ 新建邮件</button></div><div class="email-panel"><div class="email-toolbar"><label><span class="mk-visually-hidden">搜索邮件</span><input type="search" value="${esc(state.query)}" placeholder="请输入邮件名称或主题"></label><button class="primary-button" data-email-search>搜索</button><button class="ghost-button" data-email-reset>重置</button></div><nav class="email-tabs" aria-label="邮件状态">${['全部','草稿','定时发送','已发送'].map(tab=>`<button class="${state.tab===tab?'active':''}" data-email-tab="${tab}">${tab}<small>${tab==='全部'?campaigns.length:campaigns.filter(item=>item.status===tab).length}</small></button>`).join('')}</nav><div class="email-table-scroll"><div class="email-table"><b>邮件名称 / 主题</b><b>类型</b><b>状态</b><b>已送达</b><b>打开率</b><b>点击率</b><b>更新人 / 时间</b><b>操作</b>${rows.map(item=>`<span><strong>${esc(item.name)}</strong><small>${esc(item.subject)}</small></span><span>${item.type}</span><span><em class="email-status ${item.status==='已发送'?'success':item.status==='定时发送'?'scheduled':'draft'}">${item.status}</em></span><span>${item.sent?item.sent.toLocaleString():'—'}</span><span>${item.open}</span><span>${item.click}</span><span>${item.owner}<small>${item.time}</small></span><span class="email-actions">${item.status==='已发送'?'<button>数据统计</button>':'<button>编辑</button>'}<button>复制</button><button>更多</button></span>`).join('')}</div></div>${rows.length?'':`<div class="email-empty">没有找到匹配的邮件，请调整搜索条件。</div>`}</div>`;
    const input=root.querySelector('input');
    root.querySelector('[data-email-search]').onclick=()=>{state.query=input.value.trim();renderCampaigns();};
    input.onkeydown=event=>{if(event.key==='Enter'){state.query=input.value.trim();renderCampaigns();}};
    root.querySelector('[data-email-reset]').onclick=()=>{state.query='';state.tab='全部';renderCampaigns();};
    root.querySelectorAll('[data-email-tab]').forEach(button=>button.onclick=()=>{state.tab=button.dataset.emailTab;renderCampaigns();});
    root.querySelector('[data-email-create]').onclick=()=>notice('新建邮件：本原型仅展示入口。');
    root.querySelectorAll('.email-actions button').forEach(button=>button.onclick=()=>notice(`${button.textContent}：交互入口已保留。`));
  }

  function renderTemplates(){
    const root=document.getElementById('emailTemplates'),state=states.emailTemplates;
    const rows=templates.filter(item=>(state.category==='所有模板'||item.category===state.category)&&(!state.query||item.name.includes(state.query)));
    root.innerHTML=`<div class="sms-header"><div><h3>邮件模板</h3><p>按用途查找并复用邮件页面，减少重复设计。</p></div><button class="primary-button" data-template-create>＋ 创建新模板</button></div><div class="email-panel template"><div class="email-toolbar"><label><span class="mk-visually-hidden">搜索模板</span><input type="search" value="${esc(state.query)}" placeholder="请输入模板名称"></label><button class="primary-button" data-template-search>搜索</button></div><nav class="email-template-kinds" aria-label="模板类型"><button class="active">页面模板</button><button data-component-template>组件模板 <small>仅入口</small></button></nav><div class="email-template-layout"><aside><b>已保存的模板</b>${['所有模板','通知邮件','营销邮件','活动邮件','自定义邮件'].map(category=>`<button class="${state.category===category?'active':''}" data-template-category="${category}">${category}</button>`).join('')}</aside><section class="email-template-grid">${rows.map((item,index)=>`<article><div class="email-template-preview ${item.tone}"><i>用友</i><strong>${esc(item.name)}</strong><span>${esc(item.desc)}</span><button data-template-use="${index}">使用模板</button></div><div><b>${esc(item.name)}</b><span>${item.category} · ${item.kind}</span><button aria-label="更多操作">•••</button></div></article>`).join('')}${rows.length?'':'<div class="email-empty">当前分类暂无匹配模板。</div>'}</section></div></div>`;
    const input=root.querySelector('input');
    root.querySelector('[data-template-search]').onclick=()=>{state.query=input.value.trim();renderTemplates();};
    input.onkeydown=event=>{if(event.key==='Enter'){state.query=input.value.trim();renderTemplates();}};
    root.querySelectorAll('[data-template-category]').forEach(button=>button.onclick=()=>{state.category=button.dataset.templateCategory;renderTemplates();});
    root.querySelector('[data-template-create]').onclick=()=>notice('创建邮件模板：本原型仅展示入口。');
    root.querySelector('[data-component-template]').onclick=()=>notice('组件模板：本原型仅展示菜单入口。');
    root.querySelectorAll('[data-template-use]').forEach(button=>button.onclick=()=>notice('已选择模板，可进入邮件编辑流程。'));
  }
  renderCampaigns();renderTemplates();
})();
