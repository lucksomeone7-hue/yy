let currentView = "all";
const rows = [...document.querySelectorAll(".row:not(.head)")];
const mockDimensions = [
  { time: "today", valid: "待判断", channel: "官网", org: "市场运营部", owner: "未分派", region: "北京", history: "yes", crm: "", exception: "" },
  { time: "7d", valid: "有效", channel: "线下会议", org: "未匹配", owner: "未分派", region: "江苏", history: "no", crm: "", exception: "" },
  { time: "today", valid: "有效", channel: "线下会议", org: "华北区", owner: "王洁", region: "北京", history: "no", crm: "", exception: "" },
  { time: "7d", valid: "有效", channel: "官网", org: "华东区", owner: "李明", region: "上海", history: "yes", crm: "CRM-20260915004", exception: "" },
  { time: "7d", valid: "有效", channel: "资料中心", org: "市场运营部", owner: "未分派", region: "江苏", history: "yes", crm: "", exception: "渠道未映射" },
  { time: "7d", valid: "待判断", channel: "微信", org: "未匹配", owner: "未分派", region: "江苏", history: "no", crm: "", exception: "组织未匹配" }
];
rows.forEach((row, index) => Object.assign(row.dataset, mockDimensions[index]));
const controls = {
  keyword: document.getElementById("keyword"), source: document.getElementById("source"), time: document.getElementById("submitTime"), valid: document.getElementById("valid"), mode: document.getElementById("routeMode"),
  state: document.getElementById("rawState"), channel: document.getElementById("channel"), org: document.getElementById("org"),
  owner: document.getElementById("owner"), region: document.getElementById("region"), history: document.getElementById("history"),
  crm: document.getElementById("crmCode"), exception: document.getElementById("exceptionType")
};
const labels = { source: "线索来源", time: "提交时间", valid: "是否有效", mode: "流转方式", state: "具体状态", channel: "来源渠道", org: "所属/接收组织", owner: "负责人", region: "地区", history: "历史提交", crm: "CRM编码", exception: "异常类型" };
function render() {
  const query = controls.keyword.value.trim().toLowerCase();
  let count = 0;
  rows.forEach((row) => {
    const fieldsMatch = Object.entries(controls).filter(([key]) => key !== "keyword").every(([key, control]) => {
      if (!control.value) return true;
      if (key === "time") return control.value === "today" ? row.dataset.time === "today" : ["today", "7d"].includes(row.dataset.time);
      return row.dataset[key] === control.value;
    });
    const visible = (currentView === "all" || row.dataset.view === currentView) && (!query || row.dataset.search.toLowerCase().includes(query)) && fieldsMatch;
    row.hidden = !visible;
    if (visible) count += 1;
  });
  document.getElementById("total").textContent = count;
  document.getElementById("empty").hidden = count !== 0;
  document.querySelector(".table-wrap").hidden = count === 0;
  const chips = Object.entries(controls).filter(([key, control]) => key !== "keyword" && control.value).map(([key, control]) => `${labels[key]}：${key === "history" ? (control.value === "yes" ? "有历史提交" : "首次提交") : control.value}`);
  document.getElementById("chips").innerHTML = chips.map((value) => `<button>${value} ×</button>`).join("");
  document.querySelector(".result-line").hidden = chips.length === 0;
}
document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => {
  currentView = button.dataset.view;
  document.querySelectorAll("[data-view]").forEach((item) => item.classList.toggle("active", item === button));
  render();
}));
document.getElementById("advancedToggle").addEventListener("click", () => document.getElementById("advanced").classList.toggle("open"));
document.getElementById("search").addEventListener("click", render);
Object.values(controls).filter((control) => control.tagName === "SELECT").forEach((control) => control.addEventListener("change", render));
document.getElementById("reset").addEventListener("click", () => {
  currentView = "all";
  Object.values(controls).forEach((control) => { control.value = ""; });
  document.querySelectorAll("[data-view]").forEach((item) => item.classList.toggle("active", item.dataset.view === "all"));
  render();
});
document.querySelectorAll("[data-quick-state]").forEach((button) => button.addEventListener("click", () => {
  currentView = button.dataset.quickState;
  controls.mode.value = button.dataset.quickMode || "";
  controls.state.value = "";
  document.querySelectorAll("[data-view]").forEach((item) => item.classList.toggle("active", item.dataset.view === currentView));
  document.getElementById("advanced").classList.add("open");
  render();
}));
const drawer = document.getElementById("drawer");
document.querySelectorAll("[data-detail]").forEach((button) => button.addEventListener("click", () => {
  const row = button.closest(".row");
  document.getElementById("drawerName").textContent = button.dataset.detail;
  document.getElementById("drawerMode").textContent = row.dataset.mode;
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
}));
document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => {
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
}));
