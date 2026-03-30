# 数据库模型目录

Prisma ORM 数据库模型定义

## 目录结构

```
prisma/
├── migrations/        # 数据库迁移文件
├── index.ts           # Prisma 客户端实例
└── schema.prisma      # 数据库模型定义
```

## 核心功能

### schema.prisma - 数据库模型定义

定义了以下数据模型：

1. **User** - 用户信息
   - `id` - 主键
   - `openid` - 微信唯一标识
   - `userType` - 用户类型（student/parent）
   - `nickname` - 昵称
   - `avatar` - 头像
   - `grade` - 年级
   - `subjects` - 科目数组
   - `examDate` - 考试日期
   - `membershipLevel` - 会员等级
   - `parentOpenid` - 绑定的家长 openid

2. **WrongQuestion** - 错题
   - `id` - 主键
   - `openid` - 用户 openid
   - `questionImage` - 题目图片
   - `questionText` - 题目文本
   - `subject` - 科目
   - `knowledgePoint` - 知识点
   - `wrongCount` - 错误次数
   - `correctCount` - 正确次数
   - `status` - 状态（unmastered/learning/mastered）

3. **DailyPlan** - 学习计划
   - `id` - 主键
   - `openid` - 用户 openid
   - `planDate` - 计划日期
   - `items` - 计划项目（JSON）
   - `tomatoCount` - 番茄钟数量
   - `totalMinutes` - 总学习时长
   - `summary` - 学习日报

4. **StudyRecord** - 学习记录
   - `id` - 主键
   - `openid` - 用户 openid
   - `recordDate` - 记录日期
   - `records` - 学习记录（JSON）
   - `emotionStatus` - 情绪状态
   - `emotionNote` - 情绪备注

5. **ParentChildRelation** - 亲子关系
   - `id` - 主键
   - `parentOpenid` - 家长 openid
   - `childOpenid` - 孩子 openid
   - `relation` - 关系（father/mother/guardian）
   - `bindCode` - 绑定码
   - `bindCodeExpireAt` - 绑定码过期时间
   - `notifyEnabled` - 是否开启通知
   - `weeklyReportDay` - 周报发送日

6. **ChatHistory** - 聊天历史
   - `id` - 主键
   - `openid` - 用户 openid
   - `sessionDate` - 会话日期
   - `summary` - 对话摘要

7. **ChatMessage** - 聊天消息
   - `id` - 主键
   - `openid` - 用户 openid
   - `historyId` - 聊天历史 ID
   - `role` - 角色（user/assistant/system）
   - `content` - 消息内容
   - `messageType` - 消息类型

## 数据库迁移

### 生成迁移

```bash
# 生成迁移文件
npx prisma migrate dev

# 应用迁移到数据库
npx prisma db push

# 查看数据库状态
npx prisma db pull
```

### 重置数据库

```bash
# 重置数据库（会删除所有数据）
npx prisma db push --force-reset
```

## Prisma 客户端

在 `index.ts` 中创建 Prisma 客户端实例：

```typescript
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

export default prisma;
```

## 使用示例

```typescript
import { prisma } from './prisma';

// 查询用户
const user = await prisma.user.findUnique({
  where: { openid: 'user_openid' },
});

// 创建错题
const wrongQuestion = await prisma.wrongQuestion.create({
  data: {
    openid: 'user_openid',
    questionText: '题目内容',
    subject: '数学',
    knowledgePoint: '三角函数',
  },
});

// 更新计划
const updatedPlan = await prisma.dailyPlan.update({
  where: {
    openid_planDate: {
      openid: 'user_openid',
      planDate: new Date(),
    },
  },
  data: {
    tomatoCount: {
      increment: 1,
    },
  },
});
```

## 数据库连接

数据库连接配置在 `.env` 文件中：

```
DATABASE_URL="postgresql://username:password@localhost:5432/study_agent"
```