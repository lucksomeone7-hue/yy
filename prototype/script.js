const pageTitles = {
  contentCenter: "内容概览",
  smsManagement: "短信管理",
  smsTemplates: "短信模板",
  emailManagement: "邮件列表",
  emailTemplates: "邮件模板",
  automation: "营销自动化",
  wechatMarketing: "微信营销",
  employeeMarketing: "全员营销",
  shareRanking: "分享排行",
  channels: "渠道管理",
  channelCategories: "渠道分类",
  organizationManagement: "组织管理",
  accountManagement: "账号管理",
  roleManagement: "角色管理",
  moduleManagement: "内容模块",
  landingCategories: "落地页分类管理",
  dashboard: "经营看板",
  layers: "客户意向分层",
  companies: "企业客户",
  account: "企业洞察",
  actions: "行动待办",
  landingPages: "落地页",
  activities: "活动管理",
  activityDetail: "活动详情",
  leads: "线索管理",
  leadSettings: "流转配置",
  users: "联系人",
  customerProfile: "客户画像",
  profileTags: "画像与标签",
  segment: "人群分组",
  segmentCreate: "AI 创建分组",
  settings: "意向评分配置",
  settingsWeights: "行为权重",
  settingsPermissions: "角色权限",
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
document.getElementById("searchModuleFilters").addEventListener("click", filterModules);
document.getElementById("moduleNameSearch").addEventListener("keydown", (event) => { if (event.key === "Enter") filterModules(); });
document.getElementById("resetModuleFilters").addEventListener("click", resetModuleFilters);
document.getElementById("emptyResetModuleFilters").addEventListener("click", resetModuleFilters);
document.getElementById("createModuleButton").addEventListener("click", (event) => {
  event.currentTarget.textContent = "新建功能待接入";
  setTimeout(() => { event.currentTarget.textContent = "＋ 新建模板"; }, 1400);
});

function showPage(page) {
  if (!document.getElementById(page)?.classList.contains("page")) return;
  document.querySelectorAll(".page").forEach((section) => section.classList.remove("active"));
  document.getElementById(page).classList.add("active");
  document.querySelectorAll("[data-landing-tab]").forEach((item) => item.classList.toggle("active", item.dataset.landingTab === page));
  document.getElementById("pageTitle").textContent = pageTitles[page];
  window.mkNavigation?.syncPage(page);
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
    if (button.dataset.page === "contentCenter") showContentOverview();
  });
});

document.querySelectorAll("[data-jump]").forEach((button) => {
  button.addEventListener("click", () => {
    showPage(button.dataset.jump);
    if (button.dataset.aiTemplate) applySegmentTemplate(button.dataset.aiTemplate);
  });
});

document.querySelectorAll("[data-landing-tab]").forEach((button) => {
  button.addEventListener("click", () => showPage(button.dataset.landingTab));
});

const contentSectionData = {
  articles: { group: "内容资产", name: "文章", title: "文章管理", description: "统一创建、发布和复用营销文章。", action: "＋ 新建文章", count: 428, rows: [["行业洞察", "制造业数智化白皮书解读", "SEO", "人工", "2,846", "326", "148", "陈玉琴", "今天 10:32", "已上架"], ["产品动态", "AI 融入核心业务的五个实践", "GEO", "AI", "1,920", "184", "96", "杨晨", "昨天 16:45", "草稿"], ["品牌资讯", "企业服务智能化浪潮下的用友战略", "SEO", "AI", "3,128", "412", "203", "大服务行业", "09-12 09:18", "已上架"]] },
  forms: { title: "表单管理", description: "管理获客表单、收集效果和关联场景。", action: "＋ 新建表单", count: 96, rows: [["数智营销峰会报名表", "峰会报名", "已发布", "1,847", "2026-09-08 10:20", "陈玉琴", "集团市场部"], ["制造业白皮书下载表单", "资料下载", "已发布", "926", "2026-09-05 14:36", "郭涛", "制造业 BG"], ["产品咨询表单", "产品咨询", "收集中", "438", "2026-08-28 09:15", "李小琳", "营销云团队"], ["客户需求调研表", "需求调研", "已停用", "216", "2026-08-16 16:42", "杨晨", "客户成功部"]] },
  surveys: { title: "问卷管理", description: "创建调研问卷并追踪收集和完成情况。", action: "＋ 新建问卷", count: 34, rows: [["AI 应用成熟度调研问卷", "未发布", "1", "12", "2026-08-01", "2027-08-05"], ["公司财务数智化转型调查问卷", "未发布", "1", "11", "2026-02-27", "2028-03-23"], ["BIP 客户满意度", "收集中", "286", "13", "2026-09-01", "2026-09-30"], ["公司财务数字化转型调研问卷", "已结束", "168", "10", "2025-10-22", "2025-10-31"]] },
  resources: { title: "资料管理", description: "管理白皮书、手册等可下载内容资产。", action: "＋ 上传资料", count: 316, rows: [["YonBIP 产品能力手册", "PDF", "已上架", "郭涛", "09-12 14:06"], ["制造业数智化白皮书", "PDF", "已上架", "陈玉琴", "09-10 17:42"], ["营销云产品介绍", "PPT", "待审核", "李小琳", "09-08 09:30"]] },
  videos: { title: "视频管理", description: "管理营销视频、封面、引用与发布状态。", action: "＋ 上传视频", count: 186, rows: [["AI 融入核心业务主题演讲", "直播回放", "已上架", "刘聪聪", "09-13 16:06"], ["YonBIP 产品演示", "产品视频", "已上架", "杨晨", "09-09 11:20"], ["客户案例访谈", "案例视频", "草稿", "陈玉琴", "09-05 15:18"]] },
  posters: { group: "内容资产", name: "海报", title: "海报管理", description: "统一管理活动传播和专属二维码海报。", action: "＋ 新建海报", count: 68, rows: [["数智营销峰会主视觉", "活动海报", "已上架", "陈玉琴", "09-13 12:20"], ["白皮书下载分享海报", "分享海报", "草稿", "郭涛", "09-10 15:08"]] },
  products: { group: "业务素材", name: "产品", title: "产品素材", description: "沉淀可复用的产品介绍与能力素材。", action: "＋ 新建产品", count: 42, rows: [["YonBIP 营销云", "产品介绍", "已上架", "产品市场部", "09-12 10:18"], ["用友 BIP", "产品介绍", "已上架", "品牌部", "09-08 16:30"]] },
  solutions: { group: "业务素材", name: "解决方案", title: "解决方案", description: "统一管理行业及领域解决方案素材。", action: "＋ 新建方案", count: 76, rows: [["制造业数智营销解决方案", "行业方案", "已上架", "制造业 BG", "09-11 14:20"], ["大型企业客户经营方案", "领域方案", "草稿", "市场部", "09-07 09:36"]] },
  cases: { group: "业务素材", name: "客户案例", title: "客户案例", description: "沉淀客户实践和成功案例，支持多场景复用。", action: "＋ 新建案例", count: 129, rows: [["某装备集团客户经营实践", "制造业案例", "已上架", "行业市场部", "09-13 08:50"], ["某消费品企业增长案例", "消费品案例", "待审核", "陈玉琴", "09-09 17:06"]] },
  customerWall: { group: "业务素材", name: "客户墙", title: "客户墙", description: "管理客户品牌、行业标签与展示授权。", action: "＋ 添加客户", count: 218, rows: [["制造行业标杆客户", "客户分组", "已发布", "品牌部", "09-12 15:40"], ["央国企客户精选", "客户分组", "草稿", "市场部", "09-06 11:26"]] },
  aggregations: { group: "页面与承接", name: "聚合页", title: "聚合页管理", description: "组合多种内容，形成专题或传播入口。", action: "＋ 新建聚合页", count: 24, rows: [["AI 融入核心业务专题", "内容专题", "已发布", "陈玉琴", "09-13 11:35"], ["制造业数字化内容合集", "行业专题", "草稿", "郭涛", "09-08 10:18"]] },
};

const contentSectionMeta = {
  forms: ["获客组件", "表单"], surveys: ["获客组件", "调查问卷"], resources: ["内容资产", "资料"], videos: ["内容资产", "视频"],
};

const contentViewConfig = {
  articles: [
    { id: "list", label: "文章列表" }, { id: "categories", label: "文章分类", count: 18, action: "＋ 新建分类", rows: [["数字化转型", "一级分类", "已启用", "陈玉琴", "今天 09:20"], ["白皮书", "一级分类", "已启用", "郭涛", "09-12 16:30"], ["产品动态", "一级分类", "已启用", "杨晨", "09-10 11:06"]] },
    { id: "templates", label: "文章模板", count: 26, action: "＋ 新建模板", rows: [["行业白皮书解读模板", "图文模板", "已启用", "品牌部", "09-13 10:10"], ["产品发布模板", "图文模板", "已启用", "市场部", "09-09 15:42"]] },
    { id: "topics", label: "文章专题", count: 12, action: "＋ 新建专题", rows: [["AI 融入核心业务", "文章专题", "已发布", "陈玉琴", "09-12 17:20"], ["企业数智化", "文章专题", "草稿", "杨晨", "09-07 14:08"]] },
    { id: "public", label: "公共文章池", count: 156, action: "＋ 申请入池", rows: [["2026 企业服务趋势洞察", "公共文章", "可引用", "集团市场部", "09-14 08:45"], ["用友 BIP 品牌介绍", "公共文章", "可引用", "品牌部", "09-11 16:12"]] },
  ],
  forms: [{ id: "list", label: "表单列表" }, { id: "analytics", label: "数据分析", action: "导出分析数据" }],
  surveys: [{ id: "list", label: "问卷列表" }],
  resources: [{ id: "list", label: "资料列表" }, { id: "categories", label: "资料分类" }],
  videos: [{ id: "list", label: "视频列表" }, { id: "categories", label: "视频分类" }],
  posters: [{ id: "list", label: "海报列表" }, { id: "categories", label: "海报分类" }],
};

const contentCategoryRows = {
  articles: [["industry", "行业洞察", 1, "", "09-14 10:26"], ["manufacturing", "制造业", 2, "industry", "09-13 16:08"], ["consumer", "消费品", 2, "industry", "09-12 09:42"], ["product", "产品动态", 1, "", "09-10 11:06"], ["brand", "品牌资讯", 1, "", "09-08 14:30"]],
  resources: [["guide", "操作说明", 1, "", "09-14 10:26"], ["product-guide", "产品手册", 2, "guide", "09-13 16:08"], ["service-guide", "服务指南", 2, "guide", "09-12 09:42"], ["updates", "系统更新", 1, "", "09-10 11:06"], ["download", "下载文档", 1, "", "09-08 14:30"]],
  videos: [["product-video", "产品演示", 1, "", "09-14 10:26"], ["feature-video", "功能演示", 2, "product-video", "09-13 16:08"], ["event-video", "活动回放", 1, "", "09-11 09:42"], ["case-video", "客户案例", 1, "", "09-08 14:30"]],
  posters: [["event-poster", "活动传播", 1, "", "09-14 10:26"], ["online-event", "线上活动", 2, "event-poster", "09-13 16:08"], ["offline-event", "线下活动", 2, "event-poster", "09-12 09:42"], ["product-poster", "产品推广", 1, "", "09-10 11:06"], ["resource-poster", "资料分享", 1, "", "09-08 14:30"]],
};

function renderContentRows(rows) {
  document.getElementById("contentSectionList").innerHTML = rows.map((row) => `<div class="content-list-row"><span><b>${row[0]}</b><small>营销内容资产</small></span><span>${row[1]}<small>${row[2]}</small></span><span>${row[3]}</span><span>${row[4]}</span><span><button class="text-button">编辑</button><button class="row-more" aria-label="更多操作">···</button></span></div>`).join("");
}

function renderArticleRows(rows) {
  document.getElementById("contentSectionList").innerHTML = rows.map((row) => `<div class="article-list-row"><span>${row[0]}</span><span><b>${row[1]}</b></span><span><em>${row[2]}</em></span><span><em class="article-source">${row[3]}</em></span><span>${row[4]}</span><span>${row[5]}</span><span>${row[6]}</span><span>${row[7]}</span><span>${row[8]}</span><span><b class="article-status ${row[9] === "已上架" ? "online" : ""}">${row[9]}</b></span><span><button class="text-button">编辑</button><button class="text-button">${row[9] === "已上架" ? "下架" : "上架"}</button><button class="row-more" aria-label="更多操作">···</button></span></div>`).join("");
}

function renderFormRows(rows) {
  document.getElementById("contentSectionList").innerHTML = rows.map((row) => {
    const stateAction = row[2] === "已停用" ? "重新开启" : row[2] === "收集中" ? "渠道推广" : "渠道推广";
    const stateMenuAction = row[2] === "已停用" ? "" : "<button>停止收集</button>";
    return `<div class="form-list-row"><span><b>${row[0]}</b></span><span>${row[1]}</span><span><b class="form-status ${row[2] === "已发布" ? "online" : ""}">${row[2]}</b></span><span><strong>${row[3]}</strong></span><span>${row[4]}</span><span>${row[5]}</span><span>${row[6]}</span><span class="form-row-actions"><button class="text-button">编辑</button><button class="text-button">${stateAction}</button><span class="form-more-wrap"><button class="text-button form-more-button" aria-expanded="false">更多⌄</button><span class="form-more-menu" hidden><button>复制表单</button><button>查看数据分析</button><button>导出数据</button>${stateMenuAction}<button class="danger">删除</button></span></span></span></div>`;
  }).join("");
  document.querySelectorAll(".form-more-button").forEach((button) => button.addEventListener("click", () => {
    const menu = button.nextElementSibling;
    document.querySelectorAll(".form-more-menu").forEach((item) => { if (item !== menu) item.hidden = true; });
    menu.hidden = !menu.hidden;
    button.setAttribute("aria-expanded", String(!menu.hidden));
  }));
}

function renderFormAnalytics() {
  document.getElementById("contentSectionList").innerHTML = `<section class="form-analytics"><div class="form-analytics-metrics"><article><span>累计收集</span><strong>3,427</strong><small>较上月 +18.6%</small></article><article><span>有效提交</span><strong>3,086</strong><small>有效率 90.0%</small></article><article><span>产生线索</span><strong>1,264</strong><small>线索转化率 41.0%</small></article><article><span>运行中表单</span><strong>18</strong><small>3 个近 7 天无提交</small></article></div><div class="form-analytics-grid"><section><h4>近 7 天收集趋势</h4><div class="form-trend-bars"><i style="--h:46%"><b>386</b><span>周一</span></i><i style="--h:58%"><b>472</b><span>周二</span></i><i style="--h:72%"><b>586</b><span>周三</span></i><i style="--h:65%"><b>528</b><span>周四</span></i><i style="--h:84%"><b>684</b><span>周五</span></i><i style="--h:50%"><b>408</b><span>周六</span></i><i style="--h:45%"><b>363</b><span>周日</span></i></div></section><section><h4>表单效果排行</h4><div class="form-ranking"><div><b>数智营销峰会报名表</b><span>1,847 次</span><em>53.9%</em></div><div><b>制造业白皮书下载表单</b><span>926 次</span><em>27.0%</em></div><div><b>产品咨询表单</b><span>438 次</span><em>12.8%</em></div></div></section></div></section>`;
}

function renderSurveyRows(rows) {
  document.getElementById("contentSectionList").innerHTML = rows.map((row) => `<div class="survey-list-row"><span><input type="checkbox" aria-label="选择${row[0]}" /></span><span><b>${row[0]}</b></span><span><b class="survey-status ${row[1] === "收集中" ? "collecting" : ""}">${row[1]}</b></span><span>${row[2]}</span><span>${row[3]}</span><span>${row[4]}</span><span>${row[5]}</span><span class="survey-row-actions"><button class="text-button">编辑</button><button class="text-button">推广链接</button><span class="survey-more-wrap"><button class="text-button survey-more-button" aria-expanded="false">更多⌄</button><span class="survey-more-menu" hidden><button>统计</button><button>导出</button><button>复制</button><button class="danger">删除</button></span></span></span></div>`).join("");
  document.querySelectorAll(".survey-more-button").forEach((button) => button.addEventListener("click", () => {
    const menu = button.nextElementSibling;
    document.querySelectorAll(".survey-more-menu").forEach((item) => { if (item !== menu) item.hidden = true; });
    menu.hidden = !menu.hidden;
    button.setAttribute("aria-expanded", String(!menu.hidden));
  }));
}

function renderContentCategoryRows(section) {
  const rows = contentCategoryRows[section] || [];
  const parentIds = new Set(rows.filter((row) => row[2] > 1).map((row) => row[3]));
  document.getElementById("contentSectionList").innerHTML = rows.map(([id, name, level, parent, updated]) => `<div class="content-category-row level-${level}" data-category-id="${id}" data-category-parent="${parent}"><span class="category-tree-name">${parentIds.has(id) ? `<button class="category-tree-toggle" aria-label="收起${name}" aria-expanded="true">⌄</button>` : `<i></i>`}<b>${name}</b></span><span><em>${level === 1 ? "一级分类" : "二级分类"}</em></span><span>${updated}</span><span class="category-row-actions"><button class="text-button">添加子分类</button><span class="category-more-wrap"><button class="text-button category-more-button" aria-expanded="false">更多⌄</button><span class="category-more-menu" hidden><button>编辑</button><button>删除</button><button>复制链接</button></span></span></span></div>`).join("");
  document.querySelectorAll(".category-tree-toggle").forEach((button) => button.addEventListener("click", () => {
    const row = button.closest(".content-category-row");
    const expanded = button.getAttribute("aria-expanded") === "true";
    document.querySelectorAll(`[data-category-parent="${row.dataset.categoryId}"]`).forEach((child) => { child.hidden = expanded; });
    button.setAttribute("aria-expanded", String(!expanded));
    button.textContent = expanded ? "›" : "⌄";
  }));
  document.querySelectorAll(".category-more-button").forEach((button) => button.addEventListener("click", () => {
    const menu = button.nextElementSibling;
    document.querySelectorAll(".category-more-menu").forEach((item) => { if (item !== menu) item.hidden = true; });
    menu.hidden = !menu.hidden;
    button.setAttribute("aria-expanded", String(!menu.hidden));
  }));
}

function setContentListHeader(categoryMode, articleMode = false, formMode = false, surveyMode = false) {
  const head = document.getElementById("contentListHead");
  head.classList.toggle("category-mode", categoryMode);
  head.classList.toggle("article-mode", articleMode);
  head.classList.toggle("form-mode", formMode);
  head.classList.toggle("survey-mode", surveyMode);
  head.innerHTML = categoryMode
    ? `<span>分类名称</span><span>层级</span><span>更新时间</span><span>操作</span>`
    : articleMode ? `<span>分类</span><span>文章标题</span><span>类型</span><span>来源</span><span>阅读</span><span>分享</span><span>收藏</span><span>发布者</span><span>更新时间</span><span>状态</span><span>操作</span>`
    : formMode ? `<span>表单名称</span><span>标题</span><span>状态</span><span>收集数</span><span>创建时间</span><span>创建者</span><span>归属组织</span><span>操作</span>`
    : surveyMode ? `<span><input type="checkbox" aria-label="全选问卷" /></span><span>问卷名称</span><span>问卷状态</span><span>收集数</span><span>问题数</span><span>开始时间</span><span>结束时间</span><span>操作</span>`
    : `<span>标题</span><span>类型 / 状态</span><span>发布人</span><span>更新时间</span><span>操作</span>`;
}

function configureContentFilters(section, viewId) {
  const category = document.querySelector('[data-content-filter-field="category"]');
  const status = document.querySelector('[data-content-filter-field="status"]');
  const type = document.querySelector('[data-content-filter-field="type"]');
  const advanced = document.querySelector('[data-content-filter-field="advanced"]');
  const reset = document.querySelector('[data-content-filter-field="reset"]');
  const keyword = document.getElementById("contentKeywordFilter");
  if (section === "forms" && viewId === "list") {
    keyword.placeholder = "请输入表单名称或标题";
    category.hidden = true;
    status.innerHTML = "<option>全部状态</option><option>已发布</option><option>收集中</option><option>已停用</option>";
    type.innerHTML = "<option>全部创建者</option><option>陈玉琴</option><option>郭涛</option><option>李小琳</option><option>杨晨</option>";
    type.hidden = false;
    reset.hidden = false;
  } else if (section === "surveys" && viewId === "list") {
    keyword.placeholder = "请输入问卷名称";
    category.hidden = true;
    status.innerHTML = "<option>全部状态</option><option>未发布</option><option>收集中</option><option>已结束</option>";
    type.hidden = true;
    reset.hidden = true;
  } else if (["resources", "videos", "posters"].includes(section) && viewId === "list") {
    const labels = { resources: "资料", videos: "视频", posters: "海报" };
    keyword.placeholder = `请输入${labels[section]}名称`;
    category.hidden = false;
    category.innerHTML = section === "resources" ? "<option>全部分类</option><option>操作说明</option><option>系统更新</option><option>下载文档</option>" : section === "videos" ? "<option>全部分类</option><option>产品演示</option><option>活动回放</option><option>客户案例</option>" : "<option>全部分类</option><option>活动传播</option><option>产品推广</option><option>资料分享</option>";
    status.innerHTML = "<option>全部状态</option><option>已上架</option><option>草稿</option><option>待审核</option>";
    type.hidden = true;
    reset.hidden = false;
  } else {
    keyword.placeholder = "请输入文章标题";
    category.innerHTML = "<option>全部分类</option><option>行业洞察</option><option>产品动态</option><option>品牌资讯</option>";
    category.hidden = false;
    status.innerHTML = "<option>全部状态</option><option>已上架</option><option>未上架</option><option>草稿</option>";
    type.innerHTML = "<option>全部类型</option><option>SEO</option><option>GEO</option>";
    reset.hidden = false;
  }
}

function setContentView(section, viewId) {
  const config = contentSectionData[section];
  const view = (contentViewConfig[section] || []).find((item) => item.id === viewId);
  document.querySelectorAll("#contentViewTabs button").forEach((button) => button.classList.toggle("active", button.dataset.view === viewId));
  const filterlessViews = new Set(["categories", "templates", "topics"]);
  const filterPanel = document.getElementById("contentSectionFilter");
  const analyticsMode = section === "forms" && viewId === "analytics";
  filterPanel.hidden = filterlessViews.has(viewId) || analyticsMode;
  document.getElementById("contentPublishScope").hidden = false;
  const publicPool = section === "articles" && viewId === "public";
  document.querySelectorAll("[data-content-filter-field]").forEach((field) => { field.hidden = publicPool; });
  const categoryMode = viewId === "categories" && Object.hasOwn(contentCategoryRows, section);
  const articleMode = section === "articles" && viewId === "list";
  const formMode = section === "forms" && viewId === "list";
  const surveyMode = section === "surveys" && viewId === "list";
  configureContentFilters(section, viewId);
  document.querySelector('[data-content-filter-field="type"]').hidden = !(articleMode || formMode);
  document.querySelector('[data-content-filter-field="advanced"]').hidden = !articleMode;
  if (publicPool) document.querySelectorAll("[data-content-filter-field]").forEach((field) => { field.hidden = true; });
  document.getElementById("articleAiCreate").hidden = !articleMode;
  document.getElementById("contentArticleAdvanced").hidden = true;
  document.getElementById("contentAdvancedToggle").setAttribute("aria-expanded", "false");
  document.getElementById("contentAdvancedToggle").textContent = "高级筛选⌄";
  document.getElementById("contentSectionCreate").textContent = categoryMode ? "＋ 新建分类" : (view?.action || config.action);
  document.getElementById("contentListHead").hidden = analyticsMode;
  setContentListHeader(categoryMode, articleMode, formMode, surveyMode);
  if (categoryMode) renderContentCategoryRows(section);
  else if (articleMode) renderArticleRows(config.rows);
  else if (formMode) renderFormRows(config.rows);
  else if (surveyMode) renderSurveyRows(config.rows);
  else if (analyticsMode) renderFormAnalytics();
  else renderContentRows(view?.rows || config.rows);
}

document.getElementById("contentAdvancedToggle")?.addEventListener("click", (event) => {
  const panel = document.getElementById("contentArticleAdvanced");
  panel.hidden = !panel.hidden;
  event.currentTarget.setAttribute("aria-expanded", String(!panel.hidden));
  event.currentTarget.textContent = panel.hidden ? "高级筛选⌄" : "收起筛选⌃";
});

document.getElementById("contentSectionCreate")?.addEventListener("click", () => {
  const title = document.getElementById("contentSectionTitle")?.textContent || "";
  if (title === "表单管理") openCreationWorkspace("form");
  else if (title === "问卷管理") openCreationWorkspace("survey");
  else showLandingToast(`${document.getElementById("contentSectionCreate").textContent.replace("＋ ", "")}流程已打开`);
});

function applyContentListFilters() {
  const keyword = document.getElementById("contentKeywordFilter").value.trim().toLowerCase();
  const selects = [...document.querySelectorAll("#contentSectionFilter select:not([hidden])")];
  const activeValues = selects.map((select) => select.value).filter((value) => value && !value.startsWith("全部"));
  const rows = [...document.querySelectorAll("#contentSectionList > div:not(#contentListEmpty)")];
  let shown = 0;
  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    const matches = (!keyword || text.includes(keyword)) && activeValues.every((value) => text.includes(value.toLowerCase()));
    row.hidden = !matches;
    if (matches) shown += 1;
  });
  let empty = document.getElementById("contentListEmpty");
  if (!empty) {
    empty = document.createElement("div");
    empty.id = "contentListEmpty";
    empty.className = "content-list-empty";
    empty.innerHTML = '<b>没有找到匹配内容</b><span>请调整筛选条件后重试</span><button class="ghost-button">清空筛选条件</button>';
    document.getElementById("contentSectionList").appendChild(empty);
    empty.querySelector("button").addEventListener("click", resetContentListFilters);
  }
  empty.hidden = shown !== 0;
}

function resetContentListFilters() {
  document.getElementById("contentKeywordFilter").value = "";
  document.querySelectorAll("#contentSearchRow select").forEach((select) => { select.selectedIndex = 0; });
  document.querySelectorAll("#contentArticleAdvanced input").forEach((input) => { input.value = ""; });
  document.querySelectorAll("#contentArticleAdvanced select").forEach((select) => { select.selectedIndex = 0; });
  document.getElementById("contentArticleAdvanced").hidden = true;
  const advancedToggle = document.getElementById("contentAdvancedToggle");
  advancedToggle.setAttribute("aria-expanded", "false");
  advancedToggle.textContent = "高级筛选⌄";
  document.querySelectorAll("#contentPublishScope button").forEach((button, index) => button.classList.toggle("active", index === 0));
  applyContentListFilters();
}

document.querySelector("#contentSearchRow .primary-button")?.addEventListener("click", applyContentListFilters);
document.getElementById("contentKeywordFilter")?.addEventListener("keydown", (event) => { if (event.key === "Enter") applyContentListFilters(); });
document.querySelector('[data-content-filter-field="reset"]')?.addEventListener("click", resetContentListFilters);
document.querySelectorAll("#contentPublishScope button").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll("#contentPublishScope button").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
}));

function openContentSection(section) {
  document.querySelector(".content-center-hero").hidden = true;
  document.querySelector(".content-local-nav").hidden = true;
  document.getElementById("contentOverview").hidden = true;
  document.getElementById("contentMorePanel").hidden = true;
  const panel = document.getElementById("contentSectionPanel");
  panel.hidden = false;
  const config = contentSectionData[section];
  if (!config) return;
  const [fallbackGroup, fallbackName] = contentSectionMeta[section] || ["内容中心", config.title.replace(/管理|素材/g, "")];
  document.getElementById("contentSectionGroup").textContent = config.group || fallbackGroup;
  document.getElementById("contentSectionCrumb").textContent = config.name || fallbackName;
  document.getElementById("contentSectionTitle").textContent = config.title;
  document.getElementById("contentSectionDescription").textContent = config.description;
  const tabs = contentViewConfig[section] || [{ id: "list", label: `${config.name || fallbackName}列表` }];
  const tabsElement = document.getElementById("contentViewTabs");
  tabsElement.innerHTML = tabs.map((tab, index) => `<button class="${index === 0 ? "active" : ""}" data-view="${tab.id}">${tab.label}</button>`).join("");
  tabsElement.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => setContentView(section, button.dataset.view)));
  setContentView(section, tabs[0].id);
  document.querySelectorAll("[data-content-section]").forEach((item) => item.classList.toggle("active", item.dataset.contentSection === section));
  document.querySelector(".content-home-item")?.classList.remove("active");
  window.mkNavigation?.syncContent(section);
  document.getElementById("contentCreateMenu").hidden = true;
  document.getElementById("contentCreateButton").setAttribute("aria-expanded", "false");
}

function showContentOverview() {
  window.mkNavigation?.syncPage("contentCenter");
  document.querySelector(".content-center-hero").hidden = false;
  document.querySelector(".content-local-nav").hidden = false;
  document.getElementById("contentOverview").hidden = false;
  document.getElementById("contentSectionPanel").hidden = true;
  document.getElementById("contentMorePanel").hidden = true;
  document.querySelectorAll("[data-content-section]").forEach((item) => item.classList.remove("active"));
  document.querySelector(".content-home-item")?.classList.add("active");
}

document.querySelectorAll("[data-content-section]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.contentSection === "more") {
      document.querySelector(".content-center-hero").hidden = true;
      document.querySelector(".content-local-nav").hidden = true;
      document.getElementById("contentOverview").hidden = true;
      document.getElementById("contentSectionPanel").hidden = true;
      document.getElementById("contentMorePanel").hidden = false;
      document.querySelectorAll("[data-content-section]").forEach((item) => item.classList.toggle("active", item.dataset.contentSection === "more"));
    } else {
      showPage("contentCenter");
      openContentSection(button.dataset.contentSection);
    }
  });
});

document.querySelectorAll(".content-sidebar-group-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const group = button.closest(".content-sidebar-group");
    const opening = !group.classList.contains("open");
    document.querySelectorAll(".content-sidebar-group").forEach((item) => {
      item.classList.remove("open");
      item.querySelector(".content-sidebar-group-toggle").setAttribute("aria-expanded", "false");
      item.querySelector(".content-sidebar-children").hidden = true;
    });
    if (opening) {
      group.classList.add("open");
      button.setAttribute("aria-expanded", "true");
      group.querySelector(".content-sidebar-children").hidden = false;
    }
  });
});
document.getElementById("backToContentOverview")?.addEventListener("click", showContentOverview);
document.getElementById("backFromContentMore")?.addEventListener("click", showContentOverview);
document.getElementById("contentCreateButton")?.addEventListener("click", (event) => {
  const menu = document.getElementById("contentCreateMenu");
  menu.hidden = !menu.hidden;
  event.currentTarget.setAttribute("aria-expanded", String(!menu.hidden));
});

document.getElementById("contentMoreShortcut")?.addEventListener("click", (event) => {
  event.stopPropagation();
  const dropdown = document.getElementById("contentMoreDropdown");
  dropdown.hidden = !dropdown.hidden;
  event.currentTarget.setAttribute("aria-expanded", String(!dropdown.hidden));
});
document.getElementById("contentMoreDropdown")?.addEventListener("click", (event) => {
  event.stopPropagation();
  if (event.target.closest("[data-content-section]")) {
    event.currentTarget.hidden = true;
    document.getElementById("contentMoreShortcut").setAttribute("aria-expanded", "false");
  }
});

let activityRange = "全部";
let appliedActivityFilters = { keyword: "", status: "", publisher: "", form: "", startDate: "", endDate: "", visibility: "", lead: "", audit: "", undertake: false };

function renderActivityAppliedFilters() {
  const chips = document.getElementById("activityAppliedChips");
  if (chips) chips.replaceChildren();
  document.getElementById("activityApplied").hidden = true;
}

function readActivityFilters() {
  appliedActivityFilters = {
    keyword: document.getElementById("activitySearch").value.trim(),
    status: document.getElementById("activityStatusFilter").value,
    publisher: document.getElementById("activityPublisherFilter").value,
    form: document.getElementById("activityFormFilter").value,
    startDate: document.getElementById("activityStartDate").value,
    endDate: document.getElementById("activityEndDate").value,
    visibility: document.getElementById("activityVisibilityFilter").value,
    lead: document.getElementById("activityLeadFilter").value,
    audit: document.getElementById("activityAuditFilter").value,
    undertake: document.getElementById("activityUndertakeFilter").checked,
  };
}

function filterActivities() {
  const { keyword, status, publisher, form, startDate, endDate, visibility, lead, audit, undertake } = appliedActivityFilters;
  const query = keyword.toLowerCase();
  let shown = 0;
  document.querySelectorAll(".activity-row:not(.head)").forEach((row) => {
    const rangeMatch = activityRange === "全部" || row.dataset.range.includes(activityRange);
    const queryMatch = !query || row.dataset.search.toLowerCase().includes(query);
    const statusMatch = !status || row.dataset.status === status;
    const publisherMatch = !publisher || row.dataset.publisher === publisher;
    const formMatch = !form || row.dataset.form === form;
    const visibilityMatch = !visibility || row.dataset.visibility === visibility;
    const leadMatch = !lead || row.dataset.lead === lead;
    const auditMatch = !audit || row.dataset.audit === audit;
    const undertakeMatch = !undertake || row.dataset.undertake === "true";
    const dateMatch = (!startDate || row.dataset.created >= startDate) && (!endDate || row.dataset.created <= endDate);
    const visible = rangeMatch && queryMatch && statusMatch && publisherMatch && formMatch && visibilityMatch && leadMatch && auditMatch && undertakeMatch && dateMatch;
    row.hidden = !visible;
    if (visible) shown += 1;
  });
  const empty = document.getElementById("activityEmpty");
  if (empty) empty.hidden = shown !== 0;
  document.querySelector(".activity-table").classList.toggle("has-empty", shown === 0);
  renderActivityAppliedFilters();
}

function resetActivityFilters() {
  activityRange = "全部";
  ["activitySearch", "activityStartDate", "activityEndDate"].forEach((id) => { document.getElementById(id).value = ""; });
  ["activityStatusFilter", "activityPublisherFilter", "activityFormFilter", "activityVisibilityFilter", "activityLeadFilter", "activityAuditFilter"].forEach((id) => { document.getElementById(id).value = ""; });
  document.getElementById("activityUndertakeFilter").checked = false;
  document.querySelectorAll("[data-activity-range]").forEach((item) => item.classList.toggle("active", item.dataset.activityRange === "全部"));
  appliedActivityFilters = { keyword: "", status: "", publisher: "", form: "", startDate: "", endDate: "", visibility: "", lead: "", audit: "", undertake: false };
  const advanced = document.getElementById("activityAdvanced");
  advanced.classList.remove("open");
  const toggle = document.getElementById("activityAdvancedButton");
  toggle.setAttribute("aria-expanded", "false");
  toggle.innerHTML = '高级筛选 <span aria-hidden="true">⌄</span>';
  filterActivities();
}

document.querySelectorAll("[data-activity-range]").forEach((button) => {
  button.addEventListener("click", () => {
    activityRange = button.dataset.activityRange;
    document.querySelectorAll("[data-activity-range]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    filterActivities();
  });
});
document.getElementById("activitySearchButton")?.addEventListener("click", () => {
  readActivityFilters();
  filterActivities();
});
document.getElementById("activitySearch")?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    readActivityFilters();
    filterActivities();
  }
});
document.getElementById("activityAdvancedButton")?.addEventListener("click", (event) => {
  const advanced = document.getElementById("activityAdvanced");
  const isOpen = advanced.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
  event.currentTarget.innerHTML = `${isOpen ? "收起筛选" : "高级筛选"} <span aria-hidden="true">${isOpen ? "⌃" : "⌄"}</span>`;
});
document.getElementById("activityReset")?.addEventListener("click", resetActivityFilters);
document.getElementById("activityClearFilters")?.addEventListener("click", resetActivityFilters);
document.getElementById("activityAppliedChips")?.addEventListener("click", (event) => {
  const chip = event.target.closest("[data-remove-activity-filter]");
  if (!chip) return;
  const key = chip.dataset.removeActivityFilter;
  if (key === "range") {
    activityRange = "全部";
    document.querySelectorAll("[data-activity-range]").forEach((item) => item.classList.toggle("active", item.dataset.activityRange === "全部"));
  } else {
    const fieldMap = { keyword: "activitySearch", status: "activityStatusFilter", publisher: "activityPublisherFilter", form: "activityFormFilter", startDate: "activityStartDate", visibility: "activityVisibilityFilter", lead: "activityLeadFilter", audit: "activityAuditFilter", undertake: "activityUndertakeFilter" };
    if (key === "startDate") {
      appliedActivityFilters.startDate = "";
      appliedActivityFilters.endDate = "";
      document.getElementById("activityStartDate").value = "";
      document.getElementById("activityEndDate").value = "";
    } else {
      appliedActivityFilters[key] = key === "undertake" ? false : "";
      const field = document.getElementById(fieldMap[key]);
      if (key === "undertake") field.checked = false;
      else field.value = "";
    }
  }
  filterActivities();
});
document.querySelectorAll("[data-open-activity]").forEach((button) => button.addEventListener("click", () => showPage("activityDetail")));
document.querySelectorAll("[data-activity-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-activity-tab]").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll("[data-activity-panel]").forEach((panel) => panel.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`[data-activity-panel="${button.dataset.activityTab}"]`)?.classList.add("active");
  });
});
document.getElementById("createActivityButton")?.addEventListener("click", () => openCreationWorkspace("activity"));

let leadMode = "none";
let leadView = "all";
let leadAppliedFilters = { keyword: "", source: "", time: "", valid: "", channel: "", code: "", crmStatus: "", transfer: "", region: "" };

function openLeadSettingPanel(panel) {
  document.querySelectorAll("[data-lead-setting-tab]").forEach((item) => item.classList.toggle("active", item.dataset.leadSettingTab === panel));
  document.querySelectorAll("[data-lead-setting-panel]").forEach((item) => item.classList.toggle("active", item.dataset.leadSettingPanel === panel));
}

function renderLeadMode() {
  const isMk = leadMode === "none";
  document.getElementById("leadTargetHeader").textContent = isMk ? "分派至" : "CRM编码";
  document.querySelectorAll('[data-mode-label="mk"]').forEach((item) => { item.hidden = !isMk; });
  document.querySelectorAll('[data-mode-label="crm"]').forEach((item) => { item.hidden = isMk; });
  document.querySelectorAll("[data-health-mk]").forEach((item) => { item.hidden = !isMk; });
  document.querySelectorAll("[data-health-crm]").forEach((item) => { item.hidden = isMk; });
  const stateLabels = isMk ? { pending: "待分派", success: "已分派", exception: "分派异常" } : { pending: "待同步", success: "已同步CRM", exception: "同步异常" };
  document.querySelectorAll("[data-mode-state]").forEach((item) => { item.textContent = stateLabels[item.dataset.modeState]; });
  document.querySelectorAll(".lead-primary-action").forEach((item) => { item.textContent = isMk ? item.dataset.actionMk : item.dataset.actionCrm; });
  document.querySelectorAll(".lead-row:not(.head)").forEach((row, index) => {
    row.dataset.route = isMk ? "MK线索分派" : "同步CRM";
    const target = row.querySelector("[data-lead-target]");
    const result = row.querySelector("[data-lead-result]");
    if (!isMk) {
      target.textContent = row.dataset.view === "success" ? `CRM-20260915${String(index + 1).padStart(3, "0")}` : "—";
      result.textContent = row.dataset.view === "pending" ? "等待同步任务" : row.dataset.view === "exception" ? "渠道未映射" : "CRM已成功接收";
    } else {
      const mkTargets = ["—", "华北区 · 王洁", "—", "华东区 · 李明"];
      const mkResults = ["等待区域规则匹配", "规则：北京企业线索", "地区未配置接收组织", "规则：上海企业线索"];
      target.textContent = mkTargets[index];
      result.textContent = mkResults[index];
    }
  });
  filterLeads();
}

function readLeadFilters() {
  leadAppliedFilters = {
    keyword: document.getElementById("leadKeyword").value.trim(),
    source: document.getElementById("leadSourceFilter").value,
    time: document.getElementById("leadTimeFilter").value,
    valid: document.getElementById("leadValidFilter").value,
    channel: document.getElementById("leadChannelFilter").value.trim(),
    code: document.getElementById("leadCodeFilter").value.trim(),
    crmStatus: document.getElementById("leadCrmStatusFilter").value,
    transfer: document.getElementById("leadTransferFilter").value,
    region: document.getElementById("leadRegionFilter").value,
  };
}

function renderLeadFilterChips() {
  const chips = document.getElementById("leadFilterChips");
  if (chips) chips.replaceChildren();
  document.getElementById("leadFilterSummary").hidden = true;
}

function filterLeads() {
  const query = leadAppliedFilters.keyword.toLowerCase();
  let shown = 0;
  document.querySelectorAll(".lead-row:not(.head)").forEach((row) => {
    const visible = (leadView === "all" || row.dataset.view === leadView)
      && (!query || row.dataset.search.toLowerCase().includes(query))
      && (!leadAppliedFilters.source || row.dataset.source === leadAppliedFilters.source)
      && (!leadAppliedFilters.time || Number(row.dataset.age) <= (leadAppliedFilters.time === "today" ? 0 : leadAppliedFilters.time === "7d" ? 7 : 30))
      && (!leadAppliedFilters.valid || row.dataset.valid === leadAppliedFilters.valid)
      && (!leadAppliedFilters.channel || row.dataset.channel.toLowerCase().includes(leadAppliedFilters.channel.toLowerCase()))
      && (!leadAppliedFilters.code || `${row.dataset.crmCode} ${row.dataset.ccCode}`.toLowerCase().includes(leadAppliedFilters.code.toLowerCase()))
      && (!leadAppliedFilters.crmStatus || row.dataset.crmStatus === leadAppliedFilters.crmStatus)
      && (!leadAppliedFilters.transfer || row.dataset.transfer === leadAppliedFilters.transfer)
      && (!leadAppliedFilters.region || row.dataset.region === leadAppliedFilters.region);
    row.hidden = !visible;
    if (visible) shown += 1;
  });
  document.getElementById("leadTotal").textContent = shown;
  document.getElementById("leadEmpty").hidden = shown !== 0;
  document.querySelector(".lead-table-scroll").hidden = shown === 0;
  renderLeadFilterChips();
}

function resetLeadFilters() {
  leadView = "all";
  leadAppliedFilters = { keyword: "", source: "", time: "", valid: "", channel: "", code: "", crmStatus: "", transfer: "", region: "" };
  document.getElementById("leadKeyword").value = "";
  ["leadSourceFilter", "leadTimeFilter", "leadValidFilter", "leadChannelFilter", "leadCodeFilter", "leadCrmStatusFilter", "leadTransferFilter", "leadRegionFilter"].forEach((id) => { document.getElementById(id).value = ""; });
  document.querySelectorAll("[data-lead-view]").forEach((item) => item.classList.toggle("active", item.dataset.leadView === "all"));
  document.getElementById("leadAdvanced").classList.remove("open");
  const toggle = document.getElementById("leadAdvancedButton");
  toggle.setAttribute("aria-expanded", "false");
  toggle.innerHTML = '高级筛选 <span>⌄</span>';
  filterLeads();
}

document.querySelectorAll("[data-lead-view]").forEach((button) => button.addEventListener("click", () => {
  leadView = button.dataset.leadView;
  document.querySelectorAll("[data-lead-view]").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  filterLeads();
}));
document.getElementById("leadSearchButton")?.addEventListener("click", () => { readLeadFilters(); filterLeads(); });
document.getElementById("leadKeyword")?.addEventListener("keydown", (event) => { if (event.key === "Enter") { readLeadFilters(); filterLeads(); } });
document.getElementById("leadAdvancedButton")?.addEventListener("click", (event) => {
  const open = document.getElementById("leadAdvanced").classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(open));
  event.currentTarget.innerHTML = `${open ? "收起筛选" : "高级筛选"} <span>${open ? "⌃" : "⌄"}</span>`;
});
document.getElementById("leadResetButton")?.addEventListener("click", resetLeadFilters);
document.getElementById("leadClearFilters")?.addEventListener("click", resetLeadFilters);
document.getElementById("leadFilterChips")?.addEventListener("click", (event) => {
  const chip = event.target.closest("[data-remove-lead-filter]");
  if (!chip) return;
  const fieldMap = { keyword: "leadKeyword", source: "leadSourceFilter", time: "leadTimeFilter", valid: "leadValidFilter", channel: "leadChannelFilter", code: "leadCodeFilter", crmStatus: "leadCrmStatusFilter", transfer: "leadTransferFilter", region: "leadRegionFilter" };
  leadAppliedFilters[chip.dataset.removeLeadFilter] = "";
  document.getElementById(fieldMap[chip.dataset.removeLeadFilter]).value = "";
  filterLeads();
});
document.querySelectorAll("[data-open-lead]").forEach((button) => button.addEventListener("click", () => {
  const row = button.closest(".lead-row");
  const identity = row?.children[0], company = row?.children[1], state = row?.querySelector("[data-mode-state]");
  const name = button.dataset.openLead, phone = identity?.querySelector("small")?.textContent || "—", companyName = company?.childNodes[0]?.textContent.trim() || "—", job = company?.querySelector("small")?.textContent || "—";
  document.getElementById("leadDrawerName").textContent = name;
  document.getElementById("leadDrawerPhone").textContent = phone;
  document.getElementById("leadDrawerCompany").textContent = `${companyName} · ${job}`;
  document.getElementById("leadDrawerStatus").textContent = state?.textContent || row?.dataset.valid || "待判断";
  document.getElementById("leadDetailName").textContent = name;
  document.getElementById("leadDetailPhone").textContent = phone;
  document.getElementById("leadDetailCompany").textContent = companyName;
  document.getElementById("leadDetailValid").textContent = row?.dataset.valid || "—";
  document.getElementById("leadDetailCrmCode").textContent = row?.dataset.crmCode || "—";
  document.getElementById("leadDetailCcCode").textContent = row?.dataset.ccCode || "—";
  document.getElementById("leadDetailCrmStatus").textContent = row?.dataset.crmStatus || "—";
  document.getElementById("leadDetailTransfer").textContent = row?.dataset.transfer || "—";
  document.querySelectorAll("[data-lead-detail-tab]").forEach((item) => item.classList.toggle("active", item.dataset.leadDetailTab === "basic"));
  document.querySelectorAll("[data-lead-detail-panel]").forEach((item) => item.classList.toggle("active", item.dataset.leadDetailPanel === "basic"));
  document.getElementById("leadDrawer").classList.add("open");
  document.getElementById("leadDrawer").setAttribute("aria-hidden", "false");
}));
document.querySelectorAll("[data-lead-detail-tab]").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll("[data-lead-detail-tab]").forEach((item) => item.classList.toggle("active", item === button));
  document.querySelectorAll("[data-lead-detail-panel]").forEach((item) => item.classList.toggle("active", item.dataset.leadDetailPanel === button.dataset.leadDetailTab));
}));
document.querySelectorAll("[data-close-lead]").forEach((button) => button.addEventListener("click", () => { document.getElementById("leadDrawer").classList.remove("open"); document.getElementById("leadDrawer").setAttribute("aria-hidden", "true"); }));
document.querySelectorAll("[data-history-name]").forEach((button) => button.addEventListener("click", () => {
  document.getElementById("leadHistoryName").textContent = button.dataset.historyName;
  document.getElementById("leadHistoryDrawer").classList.add("open");
  document.getElementById("leadHistoryDrawer").setAttribute("aria-hidden", "false");
}));
document.querySelectorAll("[data-close-history]").forEach((button) => button.addEventListener("click", () => { document.getElementById("leadHistoryDrawer").classList.remove("open"); document.getElementById("leadHistoryDrawer").setAttribute("aria-hidden", "true"); }));
document.querySelectorAll("[data-lead-setting-tab]").forEach((button) => button.addEventListener("click", () => openLeadSettingPanel(button.dataset.leadSettingTab)));
document.querySelectorAll("[data-open-route-setting]").forEach((button) => button.addEventListener("click", () => openLeadSettingPanel("route")));
document.querySelectorAll('input[name="leadRouteMode"]').forEach((radio) => radio.addEventListener("change", () => {
  document.querySelectorAll(".lead-route-options label").forEach((item) => item.classList.toggle("selected", item.contains(radio)));
  document.getElementById("leadRouteImpact").hidden = radio.value === leadMode;
  const impacts = {
    none: ["后续新增线索将保留在 Marketing Cloud，不向外部系统传输。", ["已有线索不会重新传输", "当前待处理线索继续沿用原路径", "管理员仍可在线索列表中查看和处理"]],
    crm: ["后续符合条件的新线索将由 Marketing Cloud 直接同步至 CRM。", ["请先确认组织、渠道和字段映射完整", "同步结果将在列表的传输状态中展示", "同步失败的线索可按失败原因处理"]],
    cc: ["后续符合条件的新线索将先同步至 CC，再由 CC 按规则同步至 CRM。", ["请先确认 CC 编码、组织和部门配置", "CRM 的最终结果取决于 CC 侧同步规则", "两段传输状态均需保留，便于定位失败环节"]],
  };
  document.getElementById("leadRouteImpactText").textContent = impacts[radio.value][0];
  document.getElementById("leadRouteImpactList").innerHTML = impacts[radio.value][1].map((item) => `<li>${item}</li>`).join("");
}));
document.getElementById("cancelLeadRoute")?.addEventListener("click", () => {
  const radio = document.querySelector(`input[name="leadRouteMode"][value="${leadMode}"]`);
  radio.checked = true;
  document.querySelectorAll(".lead-route-options label").forEach((item) => item.classList.toggle("selected", item.contains(radio)));
  document.getElementById("leadRouteImpact").hidden = true;
});
document.getElementById("confirmLeadRoute")?.addEventListener("click", () => {
  leadMode = document.querySelector('input[name="leadRouteMode"]:checked').value;
  document.getElementById("leadRouteImpact").hidden = true;
  renderLeadMode();
  const toast = document.getElementById("leadToast");
  const modeNames = { none: "不同步", crm: "同步至 CRM", cc: "同步至 CC" };
  toast.textContent = `流转方式已保存为“${modeNames[leadMode]}”，仅对新进入线索生效`;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2400);
});
document.querySelectorAll("[data-crm-config-tab]").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll("[data-crm-config-tab]").forEach((item) => item.classList.remove("active"));
  document.querySelectorAll("[data-crm-config-panel]").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  document.querySelector(`[data-crm-config-panel="${button.dataset.crmConfigTab}"]`).classList.add("active");
}));
document.querySelectorAll("[data-assignment-tab]").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll("[data-assignment-tab]").forEach((item) => item.classList.toggle("active", item === button));
  document.querySelectorAll("[data-assignment-panel]").forEach((item) => item.classList.toggle("active", item.dataset.assignmentPanel === button.dataset.assignmentTab));
}));
document.querySelectorAll("[data-dedupe-tab]").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll("[data-dedupe-tab]").forEach((item) => item.classList.toggle("active", item === button));
  document.querySelectorAll(".dedupe-rule-table > span").forEach((cell) => {
    const rowStart = cell.parentElement.children[Math.floor((Array.from(cell.parentElement.children).indexOf(cell) - 7) / 7) * 7 + 7];
    cell.hidden = button.dataset.dedupeTab !== "all" && rowStart?.dataset.dedupeSystem !== button.dataset.dedupeTab;
  });
}));
document.querySelectorAll("[data-config-create]").forEach((button) => button.addEventListener("click", () => showLandingToast(`进入新建${button.dataset.configCreate}流程`)));
renderLeadMode();

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
  const industry = document.getElementById("intentIndustryFilter")?.value || "全部行业";
  const region = document.getElementById("intentRegionFilter")?.value || "";
  const range = Number(document.getElementById("intentRangeFilter")?.value || 0);
  const regionByIndex = ["华东", "华南", "华北"];
  const ageByLevel = { high: [2, 1, 7], mid: [7, 14, 14], low: [21, 25, 30], silent: [65, 120, 180] };
  const rows = config.rows.filter((row, index) => (industry === "全部行业" || row[2] === industry)
    && (!region || regionByIndex[index] === region)
    && (!range || ageByLevel[level][index] <= range));
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
  table.innerHTML = heading + rows.map((row) => {
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
  }).join("") + (rows.length ? "" : '<div class="content-list-empty"><b>没有找到匹配客户</b><span>请调整行业或意向等级后重试</span></div>');
}

document.querySelectorAll("[data-intent-level]").forEach((button) => {
  button.addEventListener("click", () => renderIntentLayer(button.dataset.intentLevel));
});
document.getElementById("intentApplyFilter")?.addEventListener("click", () => renderIntentLayer(document.getElementById("intentLevelSelect").value));
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
  const target = document.getElementById("landingChips");
  if (target) {
    target.replaceChildren();
    target.hidden = true;
  }
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
    const scopeValue = landingCurrentScope === "所在组织发布" ? "所在组织"
      : landingCurrentScope === "其他组织发布" ? "其他组织"
      : landingCurrentScope;
    const scopeMatch = landingCurrentScope === "全部" || row.dataset.scope === scopeValue;
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

  const landingCount = document.getElementById("landingCount");
  if (landingCount) landingCount.textContent = shown;
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
  document.getElementById("landingAdvanced").classList.remove("open");
  const advancedToggle = document.getElementById("landingAdvancedButton");
  advancedToggle.setAttribute("aria-expanded", "false");
  advancedToggle.innerHTML = '高级筛选 <span aria-hidden="true">⌄</span>';
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

document.getElementById("landingKeyword").addEventListener("input", applyLandingFilters);
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

document.getElementById("landingCreateButton").addEventListener("click", () => openCreationWorkspace("landing"));
document.getElementById("landingSaveView")?.addEventListener("click", () => showLandingToast("已保存为「我的常用视图」"));

const companyAdvancedButton = document.getElementById("companyAdvancedButton");
companyAdvancedButton.addEventListener("click", () => {
  const advanced = document.getElementById("companyAdvancedFilters");
  const isOpen = advanced.classList.toggle("open");
  companyAdvancedButton.setAttribute("aria-expanded", String(isOpen));
  companyAdvancedButton.innerHTML = `${isOpen ? "收起筛选" : "高级筛选"} <span aria-hidden="true">${isOpen ? "⌃" : "⌄"}</span>`;
});

document.getElementById("intentAdvancedButton")?.addEventListener("click", (event) => {
  const advanced = document.getElementById("intentAdvancedFilters");
  const isOpen = advanced.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
  event.currentTarget.innerHTML = `${isOpen ? "收起筛选" : "高级筛选"} <span>${isOpen ? "⌃" : "⌄"}</span>`;
});

document.getElementById("userAdvancedButton")?.addEventListener("click", (event) => {
  const advanced = document.getElementById("userAdvancedFilters");
  const isOpen = advanced.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
  event.currentTarget.innerHTML = `${isOpen ? "收起筛选" : "高级筛选"} <span aria-hidden="true">${isOpen ? "⌃" : "⌄"}</span>`;
});

document.getElementById("groupAdvancedButton")?.addEventListener("click", (event) => {
  const advanced = document.getElementById("groupAdvancedFilters");
  const isOpen = advanced.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
  event.currentTarget.innerHTML = `${isOpen ? "收起筛选" : "高级筛选"} <span aria-hidden="true">${isOpen ? "⌃" : "⌄"}</span>`;
});

document.querySelectorAll(".unified-reset").forEach((button) => {
  button.addEventListener("click", () => {
    const panel = button.closest(".unified-filter-panel");
    panel.querySelectorAll("input").forEach((input) => { input.value = ""; });
    panel.querySelectorAll("select").forEach((select) => { select.selectedIndex = 0; });
    const advanced = panel.querySelector(".unified-filter-advanced");
    const toggle = panel.querySelector(".unified-advanced-toggle");
    advanced?.classList.remove("open");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.innerHTML = '高级筛选 <span aria-hidden="true">⌄</span>';
    }
    if (panel.querySelector("#intentLevelSelect")) renderIntentLayer("high");
    if (panel.querySelector("#userKeyword")) filterUsers();
    if (panel.querySelector("#groupKeyword")) filterGroups();
    if (panel.querySelector("#companyKeyword")) filterCompanies();
  });
});
document.querySelectorAll("#landingBatch button").forEach((button) => button.addEventListener("click", () => showLandingToast(`${button.textContent.trim()}操作已触发`)));

renderLandingChips();

const creationWorkspaceConfig = {
  landing: {
    label: "落地页", title: "新建落地页", crumb: "内容与承接 / 落地页列表",
    steps: ["选择模板", "编辑页面", "发布设置"], name: "未命名落地页",
    tools: [["标题", "T"], ["图片", "▧"], ["按钮", "▭"], ["表单", "▤"], ["分栏", "▥"], ["留白", "↕"]],
    preview: `<div class="creation-page-preview"><header><b>YOUR BRAND</b><span>首页　产品　案例　联系我们</span></header><section><em>企业增长新方案</em><h1>让每一次营销触达<br>更接近业务结果</h1><p>组合内容、表单与自动化能力，快速搭建高转化页面。</p><button>立即了解</button></section><footer><b>5000+</b><span>企业客户</span><b>95%</b><span>效率提升</span></footer></div>`,
    settings: [["页面名称", "text", "请输入页面名称"], ["页面分类", "select", "活动报名|产品发布|内容下载"], ["页面地址", "text", "page.yonyou.com/"], ["SEO 描述", "textarea", "请输入页面摘要"]],
  },
  activity: {
    label: "活动", title: "新建活动", crumb: "活动中心 / 活动管理",
    steps: ["基础信息", "报名设置", "发布确认"], name: "未命名活动",
    tools: [["活动介绍", "文"], ["封面图", "图"], ["日程", "历"], ["嘉宾", "人"], ["报名表", "表"], ["地点", "⌖"]],
    preview: `<div class="creation-form-preview"><div class="creation-cover"><span>2026</span><h2>数智营销增长峰会</h2><p>连接洞察、内容与行动</p></div><h3>活动简介</h3><p>在此编辑活动介绍、议程和参会须知。右侧可完善活动的基础信息。</p><div class="creation-info-strip"><span><small>时间</small>2026-10-16 09:00</span><span><small>形式</small>线上 / 线下</span><span><small>地点</small>北京</span></div></div>`,
    settings: [["活动标题", "text", "请输入活动标题"], ["活动类型", "select", "峰会|闭门会|直播|培训"], ["活动时间", "datetime-local", ""], ["活动形式", "select", "线上|线下|线上 / 线下"], ["举办地点", "text", "请输入详细地址"]],
  },
  form: {
    label: "表单", title: "新建表单", crumb: "内容中心 / 表单 / 表单列表",
    steps: ["设计表单", "表单设置", "发布表单"], name: "未命名表单",
    tools: [["姓名", "Aa"], ["手机号", "#"], ["邮箱", "@"], ["公司", "企"], ["单选", "◉"], ["多选", "☑"], ["下拉框", "⌄"], ["多文本", "≡"]],
    preview: `<div class="creation-form-preview"><h2>欢迎填写表单</h2><p>请留下您的信息，我们会尽快与您联系。</p><label>姓名 <i>*</i><input placeholder="请输入姓名"></label><label>手机号 <i>*</i><input placeholder="请输入手机号"></label><label>公司<input placeholder="请输入公司名称"></label><button>确认提交</button></div>`,
    settings: [["表单名称", "text", "请输入表单名称"], ["提交按钮文案", "text", "确认提交"], ["提交后提示", "textarea", "提交成功，感谢您的参与"], ["线索策略", "select", "提交后生成线索|仅收集数据"]],
  },
  survey: {
    label: "问卷", title: "新建问卷", crumb: "内容中心 / 调查问卷 / 问卷列表",
    steps: ["问卷内容", "外观设置", "提交后", "发布"], name: "未命名问卷",
    tools: [["单选题", "◉"], ["多选题", "☑"], ["填空题", "＿"], ["多文本", "≡"], ["下拉题", "⌄"], ["NPS", "10"]],
    preview: `<div class="creation-form-preview survey"><h2>客户需求调研</h2><p>感谢参与，本问卷预计用时 2 分钟。</p><div class="creation-question"><b>1. 您当前最关注的业务方向？ <i>*</i></b><label><input type="radio" name="q1"> 获客增长</label><label><input type="radio" name="q1"> 客户运营</label><label><input type="radio" name="q1"> 数据分析</label></div><div class="creation-question"><b>2. 其他建议</b><textarea placeholder="请输入"></textarea></div></div>`,
    settings: [["问卷名称", "text", "请输入问卷名称"], ["问卷副标题", "text", "请输入副标题"], ["问卷说明", "textarea", "感谢参与本次调研"], ["答题设置", "select", "每人限答一次|允许重复答题"]],
  },
};

let activeCreationType = "";

function ensureCreationWorkspace() {
  if (document.getElementById("creationWorkspace")) return;
  const page = document.createElement("section");
  page.className = "page creation-workspace";
  page.id = "creationWorkspace";
  document.querySelector("main")?.appendChild(page);
}

function renderCreationSettings(config) {
  return config.settings.map(([label, type, value], index) => {
    const id = `creationSetting${index}`;
    if (type === "select") return `<label><span>${label}${index === 0 ? " *" : ""}</span><select id="${id}">${value.split("|").map((item) => `<option>${item}</option>`).join("")}</select></label>`;
    if (type === "textarea") return `<label><span>${label}</span><textarea id="${id}" placeholder="${value}"></textarea></label>`;
    return `<label><span>${label}${index === 0 ? " *" : ""}</span><input id="${id}" type="${type}" placeholder="${value}"></label>`;
  }).join("");
}

function openCreationWorkspace(type) {
  const config = creationWorkspaceConfig[type];
  if (!config) return;
  activeCreationType = type;
  ensureCreationWorkspace();
  const page = document.getElementById("creationWorkspace");
  page.innerHTML = `<header class="creation-header"><div class="creation-header-left"><button class="creation-back" id="creationBack">← 返回${config.label}列表</button><i></i><span><small>${config.crumb}</small><input id="creationName" value="${config.name}" aria-label="${config.label}名称"></span></div><nav>${config.steps.map((step, index) => `<button class="${index === 0 ? "active" : ""}" data-creation-step="${index}"><b>${index + 1}</b>${step}</button>`).join("")}</nav><div><button class="ghost-button" id="creationPreview">预览</button><button class="ghost-button" id="creationDraft">暂存</button><button class="primary-button" id="creationPublish">${type === "activity" ? "发布活动" : type === "landing" ? "确认发布" : "完成并发布"}</button></div></header><div class="creation-body"><aside class="creation-toolbox"><div><b>${type === "landing" ? "页面组件" : type === "activity" ? "活动模块" : type === "form" ? "表单组件" : "问卷题型"}</b><small>点击添加到中间编辑区</small></div><section>${config.tools.map(([label, icon]) => `<button data-creation-tool="${label}"><i>${icon}</i><span>${label}</span></button>`).join("")}</section></aside><main class="creation-canvas"><div class="creation-canvas-toolbar"><span>桌面端</span><button class="active">▱</button><button>▯</button><em>自动保存于刚刚</em></div><div class="creation-preview-shell" id="creationPreviewShell">${config.preview}</div></main><aside class="creation-settings"><div class="creation-settings-title"><b>编辑区域</b><span>基础设置</span></div><div class="creation-setting-fields">${renderCreationSettings(config)}</div><div class="creation-setting-tip"><b>操作提示</b><p>选择左侧组件可继续添加内容；所有变更会在本地原型中即时预览。</p></div></aside></div>`;
  showPage("creationWorkspace");
  document.getElementById("pageTitle").textContent = config.title;
  bindCreationWorkspace();
}

function returnToCreationList(message = "") {
  const type = activeCreationType;
  if (type === "landing") showPage("landingPages");
  else if (type === "activity") showPage("activities");
  else {
    showPage("contentCenter");
    openContentSection(type === "form" ? "forms" : "surveys");
  }
  if (message) showLandingToast(message);
}

function bindCreationWorkspace() {
  const page = document.getElementById("creationWorkspace");
  page.querySelector("#creationBack").onclick = () => returnToCreationList();
  page.querySelector("#creationDraft").onclick = () => returnToCreationList(`${creationWorkspaceConfig[activeCreationType].label}草稿已保存，已返回列表`);
  page.querySelector("#creationPublish").onclick = () => {
    const name = page.querySelector("#creationName").value.trim();
    if (!name || name.startsWith("未命名")) {
      page.querySelector("#creationName").focus();
      page.querySelector("#creationName").classList.add("invalid");
      showLandingToast(`请先填写${creationWorkspaceConfig[activeCreationType].label}名称`);
      return;
    }
    returnToCreationList(`“${name}”已发布，已返回${creationWorkspaceConfig[activeCreationType].label}列表`);
  };
  page.querySelector("#creationPreview").onclick = () => page.classList.toggle("preview-mode");
  page.querySelectorAll("[data-creation-step]").forEach((button) => button.onclick = () => {
    page.querySelectorAll("[data-creation-step]").forEach((item) => item.classList.toggle("active", item === button));
    page.querySelector(".creation-settings-title span").textContent = button.textContent.trim().replace(/^\d+/, "");
  });
  page.querySelectorAll("[data-creation-tool]").forEach((button) => button.onclick = () => {
    const block = document.createElement("div");
    block.className = "creation-added-block";
    block.innerHTML = `<span>⋮⋮</span><b>${button.dataset.creationTool}</b><small>点击右侧设置内容与样式</small><button aria-label="删除组件">×</button>`;
    block.querySelector("button").onclick = () => block.remove();
    page.querySelector("#creationPreviewShell").appendChild(block);
    showLandingToast(`已添加${button.dataset.creationTool}`);
  });
  page.querySelector("#creationName").oninput = (event) => event.currentTarget.classList.remove("invalid");
}

// 筛选统一：发布范围文案与数据值兼容，并保留查询按钮作为明确的执行入口。
const landingSearchButton = document.getElementById("landingSearchButton");
if (landingSearchButton) landingSearchButton.addEventListener("click", applyLandingFilters);

function filterUsers() {
  const keyword = document.getElementById("userKeyword").value.trim().toLowerCase();
  const identity = document.getElementById("userIdentityFilter").value;
  const status = document.getElementById("userStatusFilter").value;
  const gender = document.getElementById("userGenderFilter").value;
  const industry = document.getElementById("userIndustryFilter").value;
  const region = document.getElementById("userRegionFilter").value;
  const source = document.getElementById("userSourceFilter").value;
  const registeredDays = document.getElementById("userRegisteredFilter").value;
  const activeDays = document.getElementById("userActiveFilter").value;
  let shown = 0;
  document.querySelectorAll(".user-list-row").forEach((row) => {
    const match = (!keyword || row.dataset.search.toLowerCase().includes(keyword))
      && (!identity || row.dataset.identity === identity)
      && (!status || row.dataset.status === status)
      && (!gender || row.dataset.gender === gender)
      && (!industry || row.dataset.industry === industry)
      && (!region || row.dataset.region === region)
      && (!source || row.dataset.source === source)
      && (!registeredDays || Number(row.dataset.registeredDays) <= Number(registeredDays))
      && (activeDays === "" || Number(row.dataset.activeDays) <= Number(activeDays));
    row.style.display = match ? "" : "none";
    if (match) shown += 1;
  });
  const empty = document.getElementById("userEmptyState");
  if (empty) empty.hidden = Boolean(shown);
}

const userSearchButton = document.getElementById("userSearchButton");
if (userSearchButton) userSearchButton.addEventListener("click", filterUsers);
document.querySelectorAll("[data-user-edit]").forEach((button) => {
  button.addEventListener("click", () => showLandingToast(`进入编辑联系人：${button.dataset.userEdit}`));
});
document.getElementById("userKeyword")?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") filterUsers();
});
function filterGroups() {
  const keyword = document.getElementById("groupKeyword").value.trim().toLowerCase();
  const type = document.getElementById("groupTypeFilter").value;
  const create = document.getElementById("groupCreateFilter").value;
  let shown = 0;
  document.querySelectorAll(".group-list-row").forEach((row) => {
    const match = (!keyword || row.dataset.search.toLowerCase().includes(keyword))
      && (!type || row.dataset.type === type)
      && (!create || row.dataset.create === create);
    row.hidden = !match;
    if (match) shown += 1;
  });
  document.getElementById("groupEmptyState").hidden = shown !== 0;
  document.getElementById("groupListTable").classList.toggle("has-empty", shown === 0);
}

function filterCompanies() {
  const keyword = document.getElementById("companyKeyword").value.trim().toLowerCase();
  const status = document.getElementById("companyStatusFilter").value;
  const crm = document.getElementById("companyCrmFilter").value;
  let shown = 0;
  document.querySelectorAll(".company-list-row").forEach((row) => {
    const match = (!keyword || row.dataset.search.toLowerCase().includes(keyword))
      && (!status || row.dataset.status === status)
      && (!crm || row.dataset.crm === crm);
    row.hidden = !match;
    if (match) shown += 1;
  });
  document.getElementById("companyEmptyState").hidden = shown !== 0;
  document.getElementById("companyListTable").classList.toggle("has-empty", shown === 0);
}

document.getElementById("companySearchButton")?.addEventListener("click", filterCompanies);
document.getElementById("companyKeyword")?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") filterCompanies();
});

document.getElementById("groupSearchButton")?.addEventListener("click", filterGroups);
document.getElementById("groupKeyword")?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") filterGroups();
});
