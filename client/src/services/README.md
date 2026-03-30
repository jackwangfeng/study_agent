# API 服务目录

客户端 API 调用服务

## 目录结构

```
services/
└── api.ts  # API 调用服务
```

## 核心功能

`api.ts` 提供以下功能：

1. **API 基础配置**
   - 基础 URL 配置
   - 请求头设置
   - 错误处理

2. **用户相关**
   - `api.user.getInfo()` - 获取用户信息
   - `api.user.updateProfile()` - 更新用户信息

3. **错题相关**
   - `api.question.upload()` - 上传错题
   - `api.question.getList()` - 获取错题列表
   - `api.question.explain()` - 讲解错题

4. **学习计划相关**
   - `api.plan.getToday()` - 获取今日计划
   - `api.plan.generate()` - 生成学习计划
   - `api.plan.complete()` - 完成计划项
   - `api.plan.startTomato()` - 开始番茄钟
   - `api.plan.completeTomato()` - 完成番茄钟

5. **AI 相关**
   - `api.ai.chat()` - 聊天
   - `api.ai.explain()` - 讲解题目

6. **家长相关**
   - `api.parent.bind()` - 绑定家长

## 使用示例

```typescript
// 导入 API
import { api } from './services/api';

// 调用 API
async function getTodayPlan() {
  try {
    const result = await api.plan.getToday();
    console.log('今日计划:', result.data);
  } catch (error) {
    console.error('获取计划失败:', error);
  }
}
```

## 错误处理

所有 API 调用都返回标准格式：

```typescript
interface ApiResponse<T = any> {
  code: number;
  message?: string;
  data?: T;
}
```

- `code: 200` - 成功
- `code: 401` - 未授权
- `code: 500` - 服务器错误

## 环境配置

API 基础 URL 配置在 `config/index.ts` 中：

```typescript
defineConstants: {
  'process.env.TARO_APP_API_URL': JSON.stringify('http://localhost:3000'),
}
```