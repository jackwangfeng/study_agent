export default {
  pages: [
    'pages/index/index',
    'pages/report/index',
    'pages/settings/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#4CAF50',
    navigationBarTitleText: '智学伴家长端',
    navigationBarTextStyle: 'white',
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#4CAF50',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '孩子',
        iconPath: 'static/icons/children.png',
        selectedIconPath: 'static/icons/children.png',
      },
      {
        pagePath: 'pages/settings/index',
        text: '设置',
        iconPath: 'static/icons/settings.png',
        selectedIconPath: 'static/icons/settings.png',
      },
    ],
  },
};