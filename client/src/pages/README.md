# 页面目录

学生端的所有页面组件

## 目录结构

```
pages/
├── chat/      # 聊天页面
├── index/     # 首页
├── mine/      # 个人中心
├── plan/      # 学习计划
└── questions/ # 错题本
```

## 页面说明

### chat/ - 聊天页面
- **功能**：与 AI 聊天，情绪支持，学习激励
- **核心组件**：消息列表、输入框、快捷问题
- **关键 API**：`api.ai.chat()`

### index/ - 首页
- **功能**：学习概览，快捷功能入口
- **核心组件**：学习统计、快捷功能按钮、学习激励
- **关键 API**：`api.user.getInfo()`

### mine/ - 个人中心
- **功能**：用户信息，设置，家长绑定
- **核心组件**：用户信息展示、设置选项
- **关键 API**：`api.user.updateProfile()`

### plan/ - 学习计划
- **功能**：AI 生成学习计划，番茄钟，学习日报
- **核心组件**：计划列表、番茄钟计时器、完成按钮
- **关键 API**：`api.plan.generate()`, `api.plan.complete()`

### questions/ - 错题本
- **功能**：错题管理，拍照上传，AI 讲解
- **核心组件**：错题列表、拍照上传、题目详情
- **关键 API**：`api.question.upload()`, `api.question.explain()`

## 页面开发规范

1. 每个页面包含 `index.tsx` 和 `index.scss` 文件
2. 使用 Taro 组件库
3. 状态管理使用 Zustand
4. 样式使用 SCSS
5. API 调用通过 `services/api.ts`

## 路由配置

在 `app.config.ts` 中配置页面路由：

```typescript
pages: [
  'pages/index/index',
  'pages/questions/index',
  'pages/plan/index',
  'pages/chat/index',
  'pages/mine/index',
]
```