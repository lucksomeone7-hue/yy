/* 列表筛选与概览统一；数字仅统计当前原型中的演示记录。 */
(() => {
  // 保留原有筛选事件与重置逻辑，用下拉框驱动原发布范围按钮。
  const scopeGroups=[['#contentPublishScope','#contentSearchRow'],['.organization-filter','.module-advanced-filter'],['.activity-range-row','.activity-common-filters'],['#landingScope','.landing-filter-fields']];
  scopeGroups.forEach(([source,target])=>{
    const group=document.querySelector(source);if(!group)return;
    const section=group.closest('.page'),row=section.querySelector(target)||section.querySelector('.module-filters');if(!row)return;
    const buttons=[...group.querySelectorAll('button')];if(!buttons.length)return;
    const label=document.createElement('label');label.className='unified-filter-field scope-dropdown';label.innerHTML='<span>发布范围</span><select aria-label="发布范围"></select>';
    const select=label.querySelector('select');buttons.forEach((b,i)=>select.add(new Option(b.textContent.replace(/[\d,]+/g,'').trim(),String(i))));
    const sync=()=>{const i=buttons.findIndex(b=>b.classList.contains('active'));select.value=String(Math.max(0,i));select.refreshInlineLabel?.();};sync();select.onchange=()=>buttons[+select.value].click();
    new MutationObserver(sync).observe(group,{subtree:true,attributes:true,attributeFilter:['class']});
    group.hidden=true;group.style.display='none';if(source==='#landingScope')group.parentElement.style.display='none';
    const keyword=row.querySelector('input:not([type=date])')?.closest('label');if(keyword){row.prepend(keyword);keyword.after(label);}else row.prepend(label);
    row.classList.add('normalized-filter-row');
  });
  // 保留原生 select 的值、键盘操作和筛选事件，用覆盖层分别呈现字段名与选中值。
  function prepareInlineField(field){
    const select=field.querySelector('select');if(!select)return;
    if(!select.refreshInlineLabel){
      [...field.childNodes].filter(node=>node.nodeType===3&&node.textContent.trim()).forEach(node=>{const caption=document.createElement('span');caption.textContent=node.textContent.trim();node.replaceWith(caption);});
      const caption=[...field.children].find(node=>node.tagName==='SPAN'&&!node.querySelector('input,select'));
      const name=caption?.textContent.trim()||select.getAttribute('aria-label')||'筛选';
      if(caption)caption.classList.add('filter-field-name');
      select.setAttribute('aria-label',name);
      const summary=document.createElement('span');summary.className='inline-filter-summary';summary.setAttribute('aria-hidden','true');
      const prefix=document.createElement('span');prefix.className='inline-filter-prefix';prefix.textContent=name+'：';
      const value=document.createElement('span');value.className='inline-filter-value';summary.append(prefix,value);field.append(summary);
      select.refreshInlineLabel=()=>{const selected=select.selectedOptions[0];const text=selected?.textContent.trim()||'请选择';const shown=text.startsWith('全部')?'全部':text;if(value.textContent!==shown)value.textContent=shown;const title=name+'：'+shown;if(field.title!==title)field.title=title;};
      select.addEventListener('change',select.refreshInlineLabel);
      new MutationObserver(select.refreshInlineLabel).observe(select,{subtree:true,childList:true,characterData:true});
    }
    select.refreshInlineLabel();
  }
  // 独立搜索之外最多三个常用条件，发布范围始终优先。
  function normalizeFilters(panel,basic,advanced,toggle){
    if(!basic||basic.dataset.filterRule==='top-three')return;
    basic.dataset.filterRule='top-three';
    basic.querySelectorAll(':scope > select').forEach(select=>{const label=document.createElement('label');label.className='unified-filter-field';select.before(label);const caption=document.createElement('span');caption.textContent=select.dataset.contentFilterField==='category'?'分类':select.dataset.contentFilterField==='status'?'状态':'类型';label.append(caption,select);});
    const keyword=basic.querySelector('input:not([type=date]):not([type=checkbox]):not([type=radio])')?.closest('label');
    const originalGrid=advanced?.querySelector('.unified-filter-fields,.landing-advanced-grid')||advanced;
    const fields=[...basic.querySelectorAll(':scope > label'),...(originalGrid?[...originalGrid.children].filter(field=>field.matches('label,.activity-filter-field')):[])].filter(field=>field!==keyword&&field.querySelector('select,input'));
    const priorities=[
      '.scope-dropdown select,[name=scope],[data-email-scope]',
      '[data-content-filter-field=category],#landingCategory,#activityFormFilter,#companyStatusFilter,#groupTypeFilter,#userIdentityFilter,#intentLevelSelect,#moduleTypeFilter',
      '[data-content-filter-field=status],#landingStatus,#activityStatusFilter,#companyCrmFilter,#groupCreateFilter,#userStatusFilter,#intentIndustryFilter,#moduleSourceFilter',
      '[data-content-filter-field=type],[name=type],#userIndustryFilter,#intentRegionFilter',
    ];
    const priority=field=>{const index=priorities.findIndex(selector=>field.querySelector(selector));return index<0?(field.querySelector('#landingSearchType')?100:50):index;};
    fields.sort((a,b)=>priority(a)-priority(b));
    // 先建高级区，再根据当前页面实际可用控件分配位置。
    if(!advanced&&fields.length>3){advanced=document.createElement('div');advanced.className='list-extra-filters';advanced.hidden=true;basic.append(advanced);}
    const grid=advanced?.querySelector('.unified-filter-fields,.landing-advanced-grid')||advanced;
    const actions=basic.querySelector('.unified-filter-actions,.activity-filter-actions,.landing-filter-actions');
    if(advanced&&!toggle){toggle=document.createElement('button');toggle.type='button';toggle.className='ghost-button list-extra-toggle';toggle.textContent='高级筛选⌄';toggle.setAttribute('aria-expanded','false');const reset=basic.querySelector('[data-reset],[data-email-reset],[data-wechat-reset],.module-reset');if(reset)reset.before(toggle);else if(actions)actions.append(toggle);else basic.append(toggle);toggle.onclick=()=>{advanced.hidden=!advanced.hidden;toggle.setAttribute('aria-expanded',String(!advanced.hidden));toggle.textContent=advanced.hidden?'高级筛选⌄':'收起筛选⌃';};}
    if(keyword){[...keyword.childNodes].filter(node=>node.nodeType===3&&node.textContent.trim()).forEach(node=>{const caption=document.createElement('span');caption.textContent=node.textContent.trim();node.replaceWith(caption);});basic.prepend(keyword);keyword.classList.add('inline-filter-search');const input=keyword.querySelector('input');const caption=[...keyword.children].find(node=>node.tagName==='SPAN'&&!node.querySelector('input'));if(caption){caption.classList.add('filter-field-name');if(!input.hasAttribute('aria-label'))input.setAttribute('aria-label',caption.textContent.trim());}}
    function arrange(){
      let anchor=keyword,count=0,extraCount=0;
      fields.forEach(field=>{
        const available=[...field.querySelectorAll('select,input')].some(input=>!input.hidden);
        const primary=available&&count<3;field.classList.toggle('inline-filter-select',primary&&!!field.querySelector('select'));prepareInlineField(field);
        if(primary){if(anchor){if(anchor.nextElementSibling!==field)anchor.after(field);}else if(basic.firstElementChild!==field)basic.prepend(field);anchor=field;count++;}
        else if(grid){if(field.parentElement!==grid)grid.append(field);if(available)extraCount++;}
      });
      if(toggle){const hide=extraCount===0;if(toggle.hidden!==hide)toggle.hidden=hide;if(toggle.style.display==='none')toggle.style.removeProperty('display');}
      if(advanced&&extraCount===0){if((advanced.classList.contains('list-extra-filters')||advanced.id==='contentArticleAdvanced')&&!advanced.hidden)advanced.hidden=true;advanced.classList.remove('open');toggle?.setAttribute('aria-expanded','false');}
    }
    if(advanced)advanced.style.removeProperty('display');
    arrange();
    panel.addEventListener('click',()=>queueMicrotask(()=>fields.forEach(prepareInlineField)));
    // 内容中心切换文章、资料、表单时，可用字段变化后重新补齐最多三项。
    new MutationObserver(arrange).observe(panel,{subtree:true,attributes:true,attributeFilter:['hidden']});
    basic.querySelectorAll('[data-reset],[data-email-reset],[data-wechat-reset],.module-reset').forEach(button=>button.addEventListener('click',()=>{if(advanced?.classList.contains('list-extra-filters')){advanced.hidden=true;toggle?.setAttribute('aria-expanded','false');if(toggle)toggle.textContent='高级筛选⌄';}}));
    basic.classList.add('normalized-filter-row');
    const search=basic.querySelector(':scope > .primary-button');
    const reset=basic.querySelector(':scope > [data-reset],:scope > [data-content-filter-field=reset],:scope > .module-reset,:scope > [data-email-reset],:scope > [data-wechat-reset]');
    if(search)basic.append(search);if(toggle&&!actions)basic.append(toggle);if(reset)basic.append(reset);if(advanced&&advanced.parentElement===basic)basic.append(advanced);
  }
  document.querySelectorAll('.unified-filter-panel,.activity-filter-panel,.landing-filter-card,#contentSectionFilter,.module-filter-panel').forEach(panel=>normalizeFilters(panel,panel.querySelector('.unified-filter-fields,.activity-common-filters,.landing-filter-fields,#contentSearchRow,.module-advanced-filter'),panel.querySelector('.unified-filter-advanced,.activity-advanced,#landingAdvanced,#contentArticleAdvanced'),panel.querySelector('[aria-controls],#contentAdvancedToggle')));
  // 短信、邮件等列表会重绘，统一规则在每次重绘后重新应用。
  const dynamicRoots=['smsManagement','smsTemplates','emailManagement','wechatMarketing','shareRanking'];
  function normalizeToolbars(root){root.querySelectorAll('.sms-query,.email-toolbar,.outreach-toolbar').forEach(row=>normalizeFilters(row,row,null,null));}
  dynamicRoots.forEach(id=>{const root=document.getElementById(id);if(!root)return;normalizeToolbars(root);new MutationObserver(()=>normalizeToolbars(root)).observe(root,{subtree:true,childList:true});});
  const companies=document.querySelector('#companies');
  if(companies){
    const rows=[...companies.querySelectorAll('.company-list-row')];
    // 精简为企业、评分、状态、趋势、人数、产品、CRM、经营动作。
    companies.querySelectorAll('#companyListTable .table-row').forEach(row=>{[...row.children].forEach((cell,index)=>{if([5,7,8,9].includes(index))cell.remove();});row.style.gridTemplateColumns='1.7fr .7fr .8fr .8fr .8fr 1fr 1fr 1.8fr';});
    const cards=companies.querySelector('.company-summary-row');cards.innerHTML='';
    const specs=[['全部企业',()=>true,'',''],['高意向企业',r=>r.dataset.status==='高意向','高意向',''],['升温企业',r=>r.dataset.status==='升温','升温',''],['未完整同步 CRM',r=>r.dataset.crm!=='已建档','','pending']];
    let pending=false;
    const apply=()=>{filterCompanies();if(pending)rows.forEach(r=>{if(r.dataset.crm==='已建档')r.hidden=true;});const n=rows.filter(r=>!r.hidden).length;document.getElementById('companyEmptyState').hidden=n>0;};
    specs.forEach(([name,predicate,status,crm])=>{const b=document.createElement('button');b.className='overview-filter-card';b.innerHTML=`<span>${name}</span><strong>${rows.filter(predicate).length}</strong><small>${crm?'未建档或部分同步':'按企业状态统计'} · 点击筛选</small>`;b.onclick=()=>{document.getElementById('companyKeyword').value='';document.getElementById('companyStatusFilter').value=status;document.getElementById('companyCrmFilter').value='';pending=crm==='pending';apply();cards.querySelectorAll('button').forEach(c=>c.setAttribute('aria-pressed',String(c===b)));};cards.append(b);});
    companies.querySelector('#companySearchButton').addEventListener('click',apply);companies.querySelectorAll('.unified-reset').forEach(b=>b.addEventListener('click',()=>{pending=false;apply();}));
    const note=document.createElement('p');note.className='module-scope';note.textContent=`概览统计本页全部 ${rows.length} 家演示企业，点击卡片查看对应记录；近7天变化为企业意向分变化。`;cards.after(note);
  }
  const groups=document.querySelector('#segment .group-summary');if(groups){
    const refresh=()=>{const rows=[...document.querySelectorAll('#groupListTable .group-list-row')];groups.innerHTML='';[['全部分组',()=>true,'',''],['条件组',r=>r.dataset.type==='条件组','条件组',''],['固定组',r=>r.dataset.type==='固定组','固定组',''],['AI 生成',r=>r.dataset.create==='AI 生成','','AI 生成']].forEach(([name,test,type,create])=>{const b=document.createElement('button');b.className='overview-filter-card';b.innerHTML=`<span>${name}</span><strong>${rows.filter(test).length}</strong><small>演示分组数 · 点击筛选</small>`;b.onclick=()=>{document.getElementById('groupKeyword').value='';document.getElementById('groupTypeFilter').value=type;document.getElementById('groupCreateFilter').value=create;filterGroups();};groups.append(b);});};refresh();new MutationObserver(refresh).observe(document.getElementById('groupListTable'),{childList:true});
  }
  if(typeof intentLayerData!=='undefined')document.querySelectorAll('[data-intent-level]').forEach(card=>{const config=intentLayerData[card.dataset.intentLevel];card.querySelector('b').textContent=config.rows.length+' 人（演示）';card.title='当前等级的全部演示联系人；点击后叠加行业、地区及行为时间筛选';});
})();
