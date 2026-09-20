/* 营销自动化交互原型：所有数据与操作均为演示。 */
(() => {
  const tasks=[
    {name:'推文下载穿透式监管白皮书',start:'2026-06-01 00:00',end:'2030-06-30 00:00',status:'运行中',channel:'邮件',description:'下载资料后持续执行邮件培育',created:'2026-06-01'},
    {name:'2026 邮件验证',start:'2026-09-03 00:00',end:'2026-09-17 00:00',status:'新建',channel:'邮件',description:'验证新注册用户邮箱并发送激活提醒',created:'2026-09-03'},
    {name:'813 最终测试验证–李丹丹',start:'2025-08-13 00:00',end:'2025-08-14 00:00',status:'已停止',channel:'短信',description:'认证测试任务',created:'2025-08-13'},
    {name:'2025 报名活动触发短信通知验证',start:'2025-08-11 00:00',end:'2025-08-13 00:00',status:'已停止',channel:'短信',description:'报名成功后自动发送活动通知',created:'2025-08-11'},
    {name:'大会活动报名触发短信',start:'2025-08-06 00:00',end:'2025-08-13 00:00',status:'已停止',channel:'短信',description:'活动报名成功即时提醒',created:'2025-08-06'},
    {name:'930 测试',start:'2024-09-13 00:00',end:'2024-09-25 00:00',status:'已结束',channel:'邮件',description:'任务已按计划完成',created:'2024-09-13'}
  ];
  let query='',status='全部';
  const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function notice(message){const node=document.getElementById('mkNavNotice');node.textContent=message;node.hidden=false;setTimeout(()=>node.hidden=true,2400);}
  function render(){
    const root=document.getElementById('automation');
    const rows=tasks.filter(item=>(status==='全部'||item.status===status)&&(!query||item.name.toLowerCase().includes(query.toLowerCase())));
    const statusTabs=['全部','新建','运行中','已停止','已结束'].map(value=>{
      const count=value==='全部'?tasks.length:tasks.filter(item=>item.status===value).length;
      return `<button class="${status===value?'active':''}" data-auto-status="${value}">${value}<small>${count}</small></button>`;
    }).join('');
    const tableRows=rows.map(item=>{
      const stateClass=item.status==='新建'?'new':item.status==='运行中'?'running':item.status==='已停止'?'stopped':'ended';
      const channelClass=item.channel==='邮件'?'mail':'sms';
      const editDisabled=item.status==='运行中'?'disabled':'';
      const toggleLabel=item.status==='运行中'?'停止':'启动';
      return `<span><strong>${esc(item.name)}</strong></span><span>${item.start}</span><span>${item.end}</span><span><em class="automation-state ${stateClass}">${item.status}</em></span><span><i class="automation-channel ${channelClass}">${item.channel}</i></span><span>${esc(item.description)}</span><span>${item.created}</span><span class="automation-actions"><button>统计</button><button ${editDisabled}>编辑</button><button>${toggleLabel}</button><button class="danger">删除</button></span>`;
    }).join('');
    const empty=rows.length?'':'<div class="email-empty">没有找到匹配的自动化任务。</div>';
    root.innerHTML=`<div class="sms-header"><div><h3>营销自动化</h3><p>按触发条件自动执行短信或邮件任务，并持续查看运行结果。</p></div><button class="primary-button" data-auto-create>＋ 新建任务</button></div><div class="automation-panel"><div class="automation-toolbar"><label><span class="mk-visually-hidden">搜索任务主题</span><input type="search" value="${esc(query)}" placeholder="请输入任务主题"></label><button class="primary-button" data-auto-search>搜索</button><button class="ghost-button" data-auto-reset>重置</button></div><nav class="email-tabs" aria-label="任务状态">${statusTabs}</nav><div class="automation-summary"><span><b>${tasks.length}</b>全部任务</span><span><b>${tasks.filter(item=>item.status==='运行中').length}</b>运行中</span><span><b>${tasks.filter(item=>item.channel==='短信').length}</b>短信任务</span><span><b>${tasks.filter(item=>item.channel==='邮件').length}</b>邮件任务</span></div><div class="automation-table-scroll"><div class="automation-table"><b>任务主题</b><b>开始时间</b><b>结束时间</b><b>状态</b><b>发送方式</b><b>描述</b><b>创建时间</b><b>操作</b>${tableRows}</div></div>${empty}</div>`;
    const input=root.querySelector('input');
    root.querySelector('[data-auto-search]').onclick=()=>{query=input.value.trim();render();};
    input.onkeydown=event=>{if(event.key==='Enter'){query=input.value.trim();render();}};
    root.querySelector('[data-auto-reset]').onclick=()=>{query='';status='全部';render();};
    root.querySelectorAll('[data-auto-status]').forEach(button=>button.onclick=()=>{status=button.dataset.autoStatus;render();});
    root.querySelector('[data-auto-create]').onclick=()=>notice('新建自动化任务：本原型仅展示入口。');
    root.querySelectorAll('.automation-actions button').forEach(button=>button.onclick=()=>notice(`${button.textContent}任务：交互入口已保留。`));
  }
  render();
})();
