# 学生端客户端

基于 Taro 3 + React + TypeScript 的跨平台应用（H5/小程序）

## 目录结构

```
client/
├── src/
│   ├── pages/         # 页面
│   │   ├── chat/      # 聊天页面
│   │   ├── index/     # 首页
│   │   ├── mine/      # 个人中心
│   │   ├── plan/      # 学习计划
│   │   └── questions/ # 错题本
│   ├── services/      # API 服务
│   ├── store/         # 状态管理
│   ├── styles/        # 样式
│   └── utils/         # 工具函数
├── config/            # 配置
├── package.json       # 依赖
└── tsconfig.json      # TypeScript 配置
```

## 启动开发

```bash
# 安装依赖
npm install

# 开发模式（H5）
npm run dev:h5

# 构建 H5
npm run build:h5

# 构建微信小程序
npm run build:weapp
```

## 主要功能

- 🏠 首页：学习概览、快捷功能
- 📚 错题本：拍照上传、AI 识别、引导式讲解
- 📅 学习计划：AI 生成、番茄钟、学习日报
- 💬 聊天：情绪支持、学习激励
- 👤 个人中心：用户信息、设置

## 技术栈

- Taro 3 + React + TypeScript
- Zustand 状态管理
- SCSS 样式
- Axios API 调用

## 环境变量

在 `config/index.ts` 中配置 API 地址：

```typescript
defineConstants: {
  'process.env.TARO_APP_API_URL': JSON.stringify('http://localhost:3000'),
}
```

## 构建产物

构建后文件输出到 `client/dist/` 目录。