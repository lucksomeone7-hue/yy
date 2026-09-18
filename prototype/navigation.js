(() => {
  const groups = window.MK_NAVIGATION;
  const icons={work:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',customers:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5"/>',content:'<path d="M14 3H5v18h14V8zM14 3v5h5M8 12h8M8 16h6"/>',events:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18m-13 4h2m4 0h2"/>',outreach:'<path d="m3 11 18-8-8 18-2-8zM11 13 21 3"/>',leads:'<path d="M3 4h18l-7 9v6l-4 2v-8z"/>',system:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="currentColor"/><circle cx="15" cy="17" r="3" fill="currentColor"/>'};
  const icon=id=>`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${icons[id]}</svg>`;
  const items = groups.flatMap(group => group.items.map(item => ({...item, group:group.id})));
  const get = id => document.getElementById(id);
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const available = item => Boolean(item.page || item.content);
  const read = (key, fallback) => {try {const data=JSON.parse(localStorage.getItem(key));return Array.isArray(data)?data:fallback;} catch{return fallback;}};
  let favorites=read('mk-nav-favorites',[]).filter(id=>items.some(i=>i.id===id&&available(i)));
  let recent=read('mk-nav-recent',[]).filter(id=>items.some(i=>i.id===id&&available(i))).slice(0,5);
  let current='dashboard', activeGroup='work', selectedPage='dashboard', noticeTimer, restoring=false;
  const remembered={};
  const persist=()=>{try{localStorage.setItem('mk-nav-favorites',JSON.stringify(favorites));localStorage.setItem('mk-nav-recent',JSON.stringify(recent));}catch{}};
  function notice(message){get('mkNavNotice').textContent=message;get('mkNavNotice').hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>get('mkNavNotice').hidden=true,3200);}
  function menuButton(item){return `<button class="mk-menu-item ${item.id===current?'selected':''}" data-mk-item="${item.id}" ${item.id===current?'aria-current="page"':''} ${available(item)?'':`aria-disabled="true" title="${esc(item.label)}：现有系统功能，本原型仅展示菜单"`}><span>${esc(item.label)}</span>${available(item)?'':'<small>仅菜单</small>'}</button>`;}
  function renderMenu(){
    get('mkPrimary').innerHTML=groups.map(g=>`<button class="mk-primary-item ${g.id===activeGroup?'selected':''} ${g.id==='system'?'mk-settings-entry':''}" data-mk-group="${g.id}" aria-pressed="${g.id===activeGroup}" title="${g.label}"><span aria-hidden="true">${icon(g.id)}</span><b>${g.label}</b></button>`).join('');
    const group=groups.find(g=>g.id===activeGroup);get('mkModuleTitle').textContent=group.label;
    document.body.classList.toggle('mk-single-entry',group.id==='events');
    get('mkExpand').hidden=group.id==='events'||!document.body.classList.contains('mk-nav-collapsed');
    let html='',lastSection;
    if(activeGroup==='work'&&favorites.length)html='<p class="mk-section-label">我的收藏</p>'+favorites.map(id=>menuButton(items.find(i=>i.id===id))).join('')+'<p class="mk-section-label">工作台</p>';
    for(const item of group.items){if(item.section&&item.section!==lastSection)html+=`<p class="mk-section-label">${esc(item.section)}</p>`;html+=menuButton(item);lastSection=item.section;}
    get('mkSecondary').innerHTML=html;
    get('mkFavorite').setAttribute('aria-pressed',String(favorites.includes(current)));
    get('mkFavorite').textContent=favorites.includes(current)?'★ 已收藏':'☆ 收藏';
  }
  const pageParents={account:'companies',customerProfile:'users',segmentCreate:'segment',activityDetail:'activities',landingCategories:'landingPages',smsTemplates:'smsManagement',settingsWeights:'settings',settingsVersions:'settings'};
  const tabSets={
    smsManagement:[['smsManagement','短信任务'],['smsTemplates','短信模板']],
    settings:[['settings','评分规则'],['settingsWeights','行为权重'],['settingsVersions','规则版本']],
  };
  let pendingHash=null;
  function sync(id,page){
    const item=items.find(i=>i.id===id);if(!item)return;
    current=id;selectedPage=page||item.page||'contentCenter';activeGroup=item.group;remembered[activeGroup]=id;
    const group=groups.find(g=>g.id===item.group);
    get('mkBreadcrumb').textContent=[group.label,item.section,item.label,page&&page!==item.page&&pageTitles[page]].filter(Boolean).join(' / ');
    if(item.content)get('pageTitle').textContent=item.label;
    const tabs=tabSets[id];get('mkContextTabs').hidden=!tabs;
    get('mkContextTabs').innerHTML=tabs?tabs.map(([target,label])=>`<button data-mk-tab="${target}" ${target===selectedPage?'aria-current="page"':''}>${label}</button>`).join(''):'';
    recent=[id,...recent.filter(x=>x!==id)].slice(0,5);persist();renderMenu();
    const hash='#'+(item.content?'content/'+item.id:selectedPage);
    if(!restoring){pendingHash=hash;queueMicrotask(()=>{if(pendingHash&&location.hash!==pendingHash)history.pushState(null,'',pendingHash);pendingHash=null;});}
  }
  window.mkNavigation={syncPage(page){sync(pageParents[page]||page,page);},syncContent(section){sync(section);}};
  function navigate(item){
    if(!available(item)){get('mkSearchDialog').close();notice(`${item.label}：本版仅展示菜单，暂无对应原型页面。`);return;}
    const oldRestoring=restoring;restoring=true;
    if(item.content){showPage('contentCenter');openContentSection(item.content);}else{showPage(item.page);if(item.page==='contentCenter')showContentOverview();}
    restoring=oldRestoring;sync(item.id,item.page);get('mkSearchDialog').close();
  }
  get('mkPrimary').addEventListener('click',event=>{
    const button=event.target.closest('[data-mk-group]');if(!button)return;
    const group=groups.find(g=>g.id===button.dataset.mkGroup);
    const item=items.find(i=>i.id===remembered[group.id])||items.find(i=>i.group===group.id&&available(i));
    if(item)navigate(item);else{activeGroup=group.id;renderMenu();}
  });
  get('mkSecondary').addEventListener('click',event=>{const button=event.target.closest('[data-mk-item]');if(button)navigate(items.find(i=>i.id===button.dataset.mkItem));});
  get('mkContextTabs').addEventListener('click',event=>{const button=event.target.closest('[data-mk-tab]');if(button)showPage(button.dataset.mkTab);});
  get('mkFavorite').onclick=()=>{favorites=favorites.includes(current)?favorites.filter(id=>id!==current):[...favorites,current];persist();renderMenu();};
  function collapse(value){document.body.classList.toggle('mk-nav-collapsed',value);get('mkCollapse').setAttribute('aria-expanded',String(!value));get('mkExpand').hidden=!value;try{localStorage.setItem('mk-nav-collapsed',String(value));}catch{}}
  get('mkCollapse').onclick=()=>collapse(true);get('mkExpand').onclick=()=>collapse(false);
  try{collapse(localStorage.getItem('mk-nav-collapsed')==='true');}catch{}
  function search(){
    const query=get('mkSearchInput').value.trim().toLowerCase();
    const matching=query?items.filter(i=>(i.label+' '+(i.aliases||'')+' '+groups.find(g=>g.id===i.group).label).toLowerCase().includes(query)):recent.map(id=>items.find(i=>i.id===id));
    get('mkSearchResults').innerHTML=`<p class="mk-search-caption">${query?'匹配功能':'最近访问'}</p>`+(matching.length?matching.map(item=>`<button class="mk-search-result" data-mk-result="${item.id}" ${available(item)?'':'aria-disabled="true"'}><span>${esc(item.label)}<small>${esc(groups.find(g=>g.id===item.group).label)}${item.section?' / '+esc(item.section):''}</small></span><em>${available(item)?'打开 →':'仅菜单'}</em></button>`).join(''):'<p class="mk-search-empty">没有匹配的功能，试试旧菜单名称。</p>');
  }
  function openSearch(){search();get('mkSearchDialog').showModal();get('mkSearchInput').focus();}
  get('mkSearchOpen').onclick=openSearch;get('mkSearchClose').onclick=()=>get('mkSearchDialog').close();get('mkSearchInput').oninput=search;
  get('mkSearchResults').onclick=event=>{const b=event.target.closest('[data-mk-result]');if(b)navigate(items.find(i=>i.id===b.dataset.mkResult));};
  get('mkSearchDialog').addEventListener('click',event=>{if(event.target===get('mkSearchDialog'))get('mkSearchDialog').close();});
  document.addEventListener('keydown',event=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();if(!get('mkSearchDialog').open)openSearch();}});
  function route(){
    let key='';try{key=decodeURIComponent(location.hash.slice(1));}catch{}pendingHash=null;restoring=true;
    if(key.startsWith('content/')){const item=items.find(i=>i.id===key.slice(8)&&i.content);navigate(item||items.find(i=>i.id==='contentCenter'));}
    else if(pageTitles[key]&&get(key)?.classList.contains('page')){showPage(key);if(key==='contentCenter')showContentOverview();}
    else navigate(items.find(i=>i.id==='dashboard'));
    restoring=false;
  }
  window.addEventListener('popstate',route);
  window.addEventListener('hashchange',route);
  route();
})();
