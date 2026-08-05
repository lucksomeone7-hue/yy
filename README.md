# Marketing Cloud 客户经营一期

本项目基于《Marketing Cloud 客户经营一期 PRD》，补充高意向、中意向、低意向及沉默客户识别后的下一步动作和交互闭环。

## 在线原型

GitHub Pages 启用后访问：

<https://lucksomeone7-hue.github.io/yy/>

## 本地访问

下载或克隆仓库后，直接双击以下文件：

```text
prototype/index.html
```

原型为纯 HTML、CSS 和 JavaScript，不需要安装依赖或启动服务。

## 文件说明

- `PRD.md`：Marketing Cloud 客户经营一期 PRD。
- `高意向人群下一步动作与交互设计.md`：新增需求与交互说明。
- `研发分歧点与改造清单.md`：底层能力与一期产品口径的差异及改造项。
- `prototype/`：可直接打开和发布的交互原型。

## 核心链路

```text
客户行为数据
-> 规则识别意向
-> 判断触达资格与销售状态
-> 推荐下一步最佳动作
-> 运营确认并执行或交接
-> 回收内容互动、销售反馈与转化结果
```

