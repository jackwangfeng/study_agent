# 状态管理目录

客户端状态管理

## 目录结构

```
store/
└── index.ts  # Zustand 状态管理
```

## 核心功能

`index.ts` 使用 Zustand 实现状态管理，包含以下状态：

### 用户状态
- `user` - 用户信息
- `isLoggedIn` - 是否登录
- `fetchUser()` - 获取用户信息
- `updateUser()` - 更新用户信息

### 错题状态
- `wrongQuestions` - 错题列表
- `fetchWrongQuestions()` - 获取错题列表
- `addWrongQuestion()` - 添加错题
- `markQuestionMastered()` - 标记已掌握

### 学习计划状态
- `todayPlan` - 今日计划
- `fetchTodayPlan()` - 获取今日计划
- `generatePlan()` - 生成学习计划
- `completePlanItem()` - 完成计划项
- `startTomato()` - 开始番茄钟
- `completeTomato()` - 完成番茄钟

### 聊天状态
- `chatHistory` - 聊天历史
- `sendChatMessage()` - 发送聊天消息
- `clearChatHistory()` - 清除聊天历史

### 通用状态
- `loading` - 加载状态
- `error` - 错误信息

## 使用示例

```typescript
// 导入 store
import { useStore } from './store';

// 使用状态
function ChatPage() {
  const { chatHistory, sendChatMessage, loading } = useStore();

  async function handleSend(message) {
    await sendChatMessage(message, 'emotional');
  }

  return (
    <div>
      {chatHistory.map(msg => (
        <div key={msg.id}>
          {msg.role}: {msg.content}
        </div>
      ))}
      <button onClick={() => handleSend('Hello')}>
        {loading ? '发送中...' : '发送'}
      </button>
    </div>
  );
}
```

## 状态管理规范

1. **单一数据源** - 所有状态集中管理
2. **不可变更新** - 使用 Zustand 的 set 方法更新状态
3. **异步操作** - 使用 async/await 处理 API 调用
4. **错误处理** - 捕获并处理 API 错误
5. **缓存策略** - 合理使用缓存减少 API 调用

## 性能优化

- 使用 `shallow` 比较避免不必要的重渲染
- 使用 `persist` 持久化重要状态
- 合理使用 `subscribe` 监听状态变化