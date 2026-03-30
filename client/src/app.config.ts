export default {
  pages: [
    'pages/index/index',
    'pages/questions/index',
    'pages/plan/index',
    'pages/chat/index',
    'pages/mine/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#667eea',
    navigationBarTitleText: '智学伴',
    navigationBarTextStyle: 'white',
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#667eea',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'static/icons/home.png',
        selectedIconPath: 'static/icons/home.png',
      },
      {
        pagePath: 'pages/questions/index',
        text: '错题本',
        iconPath: 'static/icons/questions.png',
        selectedIconPath: 'static/icons/questions.png',
      },
      {
        pagePath: 'pages/plan/index',
        text: '计划',
        iconPath: 'static/icons/plan.png',
        selectedIconPath: 'static/icons/plan.png',
      },
      {
        pagePath: 'pages/chat/index',
        text: '聊聊',
        iconPath: 'static/icons/chat.png',
        selectedIconPath: 'static/icons/chat.png',
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的',
        iconPath: 'static/icons/mine.png',
        selectedIconPath: 'static/icons/mine.png',
      },
    ],
  },
};