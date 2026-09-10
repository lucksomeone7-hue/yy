const pageTitles = {
  smsManagement: "短信管理",
  smsTemplates: "短信模板",
  moduleManagement: "模块管理",
  dashboard: "经营看板",
  layers: "客户意向分层",
  companies: "企业账户",
  account: "企业洞察",
  actions: "经营动作中心",
  landingPages: "落地页管理",
  users: "用户列表",
  customerProfile: "客户画像",
  profileTags: "用户画像",
  segment: "用户分组",
  segmentCreate: "AI 创建分组",
  settings: "客户意向评分规则",
  settingsWeights: "行为权重",
  settingsPermissions: "权限",
  settingsVersions: "规则版本",
};

const moduleFilterState = { organization: "all" };

function filterModules() {
  const type = document.getElementById("moduleTypeFilter").value;
  const source = document.getElementById("moduleSourceFilter").value;
  const query = document.getElementById("moduleNameSearch").value.trim().toLowerCase();
  const rows = [...document.querySelectorAll(".module-data-row")];
  let visibleCount = 0;

  rows.forEach((row) => {
    const matchesOrganization = moduleFilterState.organization === "all" || row.dataset.organization === moduleFilterState.organization;
    const matchesType = type === "all" || row.dataset.type === type;
    const matchesSource = source === "all" || row.dataset.source === source;
    const matchesName = !query || row.dataset.name.toLowerCase().includes(query);
    const visible = matchesOrganization && matchesType && matchesSource && matchesName;
    row.classList.toggle("hidden", !visible);
    if (visible) visibleCount += 1;
  });

  document.getElementById("moduleResultSummary").textContent = `共 ${visibleCount} 个模板`;
  document.getElementById("modulePaginationText").textContent = visibleCount ? `显示 1–${visibleCount}，共 ${visibleCount} 条` : "暂无匹配数据";
  document.getElementById("moduleEmptyState").hidden = visibleCount !== 0;
}

function resetModuleFilters() {
  moduleFilterState.organization = "all";
  document.querySelectorAll("[data-organization]").forEach((button) => {
    if (button.matches("button")) button.classList.toggle("active", button.dataset.organization === "all");
  });
  document.getElementById("moduleTypeFilter").value = "all";
  document.getElementById("moduleSourceFilter").value = "all";
  document.getElementById("moduleNameSearch").value = "";
  filterModules();
}

document.querySelectorAll(".organization-filter [data-organization]").forEach((button) => {
  button.addEventListener("click", () => {
    moduleFilterState.organization = button.dataset.organization;
    document.querySelectorAll(".organization-filter [data-organization]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    filterModules();
  });
});
document.getElementById("moduleTypeFilter").addEventListener("change", filterModules);
document.getElementById("moduleSourceFilter").addEventListener("change", filterModules);
document.getElementById("moduleNameSearch").addEventListener("input", filterModules);
document.getElementById("resetModuleFilters").addEventListener("click", resetModuleFilters);
document.getElementById("emptyResetModuleFilters").addEventListener("click", resetModuleFilters);
document.getElementById("createModuleButton").addEventListener("click", (event) => {
  event.currentTarget.textContent = "新建功能待接入";
  setTimeout(() => { event.currentTarget.textContent = "＋ 新建模板"; }, 1400);
});

function showPage(page) {
  const parentPage = {
    account: "companies",
    segmentCreate: "segment",
  };
  const activePage = parentPage[page] || page;
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.page === activePage);
  });
  document.querySelectorAll(".page").forEach((section) => section.classList.remove("active"));
  document.getElementById(page).classList.add("active");
  document.getElementById("pageTitle").textContent = pageTitles[page];
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => showPage(button.dataset.page));
});

document.querySelectorAll("[data-jump]").forEach((button) => {
  button.addEventListener("click", () => {
    showPage(button.dataset.jump);
    if (button.dataset.aiTemplate) applySegmentTemplate(button.dataset.aiTemplate);
  });
});

document.querySelectorAll(".time-filter button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".time-filter button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    document.getElementById("dashboardDateNote").textContent =
      `${button.dataset.range}：经营动作按所选时间统计；趋势转化和漏斗仍保留各模块默认口径。`;
  });
});

document.querySelectorAll("[data-conversion-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    const tab = button.dataset.conversionTab;
    document.querySelectorAll("[data-conversion-tab]").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".conversion-panel").forEach((panel) => panel.classList.remove("active"));
    button.classList.add("active");
    document.getElementById(`${tab}Conversion`).classList.add("active");
    document.getElementById("conversionTitle").textContent = tab === "channel" ? "渠道转化概览" : "转化入口概览";
    document.getElementById("conversionScope").textContent =
      tab === "channel"
        ? "默认口径：近7天转化，按首次触达渠道归因"
        : "默认口径：近7天转化，按客户实际留资入口统计";
  });
});

const intentLayerData = {
  high: {
    title: "高意向客户",
    scope: "80-100 分 · 近期出现明确产品兴趣或转化行为",
    actions: ["未进入 CRM：同步为线索", "已有销售跟进：提醒销售关注最新行为", "多人同企业活跃：查看企业洞察"],
    rows: [
      ["张三", "XX 制造集团", "制造业", 94, "下载制造业白皮书", "待企业同步", "同步 CRM", "account-crm", "XX 制造集团"],
      ["陈洁", "海川医疗", "医疗", 83, "访问价格页", "已有线索", "提醒销售"],
      ["李明", "华东装备", "制造业", 81, "近 7 天访问方案页 4 次", "跟进中", "更新线索动态"],
    ],
  },
  mid: {
    title: "中意向客户",
    scope: "50-79 分 · 已形成持续关注，尚未出现明确转化信号",
    actions: ["阅读客户案例：发送同行业案例", "报名未签到：发送活动回放", "连续活跃：加入重点培育分组"],
    rows: [
      ["王宇", "远航自动化", "制造业", 67, "连续阅读制造业客户案例", "未同步", "发送行业案例"],
      ["林浩", "中诚科技", "软件服务", 58, "活动报名未签到", "未同步", "发送活动回放"],
      ["刘敏", "泰禾工业", "制造业", 53, "近 14 天访问产品页 2 次", "培育中", "加入重点培育"],
    ],
  },
  low: {
    title: "低意向客户",
    scope: "20-49 分 · 行为较浅，适合低频、非销售式内容触达",
    actions: ["阅读行业内容：加入常规内容培育", "关注主题明确：推荐相关内容", "不建议直接同步 CRM"],
    rows: [
      ["赵敏", "中诚科技", "软件服务", 42, "阅读数字营销行业文章", "未同步", "内容培育"],
      ["李峰", "启航科技", "互联网", 31, "访问官网产品介绍", "未同步", "推荐产品内容"],
      ["吴倩", "恒远商贸", "零售", 24, "阅读新闻资讯", "未同步", "加入常规培育"],
    ],
  },
  silent: {
    title: "沉默客户",
    scope: "0-19 分 · 长期无有效活跃，意向分已随时间衰减",
    actions: ["历史有价值客户：进入召回分组", "长期无响应：暂缓经营", "无效或拒绝触达：排除推荐"],
    rows: [
      ["周宁", "华北机电", "制造业", 14, "65 天无有效活跃", "历史线索", "加入召回分组"],
      ["孙敏", "创源咨询", "专业服务", 8, "120 天无有效活跃", "未同步", "暂缓经营"],
      ["郑伟", "明德教育", "教育", 3, "180 天无有效活跃", "已退订", "排除触达"],
    ],
  },
};

function renderIntentLayer(level) {
  const config = intentLayerData[level];
  const table = document.getElementById("intentCustomerTable");
  const heading = table.querySelector(".table-head").outerHTML;
  document.querySelectorAll("[data-intent-level]").forEach((button) => {
    button.classList.toggle("active", button.dataset.intentLevel === level);
  });
  document.getElementById("intentLevelSelect").value = level;
  document.getElementById("intentListTitle").textContent = config.title;
  document.getElementById("intentListScope").textContent = config.scope;
  const guide = document.getElementById("intentActionGuide");
  guide.className = `intent-action-guide ${level}`;
  guide.innerHTML = `<strong>下一步建议</strong>${config.actions.map((action) => `<span>${action}</span>`).join("")}`;
  table.innerHTML = heading + config.rows.map((row) => {
    const actionKind = row[7] || (row[6].includes("CRM") ? "crm" : row[6].includes("销售") || row[6].includes("线索") ? "sales" : row[6].includes("排除") ? "ads" : "nurture");
    const actionTarget = row[8] || `${row[0]} / ${row[1]}`;
    return `
    <div class="table-row intent-customer-row">
      <span><button class="inline-link" data-intent-profile>${row[0]}</button></span>
      <span>${row[1]}</span><span>${row[2]}</span>
      <span><b class="score ${level}">${row[3]}</b></span>
      <span>${row[4]}</span><span>${row[5]}</span>
      <span><button class="mini-button next-action-button" data-action-kind="${actionKind}" data-action-target="${actionTarget}" data-action-score="${row[3]}" data-action-reason="${row[4]}；CRM 状态：${row[5]}">处理建议</button></span>
    </div>`;
  }).join("");
}

document.querySelectorAll("[data-intent-level]").forEach((button) => {
  button.addEventListener("click", () => renderIntentLayer(button.dataset.intentLevel));
});
document.getElementById("intentLevelSelect").addEventListener("change", (event) => renderIntentLayer(event.target.value));
document.getElementById("intentCustomerTable").addEventListener("click", (event) => {
  if (event.target.closest("[data-intent-profile]")) showPage("profileTags");
});

const actionDrawer = document.getElementById("actionDrawer");
const actionDrawerFooter = document.getElementById("actionDrawerFooter");
const actionSuccess = document.getElementById("actionSuccess");
let currentActionStep = 1;
let currentAction = { kind: "crm", target: "张三 / XX 制造集团", score: 94, reason: "下载制造业白皮书并提交有效联系方式，尚未进入 CRM" };
let selectedActionChannel = "Email";
let selectedActionContent = "制造业数字化案例精读";
let currentActionButton = null;

const actionLabels = {
  crm: { title: "同步 CRM", goal: "CRM 返回线索 ID", next: "待销售查看与反馈", success: "CRM 线索已创建" },
  sales: { title: "提醒销售", goal: "销售提交有效性反馈", next: "待销售查看与反馈", success: "销售提醒已发送" },
  nurture: { title: "内容培育", goal: "7 天内访问方案页", next: "观察客户互动与目标事件", success: "内容动作已进入执行队列" },
  ads: { title: "广告或站内承接", goal: "获得有效留资与渠道授权", next: "等待匿名身份转为可经营客户", success: "受众同步任务已创建" },
  "account-crm": { title: "同步 CRM", goal: "CRM 返回企业 ID 并写入活跃人员", next: "待销售查看企业动态", success: "企业与活跃人员已同步 CRM" },
  "account-update": { title: "更新 CRM 动态", goal: "最新人员与行为摘要写入已有企业", next: "待销售查看最新动态", success: "CRM 企业动态已更新" },
  "account-opportunity": { title: "标记企业机会", goal: "销售提交机会有效性反馈", next: "机会关注中 · 等待销售确认", success: "企业机会已标记" },
};

const accountCrmData = {
  "XX 制造集团": {
    match: "发现可能匹配企业",
    mode: "关联已有企业并补充人员",
    count: "3 名有效人员 · 1 名匿名访客仅汇总",
    people: [
      ["张三", "企业邮箱已验证", "采购负责人", 94, "下载白皮书"],
      ["李四", "手机号已验证", "信息化经理", 82, "访问方案页 3 次"],
      ["赵敏", "企业邮箱已验证", "财务负责人", 71, "查看客户案例"],
    ],
    behaviors: [["3 名有效人员持续关注供应链云方案", "今日"], ["产品方案页访问 8 次，较上周增长 60%", "近 7 天"], ["新增 1 次白皮书下载", "昨日"]],
  },
  "海川医疗": {
    match: "已匹配 CRM 企业 · ACC-20418",
    mode: "更新已有企业动态，不重复建档",
    count: "2 名有效人员 · 无匿名人员写入",
    people: [
      ["陈洁", "企业邮箱已验证", "信息化经理", 78, "访问智能决策方案"],
      ["林涛", "手机号已验证", "业务负责人", 73, "查看医疗行业案例"],
    ],
    behaviors: [["新增 2 名活跃人员关注智能决策系统", "今日"], ["医疗行业案例累计阅读 6 次", "近 7 天"], ["企业意向分上升 7 分", "近 7 天"]],
  },
  "远航自动化": {
    match: "CRM 中未发现同名企业",
    mode: "新建企业并同步有效人员",
    count: "2 名有效人员 · 3 名匿名访客仅汇总",
    people: [
      ["王宇", "企业邮箱已验证", "设备负责人", 69, "访问自动化方案页"],
      ["刘晨", "手机号已验证", "生产经理", 64, "报名行业活动"],
    ],
    behaviors: [["2 名有效人员近期仍有产品兴趣", "近 7 天"], ["3 名匿名访客访问自动化方案页", "近 7 天"], ["企业意向分下降 4 分，建议销售先判断时机", "今日"]],
  },
};

function isHandoffAction() {
  return currentAction.kind === "crm" || currentAction.kind === "sales" || isAccountCrmAction() || isAccountOpportunityAction();
}

function isAccountCrmAction() {
  return currentAction.kind === "account-crm" || currentAction.kind === "account-update";
}

function isAccountOpportunityAction() {
  return currentAction.kind === "account-opportunity";
}

function renderActionStep(step) {
  currentActionStep = step;
  document.querySelectorAll("[data-action-step]").forEach((button) => {
    const buttonStep = Number(button.dataset.actionStep);
    button.classList.toggle("active", buttonStep === step);
    button.classList.toggle("done", buttonStep < step);
    button.querySelector("span").textContent = buttonStep < step ? "✓" : String(buttonStep);
  });
  document.querySelectorAll("[data-action-panel]").forEach((panel) => panel.classList.toggle("active", Number(panel.dataset.actionPanel) === step));
  actionSuccess.setAttribute("aria-hidden", "true");
  actionDrawerFooter.hidden = false;
  document.getElementById("previousActionStep").textContent = step === 1 ? "忽略建议" : "上一步";
  document.getElementById("nextActionStep").textContent = step < 3 ? "继续 →" : isAccountOpportunityAction() ? "确认标记并通知销售 →" : isHandoffAction() ? "确认交接 →" : "确认执行 →";
  if (step === 3) updateActionPreview();
}

function updateActionPreview() {
  const handoff = isHandoffAction();
  const accountCrm = isAccountCrmAction();
  const opportunity = isAccountOpportunityAction();
  const opportunityType = document.getElementById("opportunityType").value;
  const opportunityProduct = document.getElementById("opportunityProduct").value;
  document.getElementById("handoffPreview").hidden = !handoff;
  document.getElementById("messagePreview").hidden = handoff || currentAction.kind === "ads";
  document.getElementById("previewTitle").textContent = opportunity ? "企业机会信号预览" : accountCrm ? "CRM 企业同步预览" : handoff ? "销售交接预览" : currentAction.kind === "ads" ? "受众同步确认" : `${selectedActionChannel} 内容预览`;
  document.getElementById("previewHandoffTitle").textContent = opportunity ? `${currentAction.target}将标记为${opportunityType}` : accountCrm ? `${currentAction.target}及活跃人员将同步至 CRM` : `${currentAction.target.split(" /")[0]} 出现新的高意向行为`;
  document.getElementById("previewHandoffCopy").textContent = opportunity ? `关注产品：${opportunityProduct}。企业意向分 ${currentAction.score}，已关联 3 名关键人员。该信号将通知销售确认，不会自动创建 CRM 正式商机。` : accountCrm ? `企业意向分 ${currentAction.score}。${currentAction.reason}同步后销售可在企业记录中查看人员与行为摘要。` : `意向分 ${currentAction.score}。${currentAction.reason}。建议在 24 小时内确认线索有效性。`;
  document.getElementById("previewAvatar").textContent = opportunity || accountCrm ? "企" : currentAction.target.charAt(0);
  document.getElementById("previewHandoffActions").innerHTML = opportunity ? "<b>查看企业洞察</b><b>确认为机会</b><b>继续观察</b>" : accountCrm ? "<b>查看 CRM 企业</b><b>确认已查看</b><b>暂不跟进</b>" : "<b>查看客户档案</b><b>有效线索</b><b>暂无需求</b>";
  document.getElementById("previewContentName").textContent = selectedActionContent;
  document.getElementById("confirmTarget").textContent = currentAction.target;
  document.getElementById("confirmMode").textContent = opportunity ? "Marketing Cloud 标记 + CRM 机会信号" : accountCrm ? accountCrmData[currentAction.target].mode : handoff ? "CRM / 销售交接" : currentAction.kind === "ads" ? "广告受众或站内承接" : `平台执行 · ${selectedActionChannel}`;
  document.getElementById("confirmGoal").textContent = actionLabels[currentAction.kind].goal;
  document.getElementById("confirmNextState").textContent = actionLabels[currentAction.kind].next;
}

function openActionDrawer(button) {
  currentActionButton = button;
  currentAction = {
    kind: button.dataset.actionKind || "nurture",
    target: button.dataset.actionTarget || "待处理客户",
    score: Number(button.dataset.actionScore || 0),
    reason: button.dataset.actionReason || "近期出现新的经营信号",
  };
  const labels = actionLabels[currentAction.kind];
  const handoff = isHandoffAction();
  const accountCrm = isAccountCrmAction();
  const opportunity = isAccountOpportunityAction();
  document.getElementById("actionDrawerTitle").textContent = labels.title;
  document.getElementById("actionDrawerTarget").textContent = `${currentAction.target} · 意向分 ${currentAction.score}`;
  document.getElementById("actionDrawerCode").textContent = `NEXT BEST ACTION · ${currentAction.score >= 80 ? "P0" : currentAction.score >= 50 ? "P1" : "P2"}`;
  document.getElementById("actionReason").textContent = currentAction.reason;
  document.getElementById("actionScore").textContent = `${currentAction.score} · ${currentAction.score >= 80 ? "高意向" : currentAction.score >= 50 ? "中意向" : "低意向"}`;
  document.getElementById("actionGoal").textContent = labels.goal;
  document.getElementById("actionJudgement").textContent = opportunity
    ? "该企业已形成多人、跨角色的高价值行为，可提交企业级机会信号给销售确认；当前不会直接创建 CRM 正式商机。"
    : accountCrm
    ? "企业账户页不直接向人员发送内容。本次仅将企业画像、有效活跃人员与关键行为同步给销售，辅助判断后续跟进。"
    : handoff
    ? "该对象已具备明确转化信号。继续常规培育可能与销售动作冲突，建议优先完成交接。"
    : currentAction.kind === "ads"
      ? "意向较高，但缺少有效联系方式或渠道授权，不能直接发送内容。"
      : "当前适合推动一个相邻决策行为，不建议直接使用强销售话术。";
  document.getElementById("actionBehavior").textContent = opportunity ? "3 名关键角色持续访问产品与决策内容" : accountCrm ? "企业下多名人员近期持续活跃" : currentAction.kind === "nurture" ? "持续阅读案例或活动内容" : currentAction.kind === "ads" ? "匿名访问方案与价格页" : "访问价格页并完成留资";
  document.getElementById("actionStepTwoLabel").textContent = opportunity ? "机会设置" : accountCrm ? "同步内容" : handoff ? "交接设置" : currentAction.kind === "ads" ? "承接设置" : "内容与渠道";
  document.querySelectorAll("[data-action-mode]").forEach((mode) => mode.hidden = mode.dataset.actionMode !== (opportunity ? "account-opportunity" : accountCrm ? "account-crm" : handoff ? "handoff" : currentAction.kind));
  document.getElementById("consentCheck").className = `action-check ${currentAction.kind === "ads" ? "warning" : "ok"}`;
  document.getElementById("consentCheck").querySelector("small").textContent = opportunity ? "机会信号仅关联已识别人员，不进行营销发送" : accountCrm ? "仅同步已识别的有效人员；匿名访客只做企业级汇总" : currentAction.kind === "ads" ? "无有效联系方式，禁止直接发送" : "当前执行渠道授权有效";
  document.getElementById("consentCheck").querySelector("b").textContent = currentAction.kind === "ads" ? "不可直达" : "通过";
  document.getElementById("salesProtectionCheck").className = `action-check ${handoff ? "warning" : "ok"}`;
  document.getElementById("salesProtectionCheck").querySelector("small").textContent = opportunity ? "未发现活跃 CRM 商机；标记后等待销售确认" : accountCrm ? "仅更新 CRM 资料，不自动创建销售任务或商机" : handoff ? "交接后暂停营销触达，等待销售反馈" : "当前无销售负责人或活跃商机";
  document.getElementById("salesProtectionCheck").querySelector("b").textContent = opportunity ? "等待确认" : handoff ? "优先交接" : "通过";
  document.getElementById("handoffSummary").value = `意向分 ${currentAction.score}。${currentAction.reason}。建议优先确认采购时间与决策角色。`;
  if (accountCrm) renderAccountCrmData();
  actionDrawer.setAttribute("aria-hidden", "false");
  renderActionStep(1);
}

function renderAccountCrmData() {
  const data = accountCrmData[currentAction.target];
  document.getElementById("accountCrmMatchStatus").textContent = data.match;
  document.getElementById("accountCrmTarget").textContent = currentAction.target;
  document.getElementById("accountCrmWriteMode").textContent = data.mode;
  document.getElementById("accountActiveCount").textContent = data.count;
  document.getElementById("accountActivePeople").innerHTML = `<div class="account-sync-person head"><span>人员</span><span>角色</span><span>意向</span><span>最近行为</span></div>${data.people.map(([name, identity, role, score, behavior]) => `<div class="account-sync-person"><span><b>${name}</b><small>${identity}</small></span><span>${role}</span><span><b class="score ${score >= 80 ? "high" : "mid"}">${score}</b></span><span>${behavior}</span></div>`).join("")}`;
  document.getElementById("accountBehaviorTimeline").innerHTML = data.behaviors.map(([behavior, time]) => `<li><b>${behavior}</b><span>${time}</span></li>`).join("");
}

function closeActionDrawer() {
  actionDrawer.setAttribute("aria-hidden", "true");
}

document.addEventListener("click", (event) => {
  const actionButton = event.target.closest(".next-action-button");
  if (actionButton) openActionDrawer(actionButton);
});

document.getElementById("closeActionDrawer").addEventListener("click", closeActionDrawer);
actionDrawer.addEventListener("click", (event) => {
  if (event.target === actionDrawer) closeActionDrawer();
});
document.querySelectorAll("[data-action-step]").forEach((button) => button.addEventListener("click", () => renderActionStep(Number(button.dataset.actionStep))));
document.getElementById("previousActionStep").addEventListener("click", () => {
  if (currentActionStep > 1) renderActionStep(currentActionStep - 1);
  else closeActionDrawer();
});
document.getElementById("nextActionStep").addEventListener("click", () => {
  if (currentActionStep < 3) {
    renderActionStep(currentActionStep + 1);
    return;
  }
  document.querySelectorAll("[data-action-panel]").forEach((panel) => panel.classList.remove("active"));
  actionSuccess.setAttribute("aria-hidden", "false");
  actionDrawerFooter.hidden = true;
  document.getElementById("actionSuccessTitle").textContent = actionLabels[currentAction.kind].success;
  document.getElementById("actionSuccessCopy").textContent = isAccountOpportunityAction() ? "机会信号及关键人员摘要已通知销售。只有销售确认有效后，才进入 CRM 正式商机创建流程。" : isAccountCrmAction() ? "销售可在 CRM 企业记录中查看本次同步的活跃人员与关键行为；匿名访客仅以企业级摘要呈现。" : isHandoffAction() ? "系统将等待销售查看并反馈；反馈前不会继续营销触达。" : "执行、送达、互动和目标事件会自动回流到客户档案。";
  document.getElementById("actionSuccessState").textContent = `下一状态：${actionLabels[currentAction.kind].next}`;
  if (isAccountOpportunityAction() && currentActionButton) {
    currentActionButton.textContent = "等待销售确认";
    currentActionButton.disabled = true;
  }
});

document.querySelectorAll("#opportunityType, #opportunityProduct").forEach((select) => select.addEventListener("change", () => {
  if (currentActionStep === 3 && isAccountOpportunityAction()) updateActionPreview();
}));

document.querySelectorAll(".channel-choice button[data-channel]").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".channel-choice button[data-channel]").forEach((item) => item.classList.remove("selected"));
  button.classList.add("selected");
  selectedActionChannel = button.dataset.channel;
}));
document.querySelectorAll(".content-choice button").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".content-choice button").forEach((item) => {
    item.classList.remove("selected");
    item.querySelector("em").textContent = "+";
  });
  button.classList.add("selected");
  button.querySelector("em").textContent = "✓";
  selectedActionContent = button.dataset.content;
}));

document.getElementById("openBatchPrecheck").addEventListener("click", () => document.getElementById("batchPrecheck").setAttribute("aria-hidden", "false"));
document.getElementById("closeBatchPrecheck").addEventListener("click", () => document.getElementById("batchPrecheck").setAttribute("aria-hidden", "true"));
document.querySelectorAll("[data-action-filter]").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll("[data-action-filter]").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  document.querySelectorAll(".action-queue-row").forEach((row) => row.classList.toggle("hidden", button.dataset.actionFilter !== "all" && row.dataset.actionStatus !== button.dataset.actionFilter));
}));

document.getElementById("parseButton").addEventListener("click", () => {
  const input = document.getElementById("segmentInput").value;
  const chips = [];

  if (input.includes("制造")) chips.push("行业 = 制造业");
  if (input.includes("30天")) chips.push("最近 30 天活跃下降");
  if (input.includes("活动")) chips.push("历史参加过活动");
  if (input.includes("高意向")) chips.push("意向等级 = 高意向");

  const fallback = ["行业 = 制造业", "最近 30 天活跃下降", "历史参加过活动", "意向分 > 40"];
  document.getElementById("ruleChips").innerHTML = (chips.length ? chips : fallback)
    .map((chip) => `<span>${chip}</span>`)
    .join("");
});

document.getElementById("publishSegmentButton").addEventListener("click", () => {
  document.getElementById("publishNote").classList.add("visible");
});

const segmentTemplates = {
  silent: {
    prompt: "帮我找出最近 30 天活跃下降，但曾经参加过活动的制造业客户",
    name: "制造业活动沉默客户召回",
    estimate: "3,428",
    chips: ["行业 = 制造业", "近 30 天活跃下降", "历史参加活动", "意向分 > 40"],
    statement: "识别“活动后沉默的制造业客户”，建议先通过内容或活动召回，再将重新升温的高意向客户交由销售跟进。",
  },
  high: {
    prompt: "找出意向分达到 80、近 7 天有活跃，但尚未进入 CRM 的客户",
    name: "高意向未进入 CRM 客户",
    estimate: "864",
    chips: ["意向分 ≥ 80", "近 7 天有活跃", "未进入 CRM"],
    statement: "识别可立即交给销售的高意向新客，仅为未进入 CRM 的客户生成线索待创建名单。",
  },
  page: {
    prompt: "找出近 7 天访问方案页 2 次以上、但未提交表单的客户",
    name: "方案页高频访问未留资客户",
    estimate: "1,246",
    chips: ["方案页访问 ≥ 2 次", "近 7 天", "未提交表单"],
    statement: "识别具有产品兴趣但尚未留资的客户，建议先加入内容培育，避免直接进入销售队列。",
  },
  noshow: {
    prompt: "找出活动已报名但未签到、且意向分超过 50 的客户",
    name: "活动报名未签到客户回访",
    estimate: "718",
    chips: ["活动已报名", "未签到", "意向分 > 50"],
    statement: "识别报名未签到但仍有潜在意向的客户，建议使用活动回放或案例内容进行轻量回访。",
  },
  multi: {
    prompt: "找出近 7 天同企业至少 3 名联系人活跃，且访问过产品或解决方案页的企业",
    name: "多人活跃企业",
    estimate: "126",
    chips: ["近 7 天企业内活跃联系人 ≥ 3", "访问产品或方案页", "企业意向分 ≥ 70"],
    statement: "识别出现多人协同关注信号的企业，建议优先查看企业洞察并确认是否需要销售介入。",
  },
  dormant: {
    prompt: "找出意向分超过 80、但最近 30 天未活跃的客户",
    name: "沉默高意向客户",
    estimate: "356",
    chips: ["意向分 ≥ 80", "最近 30 天未活跃", "CRM 状态可经营"],
    statement: "识别历史高意向但近期沉默的客户，建议先用内容或活动进行轻量召回，再根据再活跃情况转销售。",
  },
};

function applySegmentTemplate(key) {
  const template = segmentTemplates[key];
  if (!template) return;
  document.getElementById("segmentInput").value = template.prompt;
  document.getElementById("segmentName").value = template.name;
  document.getElementById("ruleChips").innerHTML = template.chips.map((chip) => `<span>${chip}</span>`).join("");
  document.getElementById("segmentStatement").textContent = template.statement;
  document.getElementById("segmentTopEstimate").textContent = `预估 ${template.estimate} 人`;
  document.getElementById("segmentMainEstimate").textContent = template.estimate;
  document.querySelectorAll("[data-ai-template]").forEach((item) => {
    item.classList.toggle("active", item.dataset.aiTemplate === key);
  });
}

document.querySelectorAll("[data-ai-template]").forEach((button) => {
  button.addEventListener("click", () => applySegmentTemplate(button.dataset.aiTemplate));
});

document.getElementById("clearSegmentButton").addEventListener("click", () => {
  document.getElementById("segmentInput").value = "";
});

document.querySelectorAll("[data-activity-answer]").forEach((button) => {
  button.addEventListener("click", () => {
    document.getElementById("activityValue").value = button.dataset.activityAnswer;
  });
});

const crmSamples = {
  all: [
    ["李敏 / 华东装备", "61", "阅读案例后活跃下降", "未进入 CRM", "内容召回后创建线索"],
    ["赵强 / 南方智造", "84", "下载白皮书后 12 天未活跃", "销售跟进中", "更新行为并提醒销售"],
    ["王宇 / 远航自动化", "67", "活动报名未签到", "暂时无效：时机未到", "召回后进入再激活复核"],
  ],
  new: [["李敏 / 华东装备", "61", "阅读案例后活跃下降", "未进入 CRM", "内容召回后创建线索"]],
  working: [["赵强 / 南方智造", "84", "下载白皮书后 12 天未活跃", "销售跟进中", "更新行为并提醒销售"]],
  invalid: [["王宇 / 远航自动化", "67", "活动报名未签到", "暂时无效：时机未到", "召回后进入再激活复核"]],
  converted: [["陈洁 / 泰禾工业", "73", "方案页访问 3 次", "已转化 Contact", "更新客户动态，创建任务"]],
};

function renderCrmSamples(status) {
  const table = document.getElementById("crmSampleTable");
  const heading = table.querySelector(".table-head").outerHTML;
  table.innerHTML = heading + crmSamples[status]
    .map((row) => `<div class="table-row"><span>${row[0]}</span><span><b class="score ${Number(row[1]) >= 80 ? "high" : "mid"}">${row[1]}</b></span><span>${row[2]}</span><span>${row[3]}</span><span>${row[4]}</span></div>`)
    .join("");
}

document.querySelectorAll("[data-crm-status]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-crm-status]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderCrmSamples(button.dataset.crmStatus);
  });
});

document.getElementById("refreshSegmentButton").addEventListener("click", () => {
  document.getElementById("segmentTopEstimate").textContent = "预估 3,428 人（已刷新）";
});

document.querySelectorAll(".ai-action-grid input").forEach((input) => {
  input.addEventListener("change", () => input.closest("label").classList.toggle("selected", input.checked));
});

function filterWeightRules() {
  const query = document.getElementById("weightRuleSearch").value.trim().toLowerCase();
  const category = document.getElementById("weightCategoryFilter").value;
  document.querySelectorAll(".weight-rule-row").forEach((row) => {
    const matchesText = !query || row.dataset.search.toLowerCase().includes(query);
    const matchesCategory = category === "all" || row.dataset.category === category;
    row.classList.toggle("hidden", !matchesText || !matchesCategory);
  });
}

document.getElementById("weightRuleSearch").addEventListener("input", filterWeightRules);
document.getElementById("weightCategoryFilter").addEventListener("change", filterWeightRules);
document.getElementById("weightRuleTable").addEventListener("click", (event) => {
  const button = event.target.closest(".danger-text");
  if (!button) return;
  const row = button.closest(".weight-rule-row");
  const status = row.querySelector(".rule-enabled");
  const enabled = status.textContent === "启用";
  status.textContent = enabled ? "停用" : "启用";
  status.classList.toggle("rule-disabled", enabled);
  button.textContent = enabled ? "启用" : "停用";
  document.getElementById("saveWeightDraftButton").textContent = "保存草稿（有变更）";
});

let editingWeightRow = null;
const weightRuleModal = document.getElementById("weightRuleModal");

function setWeightRuleModal(open) {
  weightRuleModal.setAttribute("aria-hidden", String(!open));
}

document.getElementById("addWeightRuleButton").addEventListener("click", () => {
  editingWeightRow = null;
  document.getElementById("weightRuleModalTitle").textContent = "新增行为权重规则";
  document.getElementById("weightRuleCategoryInput").value = "行为";
  document.getElementById("weightRuleNameInput").value = "";
  document.getElementById("weightRuleEventInput").value = "browse";
  document.getElementById("weightRuleSceneInput").value = "";
  document.getElementById("weightRuleScoreInput").value = "5";
  document.getElementById("weightRuleLimitInput").value = "1";
  setWeightRuleModal(true);
});

function openWeightRuleEditor(row) {
  editingWeightRow = row;
  const cells = editingWeightRow.querySelectorAll(":scope > span");
  const codes = cells[2].textContent.trim().split("/").map((item) => item.trim());
  document.getElementById("weightRuleModalTitle").textContent = "编辑行为权重规则";
  document.getElementById("weightRuleCategoryInput").value = cells[0].textContent.trim();
  document.getElementById("weightRuleNameInput").value = cells[1].textContent.trim();
  document.getElementById("weightRuleEventInput").value = codes[0];
  document.getElementById("weightRuleSceneInput").value = codes[1] || "";
  document.getElementById("weightRuleScoreInput").value = cells[3].textContent.replace("+", "").trim();
  document.getElementById("weightRuleLimitInput").value = "1";
  setWeightRuleModal(true);
}

document.querySelectorAll(".edit-weight-rule").forEach((button) => {
  button.addEventListener("click", () => openWeightRuleEditor(button.closest(".weight-rule-row")));
});

document.querySelectorAll(".close-config-modal").forEach((button) => {
  button.addEventListener("click", () => setWeightRuleModal(false));
});

document.getElementById("saveWeightRuleButton").addEventListener("click", () => {
  const name = document.getElementById("weightRuleNameInput").value.trim();
  if (!name) {
    document.getElementById("weightRuleNameInput").focus();
    return;
  }
  const category = document.getElementById("weightRuleCategoryInput").value;
  const eventType = document.getElementById("weightRuleEventInput").value;
  const scene = document.getElementById("weightRuleSceneInput").value.trim() || "general";
  const score = document.getElementById("weightRuleScoreInput").value;
  const limit = document.getElementById("weightRuleLimitInput").value;
  if (editingWeightRow) {
    const cells = editingWeightRow.querySelectorAll(":scope > span");
    cells[0].textContent = category;
    cells[1].textContent = name;
    cells[2].textContent = `${eventType} / ${scene}`;
    cells[2].className = "code-text";
    cells[3].innerHTML = `<b class="weight-score">+${score}</b>`;
    cells[4].textContent = `每日最多 ${limit} 次`;
    editingWeightRow.dataset.category = category;
    editingWeightRow.dataset.search = `${name} ${eventType} ${scene}`;
  } else {
    const row = document.createElement("div");
    row.className = "table-row weight-rule-row";
    row.dataset.category = category;
    row.dataset.search = `${name} ${eventType} ${scene}`;
    row.innerHTML = `<span>${category}</span><span>${name}</span><span class="code-text">${eventType} / ${scene}</span><span><b class="weight-score">+${score}</b></span><span>每日最多 ${limit} 次</span><span><b class="rule-enabled">启用</b></span><span><button class="text-button edit-weight-rule">编辑</button><button class="text-button danger-text">停用</button></span>`;
    document.getElementById("weightRuleTable").appendChild(row);
    row.querySelector(".edit-weight-rule").addEventListener("click", () => openWeightRuleEditor(row));
  }
  setWeightRuleModal(false);
  document.getElementById("saveWeightDraftButton").textContent = "保存草稿（有变更）";
});

document.getElementById("saveWeightDraftButton").addEventListener("click", (event) => {
  event.currentTarget.textContent = "草稿已保存";
});

const publishWeightModal = document.getElementById("publishWeightModal");
const publishWeightAck = document.getElementById("publishWeightAck");
const confirmPublishWeightButton = document.getElementById("confirmPublishWeightButton");

function setPublishWeightModal(open) {
  publishWeightModal.setAttribute("aria-hidden", String(!open));
  if (open) {
    publishWeightAck.checked = false;
    confirmPublishWeightButton.textContent = "确认发布";
    confirmPublishWeightButton.disabled = true;
  }
}

document.getElementById("openPublishWeightButton").addEventListener("click", () => setPublishWeightModal(true));
document.querySelectorAll(".close-publish-modal").forEach((button) => {
  button.addEventListener("click", () => setPublishWeightModal(false));
});
publishWeightAck.addEventListener("change", () => {
  confirmPublishWeightButton.disabled = !publishWeightAck.checked;
});
confirmPublishWeightButton.addEventListener("click", () => {
  confirmPublishWeightButton.textContent = "重算任务已提交";
  confirmPublishWeightButton.disabled = true;
  setTimeout(() => setPublishWeightModal(false), 900);
});

let landingCurrentScope = "全部";
let landingToastTimer;

function showLandingToast(message) {
  const toast = document.getElementById("landingToast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(landingToastTimer);
  landingToastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function renderLandingChips() {
  const keyword = document.getElementById("landingKeyword").value.trim();
  const typeLabel = document.getElementById("landingSearchType").selectedOptions[0].textContent;
  const org = document.getElementById("landingOrg").value;
  const category = document.getElementById("landingCategory").value;
  const status = document.getElementById("landingStatus").value;
  const product = document.getElementById("landingProduct").value;
  const industry = document.getElementById("landingIndustry").value;
  const domain = document.getElementById("landingDomain").value;
  const chips = [
    `数据范围：${landingCurrentScope}`,
    keyword ? `${typeLabel}：${keyword}` : "",
    org ? `组织：${org}` : "",
    category ? `分类：${category}` : "",
    status ? `状态：${status}` : "",
    product ? `产品：${product}` : "",
    industry ? `行业：${industry}` : "",
    domain ? `领域：${domain}` : "",
  ].filter(Boolean);
  const target = document.getElementById("landingChips");
  target.replaceChildren();
  const label = document.createElement("span");
  label.textContent = "当前条件";
  target.appendChild(label);
  chips.forEach((value) => {
    const chip = document.createElement("span");
    chip.className = "landing-chip";
    chip.textContent = value;
    target.appendChild(chip);
  });
}

function updateLandingSelection() {
  const visibleChecks = [...document.querySelectorAll("#landingTable tbody tr")]
    .filter((row) => row.style.display !== "none")
    .map((row) => row.querySelector(".landing-row-check"));
  const selected = document.querySelectorAll(".landing-row-check:checked").length;
  document.getElementById("landingSelected").textContent = selected;
  document.getElementById("landingBatch").classList.toggle("show", selected > 0);
  document.getElementById("landingCheckAll").checked = visibleChecks.length > 0 && visibleChecks.every((check) => check.checked);
}

function applyLandingFilters() {
  const keyword = document.getElementById("landingKeyword").value.trim().toLowerCase();
  const type = document.getElementById("landingSearchType").value;
  const org = document.getElementById("landingOrg").value;
  const category = document.getElementById("landingCategory").value;
  const status = document.getElementById("landingStatus").value;
  const product = document.getElementById("landingProduct").value;
  const industry = document.getElementById("landingIndustry").value;
  const domain = document.getElementById("landingDomain").value;
  let shown = 0;

  document.querySelectorAll("#landingTable tbody tr").forEach((row) => {
    const scopeMatch = landingCurrentScope === "全部" || row.dataset.scope === landingCurrentScope;
    const target = type === "all"
      ? `${row.dataset.title} ${row.dataset.address} ${row.dataset.publisher}`
      : row.dataset[type];
    const match = scopeMatch
      && (!keyword || target.toLowerCase().includes(keyword))
      && (!org || row.dataset.org === org)
      && (!category || row.dataset.category === category)
      && (!status || row.dataset.status === status)
      && (!product || row.dataset.product === product)
      && (!industry || row.dataset.industry === industry)
      && (!domain || row.dataset.domain === domain);
    row.style.display = match ? "" : "none";
    if (match) shown += 1;
  });

  document.getElementById("landingCount").textContent = shown;
  document.getElementById("landingTable").style.display = shown ? "table" : "none";
  document.getElementById("landingEmpty").style.display = shown ? "none" : "block";
  renderLandingChips();
  updateLandingSelection();
}

function resetLandingFilters() {
  landingCurrentScope = "全部";
  document.getElementById("landingKeyword").value = "";
  document.getElementById("landingSearchType").value = "all";
  document.getElementById("landingOrg").value = "";
  document.getElementById("landingCategory").value = "";
  document.getElementById("landingStatus").value = "";
  document.getElementById("landingProduct").value = "";
  document.getElementById("landingIndustry").value = "";
  document.getElementById("landingDomain").value = "";
  document.querySelectorAll("[data-landing-scope]").forEach((button) => {
    button.classList.toggle("active", button.dataset.landingScope === "全部");
  });
  applyLandingFilters();
  showLandingToast("筛选条件已重置");
}

document.querySelectorAll("[data-landing-scope]").forEach((button) => {
  button.addEventListener("click", () => {
    landingCurrentScope = button.dataset.landingScope;
    document.querySelectorAll("[data-landing-scope]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    applyLandingFilters();
  });
});

document.getElementById("landingSearchButton").addEventListener("click", applyLandingFilters);
document.getElementById("landingKeyword").addEventListener("keydown", (event) => {
  if (event.key === "Enter") applyLandingFilters();
});
document.getElementById("landingResetButton").addEventListener("click", resetLandingFilters);
["landingOrg", "landingCategory", "landingStatus", "landingProduct", "landingIndustry", "landingDomain"].forEach((id) => {
  document.getElementById(id).addEventListener("change", applyLandingFilters);
});
document.getElementById("landingAdvancedButton").addEventListener("click", (event) => {
  const advanced = document.getElementById("landingAdvanced");
  const isOpen = advanced.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
  event.currentTarget.innerHTML = `${isOpen ? "收起筛选" : "高级筛选"} <span aria-hidden="true">${isOpen ? "⌃" : "⌄"}</span>`;
});
document.getElementById("landingCheckAll").addEventListener("change", (event) => {
  document.querySelectorAll("#landingTable tbody tr").forEach((row) => {
    if (row.style.display !== "none") row.querySelector(".landing-row-check").checked = event.currentTarget.checked;
  });
  updateLandingSelection();
});
document.querySelectorAll(".landing-row-check").forEach((checkbox) => checkbox.addEventListener("change", updateLandingSelection));
document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", () => {
    const text = button.dataset.copy;
    if (navigator.clipboard) navigator.clipboard.writeText(text);
    showLandingToast(`已复制：${text}`);
  });
});

document.getElementById("landingCreateButton").addEventListener("click", () => showLandingToast("进入新建落地页流程"));
document.getElementById("landingSaveView").addEventListener("click", () => showLandingToast("已保存为「我的常用视图」"));
document.querySelectorAll("#landingBatch button").forEach((button) => button.addEventListener("click", () => showLandingToast(`${button.textContent.trim()}操作已触发`)));

renderLandingChips();
