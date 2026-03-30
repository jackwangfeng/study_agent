# 家长端客户端

基于 Taro 3 + React + TypeScript 的跨平台应用（H5/小程序）

## 目录结构

```
client-parent/
├── src/
│   ├── pages/         # 页面
│   │   ├── index/     # 孩子列表
│   │   ├── report/    # 学习报告
│   │   └── settings/  # 设置
│   ├── services/      # API 服务
│   ├── styles/        # 样式
│   └── static/        # 静态资源
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

- 👨‍👩‍👧 孩子列表：查看已绑定的孩子
- 📊 学习报告：查看孩子的学习数据和分析
- ⚙️ 设置：通知设置、退出登录

## 技术栈

- Taro 3 + React + TypeScript
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

构建后文件输出到 `client-parent/dist/` 目录。