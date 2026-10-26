(() => {
  'use strict';

  // Image presets reference the original attachments without resizing or recompression.
  const items = Object.freeze([
    {id: 'festival', label: '红金盛典', description: '红金渐层与柔光，适合年会、颁奖与现场互动。', tone: 'dark'},
    {id: 'midnight', label: '深蓝星光', description: '深蓝舞台与金色细节，适合企业峰会与品牌活动。', tone: 'dark'},
    {id: 'neon', label: '霓虹律动', description: '紫蓝夜色与霓虹光线，营造活跃的现场氛围。', image: './assets/lottery/themes/neon.jpg', tone: 'dark'},
    {id: 'ice', label: '冰蓝会场', description: '通透冰蓝与开阔空间，适合会议与科技主题活动。', image: './assets/lottery/themes/ice.png', tone: 'light'},
    {id: 'celebration', label: '红色庆典', description: '鲜明红色与光带点阵，适合庆典与答谢活动。', image: './assets/lottery/themes/celebration.png', tone: 'dark'},
    {id: 'dawn', label: '曙光会场', description: '浅暖晨光与延展光线，适合启动会与年度聚会。', image: './assets/lottery/themes/dawn.png', tone: 'light'}
  ].map(Object.freeze));

  const get = id => items.find(item => item.id === id) || items[0];
  window.MKLotteryThemes = Object.freeze({items, get});
})();
