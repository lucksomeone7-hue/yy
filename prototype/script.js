const pageTitles = {
  dashboard: "AI 经营看板",
  layers: "客户意向分层",
  companies: "企业账户",
  account: "企业洞察",
  actions: "推荐动作中心",
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
      ["张三", "XX 制造集团", "制造业", 94, "下载制造业白皮书", "未同步", "同步 CRM"],
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
  guide.innerHTML = `<strong>推荐动作</strong>${config.actions.map((action) => `<span>${action}</span>`).join("")}`;
  table.innerHTML = heading + config.rows.map((row) => {
    const actionKind = row[6].includes("CRM") ? "crm" : row[6].includes("销售") || row[6].includes("线索") ? "sales" : row[6].includes("排除") ? "ads" : "nurture";
    return `
    <div class="table-row intent-customer-row">
      <span><button class="inline-link" data-intent-profile>${row[0]}</button></span>
      <span>${row[1]}</span><span>${row[2]}</span>
      <span><b class="score ${level}">${row[3]}</b></span>
      <span>${row[4]}</span><span>${row[5]}</span>
      <span><button class="mini-button next-action-button" data-action-kind="${actionKind}" data-action-target="${row[0]} / ${row[1]}" data-action-score="${row[3]}" data-action-reason="${row[4]}；CRM 状态：${row[5]}">处理建议</button></span>
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

const actionLabels = {
  crm: { title: "同步 CRM", goal: "CRM 返回线索 ID", next: "待销售查看与反馈", success: "CRM 线索已创建" },
  sales: { title: "提醒销售", goal: "销售提交有效性反馈", next: "待销售查看与反馈", success: "销售提醒已发送" },
  nurture: { title: "内容培育", goal: "7 天内访问方案页", next: "观察客户互动与目标事件", success: "内容动作已进入执行队列" },
  ads: { title: "广告或站内承接", goal: "获得有效留资与渠道授权", next: "等待匿名身份转为可经营客户", success: "受众同步任务已创建" },
};

function isHandoffAction() {
  return currentAction.kind === "crm" || currentAction.kind === "sales";
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
  document.getElementById("nextActionStep").textContent = step < 3 ? "继续 →" : isHandoffAction() ? "确认交接 →" : "确认执行 →";
  if (step === 3) updateActionPreview();
}

function updateActionPreview() {
  const handoff = isHandoffAction();
  document.getElementById("handoffPreview").hidden = !handoff;
  document.getElementById("messagePreview").hidden = handoff || currentAction.kind === "ads";
  document.getElementById("previewTitle").textContent = handoff ? "销售交接预览" : currentAction.kind === "ads" ? "受众同步确认" : `${selectedActionChannel} 内容预览`;
  document.getElementById("previewHandoffTitle").textContent = `${currentAction.target.split(" /")[0]} 出现新的高意向行为`;
  document.getElementById("previewHandoffCopy").textContent = `意向分 ${currentAction.score}。${currentAction.reason}。建议在 24 小时内确认线索有效性。`;
  document.getElementById("previewContentName").textContent = selectedActionContent;
  document.getElementById("confirmTarget").textContent = currentAction.target;
  document.getElementById("confirmMode").textContent = handoff ? "CRM / 销售交接" : currentAction.kind === "ads" ? "广告受众或站内承接" : `平台执行 · ${selectedActionChannel}`;
  document.getElementById("confirmGoal").textContent = actionLabels[currentAction.kind].goal;
  document.getElementById("confirmNextState").textContent = actionLabels[currentAction.kind].next;
}

function openActionDrawer(button) {
  currentAction = {
    kind: button.dataset.actionKind || "nurture",
    target: button.dataset.actionTarget || "待处理客户",
    score: Number(button.dataset.actionScore || 0),
    reason: button.dataset.actionReason || "近期出现新的经营信号",
  };
  const labels = actionLabels[currentAction.kind];
  const handoff = isHandoffAction();
  document.getElementById("actionDrawerTitle").textContent = labels.title;
  document.getElementById("actionDrawerTarget").textContent = `${currentAction.target} · 意向分 ${currentAction.score}`;
  document.getElementById("actionDrawerCode").textContent = `NEXT BEST ACTION · ${currentAction.score >= 80 ? "P0" : currentAction.score >= 50 ? "P1" : "P2"}`;
  document.getElementById("actionReason").textContent = currentAction.reason;
  document.getElementById("actionScore").textContent = `${currentAction.score} · ${currentAction.score >= 80 ? "高意向" : currentAction.score >= 50 ? "中意向" : "低意向"}`;
  document.getElementById("actionGoal").textContent = labels.goal;
  document.getElementById("actionJudgement").textContent = handoff
    ? "该对象已具备明确转化信号。继续常规培育可能与销售动作冲突，建议优先完成交接。"
    : currentAction.kind === "ads"
      ? "意向较高，但缺少有效联系方式或渠道授权，不能直接发送内容。"
      : "当前适合推动一个相邻决策行为，不建议直接使用强销售话术。";
  document.getElementById("actionBehavior").textContent = currentAction.kind === "nurture" ? "持续阅读案例或活动内容" : currentAction.kind === "ads" ? "匿名访问方案与价格页" : "访问价格页并完成留资";
  document.getElementById("actionStepTwoLabel").textContent = handoff ? "交接设置" : currentAction.kind === "ads" ? "承接设置" : "内容与渠道";
  document.querySelectorAll("[data-action-mode]").forEach((mode) => mode.hidden = mode.dataset.actionMode !== (handoff ? "handoff" : currentAction.kind));
  document.getElementById("consentCheck").className = `action-check ${currentAction.kind === "ads" ? "warning" : "ok"}`;
  document.getElementById("consentCheck").querySelector("small").textContent = currentAction.kind === "ads" ? "无有效联系方式，禁止直接发送" : "当前执行渠道授权有效";
  document.getElementById("consentCheck").querySelector("b").textContent = currentAction.kind === "ads" ? "不可直达" : "通过";
  document.getElementById("salesProtectionCheck").className = `action-check ${handoff ? "warning" : "ok"}`;
  document.getElementById("salesProtectionCheck").querySelector("small").textContent = handoff ? "交接后暂停营销触达，等待销售反馈" : "当前无销售负责人或活跃商机";
  document.getElementById("salesProtectionCheck").querySelector("b").textContent = handoff ? "优先交接" : "通过";
  document.getElementById("handoffSummary").value = `意向分 ${currentAction.score}。${currentAction.reason}。建议优先确认采购时间与决策角色。`;
  actionDrawer.setAttribute("aria-hidden", "false");
  renderActionStep(1);
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
  document.getElementById("actionSuccessCopy").textContent = isHandoffAction() ? "系统将等待销售查看并反馈；反馈前不会继续营销触达。" : "执行、送达、互动和目标事件会自动回流到客户档案。";
  document.getElementById("actionSuccessState").textContent = `下一状态：${actionLabels[currentAction.kind].next}`;
});

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
    ["张三 / XX 制造集团", "94", "下载白皮书后 12 天未活跃", "销售跟进中", "更新行为并提醒销售"],
    ["王宇 / 远航自动化", "67", "活动报名未签到", "暂时无效：时机未到", "召回后进入再激活复核"],
  ],
  new: [["李敏 / 华东装备", "61", "阅读案例后活跃下降", "未进入 CRM", "内容召回后创建线索"]],
  working: [["张三 / XX 制造集团", "94", "下载白皮书后 12 天未活跃", "销售跟进中", "更新行为并提醒销售"]],
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
