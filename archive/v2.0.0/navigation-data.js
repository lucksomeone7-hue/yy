/* 菜单范围：一期原型 + 已保存的 MK 全模块只读走查；不把走查中的未来建议当成现有功能。 */
window.MK_NAVIGATION = [
  {id:'work',label:'工作台',icon:'▦',items:[
    {id:'dashboard',label:'经营看板',page:'dashboard',aliases:'首页 客户经营'},
    {id:'actions',label:'行动待办',page:'actions',aliases:'经营动作中心'},
  ]},
  {id:'customers',label:'客户与人群',icon:'♙',items:[
    {id:'users',label:'联系人',page:'users',aliases:'用户中心 用户管理 用户列表'},
    {id:'companies',label:'企业客户',page:'companies',aliases:'公司信息 企业账户'},
    {id:'segment',label:'人群分组',page:'segment',aliases:'用户分组'},
    {id:'profileTags',label:'画像与标签',page:'profileTags',aliases:'用户画像 用户标签'},
    {id:'layers',label:'意向分层',page:'layers'},
    {id:'settings',label:'意向评分配置',page:'settings',section:'业务配置',aliases:'客户意向评分规则 行为权重 规则版本'},
  ]},
  {id:'content',label:'内容与页面',icon:'▤',items:[
    {id:'contentCenter',label:'内容概览',page:'contentCenter',aliases:'内容中心 内容工作台'},
    ...[['articles','文章'],['resources','资料'],['videos','视频'],['posters','海报']].map(([id,label])=>({id,label,content:id,section:'内容素材'})),
    ...[['forms','表单'],['surveys','调查问卷']].map(([id,label])=>({id,label,content:id,section:'表单与问卷'})),
    {id:'landingPages',label:'落地页',page:'landingPages',section:'页面与网站'},
    {id:'aggregations',label:'聚合页',content:'aggregations',section:'页面与网站'},
    {id:'website',label:'网站管理',section:'页面与网站',aliases:'网站中心 网站列表'},
    {id:'moduleManagement',label:'内容模块与模板',page:'moduleManagement',section:'页面与网站'},
    ...[['products','产品介绍'],['solutions','解决方案'],['cases','客户案例'],['customerWall','客户墙']].map(([id,label])=>({id,label,content:id,section:'产品与案例'})),
  ]},
  {id:'events',label:'活动管理',icon:'▣',items:[
    {id:'activities',label:'活动列表',page:'activities',aliases:'活动中心 报名 参会人员 签到 直播 邀请通知 活动数据分析'},
  ]},
  {id:'outreach',label:'营销触达',icon:'➤',items:[
    {id:'smsManagement',label:'短信营销',page:'smsManagement',aliases:'营销中心 短信管理 短信模板'},
    {id:'email',label:'邮件营销',aliases:'邮件'},
    {id:'wechat',label:'微信营销',aliases:'微信'},
    {id:'automation',label:'营销自动化',aliases:'自动化'},
    {id:'employee',label:'全员营销'},
  ]},
  {id:'leads',label:'线索管理',icon:'⇢',items:[
    {id:'leads',label:'线索列表',page:'leads',aliases:'线索中心 待分派 已分派 已同步'},
    {id:'leadSettings',label:'流转配置',page:'leadSettings',aliases:'线索设置 区域分派 CRM同步配置 线索接收配置 渠道映射 去重'},
  ]},
  {id:'system',label:'系统设置',icon:'⚙',items:[
    {id:'channels',label:'渠道管理',section:'渠道配置',aliases:'渠道分类 渠道设置'},
    {id:'organization',label:'组织管理',section:'组织与权限',aliases:'组织配置 组织账号'},
    {id:'settingsPermissions',label:'角色权限',page:'settingsPermissions',section:'组织与权限',aliases:'权限'},
  ]},
];
