(() => {
  const schemeD=new URLSearchParams(location.search).get('scheme')==='d';
  const schemeC=schemeD||new URLSearchParams(location.search).get('scheme')==='c';
  if(schemeC){document.body.classList.add('mk-scheme-c');document.title='Marketing Cloud 一期原型 · 精简导航方案 C';}
  if(schemeD){document.body.classList.add('mk-scheme-d');document.title='Marketing Cloud 一期原型 · 管理员导航方案 D';}
  const groups = structuredClone(window.MK_NAVIGATION);
  if(schemeC){
    const systemItems=groups.find(group=>group.id==='system').items;
    systemItems.find(item=>item.id==='channels').aliases='渠道设置 渠道管理';
    systemItems.find(item=>item.id==='channels').page='channels';
    systemItems.splice(systemItems.findIndex(item=>item.id==='channels')+1,0,{id:'channelCategories',label:'渠道分类',section:'渠道配置',aliases:'渠道类型'});
    systemItems.find(item=>item.id==='channelCategories').page='channelCategories';
    systemItems.splice(systemItems.findIndex(item=>item.id==='organization')+1,0,{id:'accountManagement',label:'账号管理',section:'组织与权限',aliases:'组织账号 账户管理 系统账号'});
    const organizationItem=systemItems.find(item=>item.id==='organization');organizationItem.id='organizationManagement';organizationItem.page='organizationManagement';organizationItem.label='组织管理';
    const accountItem=systemItems.find(item=>item.id==='accountManagement');accountItem.page='accountManagement';
    const roleItem=systemItems.find(item=>item.id==='settingsPermissions');roleItem.page='roleManagement';roleItem.label='角色管理';roleItem.aliases='角色权限 权限管理';
    systemItems.push(
      {id:'fieldConfiguration',label:'字段配置',section:'基础设置',aliases:'字段设置 基础配置 自定义字段'},
      {id:'wechatBinding',label:'绑定微信',section:'基础设置',aliases:'公众号绑定 微信公众号 微信绑定 基础配置'}
    );
  }
  groups.find(g=>g.id==='events').items=[
    {id:'eventTopics',label:'活动专题',section:'活动运营'},
    {id:'activities',label:'活动列表',page:'activities',section:'活动运营',aliases:'活动中心 报名 参会人员 签到 直播 邀请通知'},
    {id:'eventCategories',label:'活动分类',section:'活动运营'},
    {id:'eventSessionAnalysis',label:'场次分析',section:'统计分析',aliases:'活动统计'},
    {id:'eventAudienceAnalysis',label:'人数分析',section:'统计分析',aliases:'活动统计'},
    {id:'eventStatistics',label:'活动统计',section:'统计分析'},
    {id:'eventOrgStatistics',label:'机构统计',section:'统计分析',aliases:'组织统计 活动统计'},
    {id:'eventLiveStatistics',label:'直播统计',section:'统计分析',aliases:'活动统计'},
    {id:'eventCustomReports',label:'定制报表',section:'统计分析',aliases:'活动统计'},
    {id:'eventRecycleBin',label:'回收站',section:'其他管理',aliases:'活动回收站'},
  ];
  const sms=groups.find(g=>g.id==='outreach').items;
  sms.splice(0,1,{id:'smsManagement',label:'短信任务',page:'smsManagement',section:'短信营销',aliases:'短信管理 短信营销'},{id:'smsTemplates',label:'短信模板',page:'smsTemplates',section:'短信营销'});
  const emailIndex=sms.findIndex(item=>item.id==='email');
  sms.splice(emailIndex,1,{id:'emailManagement',label:'邮件列表',page:'emailManagement',section:'邮件营销',aliases:'邮件管理 邮件任务'},{id:'emailTemplates',label:'邮件模板',page:'emailTemplates',section:'邮件营销',aliases:'页面模板 组件模板'});
  const automationItem=sms.find(item=>item.id==='automation');
  automationItem.page='automation';automationItem.aliases='自动化营销 自动化任务 营销任务';
  const wechatItem=sms.find(item=>item.id==='wechat');
  wechatItem.id='wechatMarketing';wechatItem.label='公众号管理';wechatItem.page='wechatMarketing';wechatItem.section='微信营销';wechatItem.aliases='微信营销 公众号 扫码授权';
  const employeeIndex=sms.findIndex(item=>item.id==='employee');
  sms.splice(employeeIndex,1,{id:'employeeMarketing',label:'活动列表',page:'employeeMarketing',section:'全员营销',aliases:'全员营销 邀请活动'},{id:'shareRanking',label:'分享排行',page:'shareRanking',section:'全员营销',aliases:'邀请人排行 分享明细'});
  const customerItems=groups.find(g=>g.id==='customers').items;
  customerItems.find(i=>i.id==='settings').section='意向评分配置';
  customerItems.find(i=>i.id==='settings').label='评分规则';
  customerItems.push({id:'settingsWeights',label:'行为权重',page:'settingsWeights',section:'意向评分配置'},{id:'settingsVersions',label:'规则版本',page:'settingsVersions',section:'意向评分配置'});
  if(schemeD){
    groups.find(group=>group.id==='customers').items.find(item=>item.id==='profileTags').hiddenInMenu=true;
    const contentItems=groups.find(group=>group.id==='content').items;
    const expandedContent=contentItems.flatMap(item=>{
      const views=contentViewConfig[item.content];
      if(!views||views.length<2)return [item];
      return views.map(view=>({...item,parentId:item.id,id:view.id==='list'?item.id:item.id+'/'+view.id,label:item.id==='forms'&&view.id==='analytics'?'表单数据分析':view.label,section:item.id==='forms'?'表单与问卷':item.label,view:view.id,aliases:[item.aliases,item.label,view.label].filter(Boolean).join(' ')}));
    });
    groups.find(group=>group.id==='content').items=expandedContent;
    const landing=expandedContent.find(item=>item.id==='landingPages');
    landing.label='落地页列表';landing.section='落地页';
    expandedContent.splice(expandedContent.indexOf(landing)+1,0,{id:'landingCategories',label:'落地页分类',page:'landingCategories',section:'落地页'});
    expandedContent.find(item=>item.id==='moduleManagement').section='落地页';
    const moduleIndex=expandedContent.findIndex(item=>item.id==='moduleManagement');
    expandedContent.splice(expandedContent.indexOf(landing)+2,0,...expandedContent.splice(moduleIndex,1));
  }
  let panelGroup='content';
  if(!schemeC){
    // Scheme B exposes independent management views as third-level menu items.
    const contentItems=groups.find(g=>g.id==='content').items;
    const expandedContent=contentItems.flatMap(item=>{
      const views=contentViewConfig[item.content];
      if(!views||views.length<2)return [item];
      return views.map(view=>({...item,id:view.id==='list'?item.id:item.id+'/'+view.id,label:view.label,section:item.label,view:view.id,aliases:[item.aliases,item.label,view.label].filter(Boolean).join(' ')}));
    });
    groups.find(g=>g.id==='content').items=expandedContent;
    const landing=expandedContent.find(i=>i.id==='landingPages');
    landing.label='落地页列表';landing.section='落地页';
    expandedContent.splice(expandedContent.indexOf(landing)+1,0,{id:'landingCategories',label:'落地页分类',page:'landingCategories',section:'落地页'});
    expandedContent.find(i=>i.id==='moduleManagement').section='落地页';
    const moduleIndex=expandedContent.findIndex(i=>i.id==='moduleManagement');
    expandedContent.splice(expandedContent.indexOf(landing)+2,0,...expandedContent.splice(moduleIndex,1));
    const leadItems=groups.find(g=>g.id==='leads').items;
    const leadViews=[...document.querySelectorAll('[data-lead-setting-tab]')].map(button=>({id:button.dataset.leadSettingTab,label:button.textContent}));
    leadItems.splice(leadItems.findIndex(i=>i.id==='leadSettings'),1,...leadViews.map(view=>({id:view.id==='overview'?'leadSettings':'leadSettings/'+view.id,label:view.label,page:'leadSettings',leadView:view.id,section:'流转配置'})));
  }
  const activityTabs=[['activityPage','活动页面'],['registration','报名设置'],['attendees','参会人员'],['checkin','签到与互动'],['live','直播'],['outreach','邀请与通知'],['activityLeads','线索与跟进'],['activityAnalytics','数据分析']];
  let activityTab='activityPage';
  const icons={work:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',customers:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5"/>',content:'<path d="M14 3H5v18h14V8zM14 3v5h5M8 12h8M8 16h6"/>',events:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18m-13 4h2m4 0h2"/>',outreach:'<path d="m3 11 18-8-8 18-2-8zM11 13 21 3"/>',leads:'<path d="M3 4h18l-7 9v6l-4 2v-8z"/>',system:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="currentColor"/><circle cx="15" cy="17" r="3" fill="currentColor"/>'};
  const icon=id=>`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${icons[id]}</svg>`;
  const items = groups.flatMap(group => group.items.map(item => ({...item, group:group.id})));
  const get = id => document.getElementById(id);
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const contextBar=document.querySelector('.topbar.mk-context'),contextCopy=contextBar.firstElementChild;
  const contextDescription=document.createElement('p'),contextActions=document.createElement('div');
  contextDescription.id='mkPageDescription';contextActions.id='mkPageActions';contextActions.className='mk-page-actions';
  if(schemeC){
    contextCopy.classList.add('mk-context-copy');contextCopy.append(contextDescription);get('mkFavorite').hidden=true;contextActions.append(get('mkFavorite'));contextBar.append(contextActions);
    const utilities=document.createElement('div');utilities.className='mk-header-utilities';utilities.innerHTML=`<details class="mk-utility-menu mk-language-menu"><summary aria-label="切换语言">◎ <span>简体中文</span></summary><div><button aria-current="true">简体中文</button><button data-mk-utility="英文版">English<small>仅菜单</small></button></div></details><details class="mk-utility-menu mk-account-menu"><summary><i aria-hidden="true">信</i><span>集团信息技术部</span></summary><div><button data-mk-utility="下载中心">⇩ 下载中心<small>仅菜单</small></button><button data-mk-utility="在线文档">? 在线文档<small>仅菜单</small></button><button data-mk-utility="建议反馈">▣ 建议反馈<small>仅菜单</small></button><button data-mk-utility="退出登录">⇥ 退出登录<small>仅菜单</small></button></div></details>`;
    document.querySelector('.mk-org').replaceWith(utilities);
    utilities.addEventListener('click',event=>{const button=event.target.closest('[data-mk-utility]');if(!button)return;notice(`${button.dataset.mkUtility}：本版仅展示入口，暂无对应原型页面。`);button.closest('details').removeAttribute('open');});
    get('mkSearchDialog').classList.add('mk-search-popover');
  }
  const available = item => Boolean(item.page || item.content);
  const read = (key, fallback) => {try {const data=JSON.parse(localStorage.getItem(key));return Array.isArray(data)?data:fallback;} catch{return fallback;}};
  let favorites=read('mk-mega-favorites',[]).filter(id=>items.some(i=>i.id===id&&available(i)));
  let recent=read('mk-mega-recent',[]).filter(id=>items.some(i=>i.id===id&&available(i))).slice(0,5);
  let current='dashboard', activeGroup='work', selectedPage='dashboard', contentViewState='list', noticeTimer, restoring=false;
  const remembered={};
  const openedSections={};
  get('mkSecondary').addEventListener('click',event=>{
    const summary=event.target.closest('details[data-menu-section] > summary');
    if(!summary)return;
    event.preventDefault();
    const node=summary.parentElement,willOpen=!node.open;
    get('mkSecondary').querySelectorAll('details[data-menu-section][open]').forEach(item=>item.open=false);
    node.open=willOpen;
    openedSections[activeGroup]=willOpen?node.dataset.menuSection:null;
  });
  document.addEventListener('click',event=>{const button=event.target.closest('[data-lead-setting-tab], [data-open-route-setting]');if(button&&selectedPage==='leadSettings'){const view=document.querySelector('[data-lead-setting-tab].active')?.dataset.leadSettingTab||'route';sync('leadSettings/'+view,'leadSettings');}});
  const persist=()=>{try{localStorage.setItem('mk-mega-favorites',JSON.stringify(favorites));localStorage.setItem('mk-mega-recent',JSON.stringify(recent));}catch{}};
  function notice(message){get('mkNavNotice').textContent=message;get('mkNavNotice').hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>get('mkNavNotice').hidden=true,3200);}
  const contentTools=document.createElement('div');
  contentTools.id='mkContentTools';contentTools.className='mk-content-tools';contentTools.hidden=true;
  if(schemeC)document.querySelector('.content-section-actions')?.prepend(contentTools);
  function renderContentTools(section){
    if(!schemeC)return;
    if(schemeD){contentTools.hidden=true;contentTools.innerHTML='';return;}
    const views=(contentViewConfig[section]||[]).filter(view=>view.id!=='list');
    if(!views.length){contentTools.hidden=true;contentTools.innerHTML='';return;}
    const direct=views.find(view=>view.id==='categories')||views[0],more=views.filter(view=>view!==direct);
    contentTools.hidden=false;
    contentTools.innerHTML=`<button class="ghost-button ${contentViewState===direct.id?'active':''}" data-content-manage="${direct.id}">${esc(direct.label)}</button>${more.length?`<details><summary class="ghost-button">更多管理⌄</summary><div>${more.map(view=>`<button class="${contentViewState===view.id?'active':''}" data-content-manage="${view.id}">${esc(view.label)}</button>`).join('')}</div></details>`:''}`;
  }
  contentTools.addEventListener('click',event=>{
    const button=event.target.closest('[data-content-manage]');if(!button)return;
    const item=items.find(entry=>entry.id===current&&entry.content);if(!item)return;
    contentViewState=button.dataset.contentManage;setContentView(item.content,contentViewState);renderContentTools(item.content);sync(item.id,item.page);
    button.closest('details')?.removeAttribute('open');
  });
  let movedContextActions=[],contextSources=[];
  function restoreContextHeader(){
    for(const entry of movedContextActions)entry.parent.insertBefore(entry.node,entry.next);
    movedContextActions=[];contextSources.forEach(node=>node.classList.remove('mk-context-source'));contextSources=[];
    [...contextActions.children].forEach(node=>{if(node!==get('mkFavorite'))node.remove();});
  }
  function moveContextAction(node){
    if(!node||node===get('mkFavorite'))return;
    movedContextActions.push({node,parent:node.parentNode,next:node.nextSibling});contextActions.insertBefore(node,get('mkFavorite'));
  }
  function headingText(source){
    const heading=source?.querySelector('h3');if(!heading)return '';
    const copy=heading.cloneNode(true);copy.querySelectorAll('span,small,em').forEach(node=>node.remove());return copy.textContent.trim();
  }
  function addLandingTools(page){
    if(schemeD)return;
    if(!['landingPages','landingCategories','moduleManagement'].includes(page))return;
    const choices=page==='landingPages'
      ?{direct:['landingCategories','分类管理'],more:['moduleManagement','内容模块']}
      :page==='landingCategories'
        ?{direct:['landingPages','落地页列表'],more:['moduleManagement','内容模块']}
        :{direct:['landingPages','落地页列表'],more:['landingCategories','分类管理']};
    const tools=document.createElement('div');tools.className='mk-content-tools mk-landing-tools';
    tools.innerHTML=`<button class="ghost-button" data-landing-manage="${choices.direct[0]}">${choices.direct[1]}</button><details><summary class="ghost-button">更多管理⌄</summary><div><button data-landing-manage="${choices.more[0]}">${choices.more[1]}</button></div></details>`;
    tools.addEventListener('click',event=>{const button=event.target.closest('[data-landing-manage]');if(button)showPage(button.dataset.landingManage);});
    contextActions.insertBefore(tools,contextActions.firstChild);
  }
  function updateSchemeCContext(item){
    if(!schemeC)return;
    restoreContextHeader();
    const root=get(selectedPage),contentConfig=item.content&&contentSectionData[item.content];
    let source,title='',description='';
    if(item.content&&contentConfig){
      source=get('contentSectionPanel').querySelector('.content-section-head');
      const view=(contentViewConfig[item.content]||[]).find(entry=>entry.id===contentViewState),name=contentConfig.name||item.label;
      title=!view||view.id==='list'?item.label:(item.content==='forms'&&view.id==='analytics'?'表单数据分析':view.label);
      const viewDescriptions={categories:`维护${name}分类及层级，帮助团队快速查找和复用内容。`,templates:'维护可复用的文章模板，统一团队内容结构和样式。',topics:'组织专题内容及其展示顺序，形成持续运营的内容集合。',public:'查看和引用公共文章，复用集团及其他组织的优质内容。',analytics:'查看表单收集、提交与线索转化数据。'};
      description=viewDescriptions[contentViewState]||contentConfig.description;
      moveContextAction(source.querySelector('.content-section-actions'));
    }else if(item.id==='contentCenter'){
      source=root.querySelector('.content-center-hero');title=item.label;description=source.querySelector('p')?.textContent.trim()||'';moveContextAction(source.querySelector('.content-create-wrap'));
    }else if(root){
      source=root.querySelector(':scope > .sms-header, :scope > .module-page-intro, :scope > .landing-page-hero, :scope > .activity-hero, :scope > .activity-detail-head, :scope > .lead-page-hero, :scope > .settings-hero, :scope > .weight-config-titlebar, :scope > .profile-tag-hero, :scope > .work-area > .group-toolbar');
      if(schemeD&&!source)source=root.querySelector(':scope > .settings-subpage > .section-head');
      title=headingText(source)||pageTitles[selectedPage]||item.label;
      description=source?.querySelector('p,.module-scope')?.textContent.trim()||'';
      if(source)[...source.children].forEach(node=>{
        const directButton=node.matches('button:not(.back-button):not([data-jump="leads"])'),buttonGroup=!node.querySelector('h3')&&node.querySelector(':scope > button:not(.back-button):not([data-jump="leads"])');
        if(directButton||buttonGroup)moveContextAction(node);
      });
    }
    if(selectedPage===item.page&&!item.content)title=item.label;
    if(selectedPage==='activityDetail'){
      title=activityTabs.find(([key])=>key===activityTab)[1];
      description=[headingText(source),description].filter(Boolean).join(' · ');
      const repeatedHeading=document.querySelector(`[data-activity-panel="${activityTab}"] > .section-head h3`);
      if(repeatedHeading?.textContent.trim()===title){repeatedHeading.classList.add('mk-context-source');contextSources.push(repeatedHeading);}
    }
    if(!schemeD&&item.content&&contentViewState!=='list'){
      const back=document.createElement('button');back.className='ghost-button';back.textContent='← 返回'+item.label+'列表';
      back.addEventListener('click',()=>{contentViewState='list';setContentView(item.content,'list');renderContentTools(item.content);sync(item.id,item.page);});
      contextActions.prepend(back);
    }
    if(item.content&&['products','solutions','cases','customerWall','aggregations'].includes(item.content)){
      get('contentKeywordFilter').placeholder='请输入'+item.label+'名称';
      document.querySelector('[data-content-filter-field="category"]').hidden=true;
      const status=document.querySelector('[data-content-filter-field="status"]'),previous=status.value;
      status.innerHTML='<option>全部状态</option>'+[...new Set(contentConfig.rows.map(row=>row[2]))].map(value=>`<option>${esc(value)}</option>`).join('');
      if([...status.options].some(option=>option.value===previous))status.value=previous;
    }
    if(selectedPage==='landingCategories')title='落地页分类';
    addLandingTools(selectedPage);
    if(source){source.classList.add('mk-context-source');contextSources.push(source);}
    get('pageTitle').textContent=title||item.label;contextDescription.textContent=description;contextDescription.hidden=!description;
  }
  function menuButton(item){return `<button class="mk-menu-item ${["短信营销","邮件营销","意向评分配置"].includes(item.section)?"mk-third-menu":""} ${item.id===current?'selected':''}" data-mk-item="${item.id}" ${item.id===current?'aria-current="page"':''} ${available(item)?'':`aria-disabled="true" title="${esc(item.label)}：现有系统功能，本原型仅展示菜单"`}><span>${esc(item.label)}</span>${available(item)?'':'<small>仅菜单</small>'}</button>`;}
  function schemeCEntries(group){
    if(!schemeC)return group.items;
    const active=items.find(item=>item.id===current);
    const eligible=group.items.filter(item=>!item.hiddenInMenu&&(schemeD||item.id!=='moduleManagement'));
    if(schemeD)return eligible;
    if(!active||active.group!==group.id)return eligible.filter(item=>!item.section);
    if(group.id==='content'&&(active.id==='contentCenter'||active.section==='内容素材'))return eligible.filter(item=>item.id==='contentCenter'||item.section==='内容素材');
    if(active.section)return eligible.filter(item=>item.section===active.section);
    return eligible.filter(item=>!item.section);
  }
  function renderMenu(){
    const group=groups.find(g=>g.id===activeGroup),active=items.find(item=>item.id===current);
    get('mkModuleTitle').textContent=schemeD?group.label:schemeC?(active?.section||(activeGroup==='content'?'内容素材':group.label)):group.label;
    document.body.classList.remove('mk-single-entry');
    get('mkExpand').hidden=!document.body.classList.contains('mk-nav-collapsed');
    let html='',lastSection;
    if(activeGroup==='work'&&favorites.length){
      const favoriteItems=favorites.map(id=>items.find(i=>i.id===id)).filter(Boolean),visibleFavorites=favoriteItems.slice(0,7),currentFavorite=favoriteItems.find(item=>item.id===current);
      if(currentFavorite&&!visibleFavorites.some(item=>item.id===currentFavorite.id))visibleFavorites[6]=currentFavorite;
      html='<p class="mk-section-label">我的收藏</p>'+visibleFavorites.map(menuButton).join('')+(favoriteItems.length>7?`<button class="mk-more-favorites" data-more-favorites>更多收藏 <small>${favoriteItems.length-7}</small><span>›</span></button>`:'')+'<p class="mk-section-label">工作台</p>';
    }
    const sections=new Map();
    for(const item of schemeCEntries(group)){const key=item.section||'';if(!sections.has(key))sections.set(key,[]);sections.get(key).push(item);}
    for(const [section,entries] of sections){
      const nested=entries.some(i=>i.view||i.leadView)||['短信营销','意向评分配置','落地页'].includes(section);
      if((nested&&!schemeC)||(schemeD&&section)){
        if(openedSections[activeGroup]===undefined&&entries.some(i=>i.id===current))openedSections[activeGroup]=section;
        html+=`<details class="mk-menu-group" data-menu-section="${esc(section)}" ${openedSections[activeGroup]===section?'open':''}><summary>${esc(section)}</summary>${entries.map(menuButton).join('')}</details>`;
      }
      else html+=(!schemeC&&section?`<p class="mk-section-label">${esc(section)}</p>`:'')+entries.map(menuButton).join('');
    }
    if(selectedPage==='activityDetail'){
      const name=document.querySelector('.activity-detail-title h3').textContent;
      html=menuButton(items.find(i=>i.id==='activities'))+`<div class="mk-activity-context"><small>当前活动</small><strong>${esc(name)}</strong></div><div class="mk-third-level">`+activityTabs.map(([key,label])=>`<button class="mk-menu-item ${key===activityTab?'selected':''}" data-mk-activity="${key}" ${key===activityTab?'aria-current="page"':''}>${label}</button>`).join('')+'</div>';
    }
    get('mkSecondary').innerHTML=html;
    if(selectedPage==='activityDetail'){const parent=get('mkSecondary').querySelector('[data-mk-item="activities"]');parent?.removeAttribute('aria-current');parent?.classList.remove('selected');}
    if(selectedPage!=='activityDetail'&&current==='activities')get('mkSecondary').querySelector('[data-mk-item="activities"]')?.setAttribute('aria-current','page');
    renderAll();
    get('mkFavorite').setAttribute('aria-pressed',String(favorites.includes(current)));
    get('mkFavorite').textContent=favorites.includes(current)?'★ 已收藏':'☆ 收藏';
  }
  const pageParents={account:'companies',customerProfile:'users',segmentCreate:'segment',activityDetail:'activities',roleManagement:'settingsPermissions'};
  if(schemeC){pageParents.landingCategories='landingPages';pageParents.moduleManagement='landingPages';}
  const tabSets={};
  let pendingHash=null;
  function sync(id,page){
    const item=items.find(i=>i.id===id);if(!item)return;
    current=id;selectedPage=page||item.page||'contentCenter';activeGroup=item.group;remembered[activeGroup]=id;
    if(schemeD)openedSections[activeGroup]=item.section||null;
    if(item.section&&(item.view||item.leadView||['短信营销','意向评分配置','落地页'].includes(item.section)))openedSections[activeGroup]=item.section;
    const group=groups.find(g=>g.id===item.group);
    const contentView=schemeC&&item.content&&!item.view&&(contentViewConfig[item.content]||[]).find(view=>view.id===contentViewState);
    const childPageTitle=schemeC&&page==='landingCategories'?'落地页分类':pageTitles[page];
    get('mkBreadcrumb').textContent=[group.label,item.section,item.label,contentView&&contentView.id!=='list'&&(item.content==='forms'&&contentView.id==='analytics'?'表单数据分析':contentView.label),page&&page!==item.page&&childPageTitle].filter(Boolean).join(' / ');
    if(item.content)get('pageTitle').textContent=item.label;
    if(selectedPage==='activityDetail')get('mkBreadcrumb').textContent='活动管理 / '+document.querySelector('.activity-detail-title h3').textContent+' / '+activityTabs.find(([key])=>key===activityTab)[1];
    updateSchemeCContext(item);
    const tabs=tabSets[id];get('mkContextTabs').hidden=!tabs;
    get('mkContextTabs').innerHTML=tabs?tabs.map(([target,label])=>`<button data-mk-tab="${target}" ${target===selectedPage?'aria-current="page"':''}>${label}</button>`).join(''):'';
    recent=[id,...recent.filter(x=>x!==id)].slice(0,5);persist();renderMenu();
    const contentBase=item.parentId||item.id;
    const contentHash=item.content?'content/'+contentBase+(schemeC&&contentViewState!=='list'?'/'+contentViewState:''):'';
    const hash='#'+(selectedPage==='activityDetail'?'activityDetail/'+activityTab:item.content?contentHash:item.leadView?item.id:selectedPage);
    if(!restoring){pendingHash=hash;queueMicrotask(()=>{if(pendingHash&&location.hash!==pendingHash)history.pushState(null,'',pendingHash);pendingHash=null;});}
  }
  let lastContentSection;
  window.mkNavigation={syncPage(page){
    if(!schemeC&&page==='leadSettings'){const view=document.querySelector('[data-lead-setting-tab].active')?.dataset.leadSettingTab||'route';sync('leadSettings/'+view,page);}
    else sync(pageParents[page]||page,page);
  },syncContent(section){
    if(schemeC&&lastContentSection!==section){resetContentListFilters();lastContentSection=section;}
    contentViewState=document.querySelector('#contentViewTabs .active')?.dataset.view||'list';
    renderContentTools(section);sync(section);
  }};
  function navigate(item){
    if(!available(item)){if(get('mkAllDialog').open){get('mkAllNotice').textContent=item.label+'：本版仅展示菜单，暂无原型页面。';return;}get('mkSearchDialog').close();notice(`${item.label}：本版仅展示菜单，暂无对应原型页面。`);return;}
    const oldRestoring=restoring;restoring=true;
    if(item.content){showPage('contentCenter');openContentSection(item.content);if(item.view){contentViewState=item.view;setContentView(item.content,item.view);}}else{showPage(item.page);if(item.page==='contentCenter')showContentOverview();if(item.leadView)document.querySelector(`[data-lead-setting-tab="${item.leadView}"]`).click();}
    restoring=oldRestoring;sync(schemeC&&item.id==='moduleManagement'?'landingPages':item.id,item.page);get('mkSearchDialog').close();get('mkAllDialog').close();
  }
  function renderAll(){
    const query=get('mkAllSearch').value.trim().toLowerCase();
    get('mkPrimary').innerHTML=[['favorites','☆','我的收藏'],['recent','◷','最近使用'],...groups.map(g=>[g.id,icon(g.id),g.label])].map(([id,glyph,label])=>`<button class="mk-all-category ${panelGroup===id&&!query?'selected':''}" data-mk-group="${id}" aria-pressed="${panelGroup===id&&!query}"><span aria-hidden="true">${glyph}</span>${label}</button>`).join('');
    let list=query?items.filter(i=>!i.hiddenInMenu&&(i.label+' '+(i.aliases||'')+' '+(i.section||'')+' '+groups.find(g=>g.id===i.group).label).toLowerCase().includes(query)):panelGroup==='favorites'?favorites.map(id=>items.find(i=>i.id===id)).filter(item=>item&&!item.hiddenInMenu):panelGroup==='recent'?recent.map(id=>items.find(i=>i.id===id)).filter(item=>item&&!item.hiddenInMenu):items.filter(i=>i.group===panelGroup&&!i.hiddenInMenu);
    if(schemeD&&!query&&!['favorites','recent'].includes(panelGroup))list=list.filter(item=>(!item.parentId||item.view==='list')&&!['landingCategories','moduleManagement'].includes(item.id));
    get('mkAllCategoryTitle').textContent=query?'搜索结果':panelGroup==='favorites'?'我的收藏':panelGroup==='recent'?'最近使用':groups.find(g=>g.id===panelGroup).label;
    get('mkAllDescription').textContent=panelGroup==='events'&&!query?'活动运营、统计分析与回收站集中管理；报名、签到等入口在选择具体活动后展示。':'按业务场景查找功能，星标收藏常用入口。';
    const contentBuckets={contentCenter:'常用功能',articles:'内容素材',resources:'内容素材',videos:'内容素材',posters:'内容素材',forms:'表单与问卷',surveys:'表单与问卷',landingPages:'页面与网站',aggregations:'页面与网站',website:'页面与网站',products:'产品与案例',solutions:'产品与案例',cases:'产品与案例',customerWall:'产品与案例'};
    const globalNames={articles:'文章',resources:'资料',videos:'视频',posters:'海报',forms:'表单',landingPages:'落地页'};
    const globalLabel=item=>schemeD&&!query?(globalNames[item.parentId||item.id]||item.label):item.label;
    const buckets=new Map();for(const item of list){const title=query||['favorites','recent'].includes(panelGroup)?groups.find(g=>g.id===item.group).label:schemeD&&item.group==='content'?(contentBuckets[item.parentId||item.id]||item.section||'常用功能'):item.section||'常用功能';if(!buckets.has(title))buckets.set(title,[]);buckets.get(title).push(item);}
    get('mkAllGrid').innerHTML=list.length?[...buckets].map(([title,entries])=>`<section class="mk-all-column"><h4>${esc(title)}</h4>${entries.map(item=>`<div class="mk-all-row"><button data-mk-destination="${item.id}" ${available(item)?'':'aria-disabled="true"'}>${esc(globalLabel(item))}${available(item)?'':'<small>仅菜单</small>'}</button>${available(item)?`<button class="mk-star" data-mk-star="${item.id}" aria-label="${favorites.includes(item.id)?'取消收藏':'收藏'}${esc(globalLabel(item))}" aria-pressed="${favorites.includes(item.id)}">${favorites.includes(item.id)?'★':'☆'}</button>`:''}</div>`).join('')}</section>`).join(''):`<p class="mk-all-empty">${query?'未找到匹配功能，请尝试其他名称。':panelGroup==='favorites'?'还没有收藏，点击功能右侧的星标即可添加。':'暂无最近访问。'}</p>`;
    get('mkAllNotice').textContent='';
  }
  function openAll(category){panelGroup=category||activeGroup;get('mkAllSearch').value='';renderAll();get('mkAllDialog').showModal();get('mkAllSearch').focus();}
  if(schemeC){
    document.querySelector('.mk-nav-foot span:first-child').textContent='方案 C · 场景导航';
    get('mkModuleTitle').setAttribute('role','button');get('mkModuleTitle').setAttribute('tabindex','0');get('mkModuleTitle').title='切换业务模块';
    get('mkModuleTitle').onclick=()=>openAll(activeGroup);
    get('mkModuleTitle').onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openAll(activeGroup);}};
  }
  if(schemeD){
    document.querySelector('.mk-nav-foot span:first-child').textContent='方案 D · 管理员导航 · v2.0.0';
    get('mkModuleTitle').removeAttribute('role');get('mkModuleTitle').removeAttribute('tabindex');get('mkModuleTitle').removeAttribute('title');get('mkModuleTitle').onclick=null;get('mkModuleTitle').onkeydown=null;
  }
  get('mkAllOpen').onclick=()=>openAll();get('mkAllClose').onclick=()=>get('mkAllDialog').close();get('mkAllSearch').oninput=renderAll;
  get('mkPrimary').onclick=event=>{const button=event.target.closest('[data-mk-group]');if(button){panelGroup=button.dataset.mkGroup;get('mkAllSearch').value='';renderAll();}};
  get('mkAllGrid').onclick=event=>{const star=event.target.closest('[data-mk-star]');if(star){const id=star.dataset.mkStar;favorites=favorites.includes(id)?favorites.filter(i=>i!==id):[...favorites,id];persist();renderAll();renderMenu();return;}const button=event.target.closest('[data-mk-destination]');if(button)navigate(items.find(i=>i.id===button.dataset.mkDestination));};
  get('mkAllDialog').addEventListener('click',event=>{if(event.target===get('mkAllDialog')){const r=event.currentTarget.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)event.currentTarget.close();}});
  get('mkSecondary').addEventListener('click',event=>{const button=event.target.closest('[data-mk-activity]');if(button){activityTab=button.dataset.mkActivity;document.querySelector(`[data-activity-tab="${activityTab}"]`).click();sync('activities','activityDetail');}});
  get('mkSecondary').addEventListener('click',event=>{const more=event.target.closest('[data-more-favorites]');if(more){openAll('favorites');return;}const button=event.target.closest('[data-mk-item]');if(button)navigate(items.find(i=>i.id===button.dataset.mkItem));});
  get('mkContextTabs').addEventListener('click',event=>{const button=event.target.closest('[data-mk-tab]');if(button)showPage(button.dataset.mkTab);});
  get('mkFavorite').onclick=()=>{favorites=favorites.includes(current)?favorites.filter(id=>id!==current):[...favorites,current];persist();renderMenu();};
  function collapse(value){document.body.classList.toggle('mk-nav-collapsed',value);get('mkCollapse').setAttribute('aria-expanded',String(!value));get('mkExpand').hidden=!value;try{localStorage.setItem('mk-mega-collapsed',String(value));}catch{}}
  get('mkCollapse').onclick=()=>collapse(true);get('mkExpand').onclick=()=>collapse(false);
  try{collapse(localStorage.getItem('mk-mega-collapsed')==='true');}catch{}
  function search(){
    const query=get('mkSearchInput').value.trim().toLowerCase();
    const matching=query?items.filter(i=>!i.hiddenInMenu&&(i.label+' '+(i.aliases||'')+' '+(i.section||'')+' '+groups.find(g=>g.id===i.group).label).toLowerCase().includes(query)):recent.map(id=>items.find(i=>i.id===id)).filter(item=>item&&!item.hiddenInMenu);
    get('mkSearchResults').innerHTML=`<p class="mk-search-caption">${query?'匹配功能':'最近访问'}</p>`+(matching.length?matching.map(item=>`<button class="mk-search-result" data-mk-result="${item.id}" ${available(item)?'':'aria-disabled="true"'}><span>${esc(item.label)}<small>${esc(groups.find(g=>g.id===item.group).label)}${item.section?' / '+esc(item.section):''}</small></span><em>${available(item)?'打开 →':'仅菜单'}</em></button>`).join(''):'<p class="mk-search-empty">没有匹配的功能，试试旧菜单名称。</p>');
  }
  function openSearch(){
    search();
    const dialog=get('mkSearchDialog');
    if(schemeC){
      const trigger=get('mkSearchOpen').getBoundingClientRect(),width=Math.min(520,window.innerWidth-32);
      dialog.style.width=width+'px';dialog.style.left=Math.max(16,Math.min(trigger.left,window.innerWidth-width-16))+'px';dialog.style.top=(trigger.bottom+6)+'px';
    }
    dialog.showModal();get('mkSearchInput').focus();
  }
  get('mkSearchOpen').onclick=openSearch;get('mkSearchClose').onclick=()=>get('mkSearchDialog').close();get('mkSearchInput').oninput=search;
  get('mkSearchResults').onclick=event=>{const b=event.target.closest('[data-mk-result]');if(b)navigate(items.find(i=>i.id===b.dataset.mkResult));};
  get('mkSearchDialog').addEventListener('click',event=>{if(event.target===get('mkSearchDialog')){const r=event.currentTarget.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)event.currentTarget.close();}});
  document.addEventListener('keydown',event=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();if(!get('mkSearchDialog').open)openSearch();}});
  function route(){
    let key='';try{key=decodeURIComponent(location.hash.slice(1));}catch{}pendingHash=null;restoring=true;
    if(key.startsWith('activityDetail/')){const candidate=key.split('/')[1];activityTab=activityTabs.some(([id])=>id===candidate)?candidate:'activityPage';showPage('activityDetail');document.querySelector(`[data-activity-tab="${activityTab}"]`).click();}
    else if(key.startsWith('content/')){
      if(schemeC){
        const [id,requestedView='list']=key.slice(8).split('/'),item=items.find(i=>i.id===id&&i.content);
        if(item){navigate(item);const valid=(contentViewConfig[item.content]||[]).some(view=>view.id===requestedView);contentViewState=valid?requestedView:'list';setContentView(item.content,contentViewState);renderContentTools(item.content);const destination=schemeD?items.find(entry=>entry.parentId===id&&entry.view===contentViewState)||item:item;sync(destination.id,destination.page);}
        else navigate(items.find(i=>i.id==='contentCenter'));
      }else{
        const item=items.find(i=>i.id===key.slice(8)&&i.content);navigate(item||items.find(i=>i.id==='contentCenter'));
      }
    }
    else if(items.some(i=>i.id===key&&i.leadView)){navigate(items.find(i=>i.id===key));}
    else if(pageTitles[key]&&get(key)?.classList.contains('page')){showPage(key);if(key==='contentCenter')showContentOverview();}
    else navigate(items.find(i=>i.id==='dashboard'));
    restoring=false;
  }
  window.addEventListener('popstate',route);
  window.addEventListener('hashchange',route);
  route();
  const initialMenu=new URLSearchParams(location.search).get('menu');if(initialMenu&&groups.some(g=>g.id===initialMenu))openAll(initialMenu);
})();
