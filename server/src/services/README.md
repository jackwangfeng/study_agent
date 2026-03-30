# 业务逻辑服务目录

后端核心业务逻辑服务

## 目录结构

```
services/
├── ai.ts              # AI 服务
├── chatHistory.ts     # 聊天历史服务
├── emotional.ts       # 情绪服务
├── member.ts          # 会员服务
├── parent.ts          # 家长服务
├── planner.ts         # 学习规划服务
├── study.ts           # 学习服务
└── user.ts            # 用户服务
```

## 服务说明

### ai.ts - AI 服务
- **功能**：AI 聊天、题目讲解、知识点提取
- **核心方法**：
  - `chatWithHistory()` - 带历史的聊天
  - `explainQuestion()` - 讲解题目
  - `extractKnowledgePoint()` - 提取知识点
- **集成**：Google Gemini、OpenAI

### chatHistory.ts - 聊天历史服务
- **功能**：聊天历史存储、摘要压缩
- **核心方法**：
  - `addMessage()` - 添加消息
  - `compressHistory()` - 压缩历史
  - `getHistorySummary()` - 获取历史摘要

### emotional.ts - 情绪服务
- **功能**：情绪识别、情绪支持
- **核心方法**：
  - `detectEmotion()` - 情绪识别
  - `provideSupport()` - 情绪支持

### member.ts - 会员服务
- **功能**：会员管理、权益控制
- **核心方法**：
  - `getMembershipInfo()` - 获取会员信息
  - `checkMembership()` - 检查会员权益

### parent.ts - 家长服务
- **功能**：亲子绑定、学习报告
- **核心方法**：
  - `bindChild()` - 绑定孩子
  - `generateWeeklyReport()` - 生成周报
  - `checkAbnormal()` - 检查异常

### planner.ts - 学习规划服务
- **功能**：学习计划生成、番茄钟
- **核心方法**：
  - `generateTodayPlan()` - 生成今日计划
  - `startTomatoClock()` - 开始番茄钟
  - `generateDailySummary()` - 生成学习日报

### study.ts - 学习服务
- **功能**：错题管理、知识点分析
- **核心方法**：
  - `processImageQuestion()` - 处理图片题目
  - `getWeakPoints()` - 获取薄弱点
  - `saveWrongQuestion()` - 保存错题

### user.ts - 用户服务
- **功能**：用户管理、微信登录
- **核心方法**：
  - `getOrCreateUser()` - 获取或创建用户
  - `getUserByOpenid()` - 根据 openid 获取用户
  - `bindParent()` - 绑定家长

## 服务调用关系

```
┌──────────────┐
│   routes/    │
└────────┬─────┘
         │
         ▼
┌─────────────────────────┐
│     services/           │
├─────────┬─────────┬─────┤
│         │         │
▼         ▼         ▼
user    study    planner
         │         │
         └────┬────┘
              ▼
             ai.ts
```

## 数据存储

所有服务通过 Prisma ORM 操作数据库，主要模型：
- `User` - 用户信息
- `WrongQuestion` - 错题
- `DailyPlan` - 学习计划
- `StudyRecord` - 学习记录
- `ParentChildRelation` - 亲子关系
- `ChatHistory` - 聊天历史
- `ChatMessage` - 聊天消息

## 错误处理

所有服务方法都采用 try-catch 处理错误，并通过 logger 记录日志：

```typescript
try {
  // 业务逻辑
} catch (error) {
  logger.error('Service error', { error });
  throw error;
}
```