# 开发规范

## 1. 代码规范

### 1.1 项目风格

- **语言**：JavaScript (ES6+)
- **模块化**：ES Module (`import/export`)
- **缩进**：2空格
- **引号**：单引号
- **分号**：不强制

### 1.2 文件命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 路由文件 | `模块名.js` | `wechat.js` |
| 服务文件 | `模块名.js` | `study.js` |
| 模型文件 | `模块名.js` | `user.js` |
| 工具文件 | `功能名.js` | `crypto.js` |
| Prompt文件 | `功能名.js` | `tutor.js` |

### 1.3 目录结构

```
src/
├── config/          # 配置（index.js）
├── server/          # 服务器入口（index.js）
├── routes/          # 路由（按模块分）
├── services/        # 业务逻辑（按模块分）
├── prompts/         # Prompt工程
├── models/          # 数据模型
├── utils/           # 工具函数
└── data/            # 本地数据/知识库
    └── subjects/    # 各科知识库
```

### 1.4 注释规范

**不添加无意义的注释**。代码本身应该足够清晰。

仅在以下情况添加注释：
- 业务逻辑复杂，需要解释"为什么这么做"
- 存在隐晦的边界条件或hack
- 正则表达式等难以理解的表达式

```javascript
// ✅ 正确：解释为什么这么做
// 使用毫秒级时间戳避免微信消息顺序问题
const msgTimestamp = parseInt(msg.CreateTime) * 1000;

// ❌ 错误：废话注释
// 获取用户ID
const userId = openid;
```

### 1.5 错误处理

```javascript
// ✅ 正确：使用async/await + try/catch
async function handleMessage(msg) {
  try {
    const result = await processMessage(msg);
    return result;
  } catch (error) {
    logger.error('处理消息失败', { error: error.message, msg });
    throw error;
  }
}

// ❌ 错误：吞掉错误
function handleMessage(msg) {
  processMessage(msg).catch(() => {});
}
```

---

## 2. Git规范

### 2.1 分支命名

| 类型 | 命名格式 | 示例 |
|------|----------|------|
| 功能分支 | `feature/功能名` | `feature/wrong-question` |
| 修复分支 | `fix/问题名` | `fix/login-bug` |
| 文档分支 | `docs/文档名` | `docs/api-doc` |

### 2.2 Commit规范

```
<类型>: <简短描述>

可选的详细说明
```

**类型**：
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具

**示例**：
```
feat: 添加错题本拍照识别功能

- 集成Tesseract.js OCR
- 支持印刷体识别
- 识别失败时提示重新拍照
```

---

## 3. API规范

### 3.1 微信消息回调

**验证接口**：`GET /wechat`
**消息接收**：`POST /wechat`

### 3.2 消息类型处理

| 消息类型 | 处理文件 | 描述 |
|----------|----------|------|
| 文本消息 | `services/text.js` | 处理用户输入 |
| 图片消息 | `services/image.js` | 处理拍照上传 |
| 事件推送 | `services/event.js` | 关注/取消关注等 |

### 3.3 响应格式

```javascript
// 微信消息响应（被动回复）
{
  ToUserName: '发送方',
  FromUserName: '接收方',
  CreateTime: Date.now(),
  MsgType: 'text',
  Content: '回复内容'
}
```

---

## 4. 数据模型

### 4.1 PostgreSQL表

| 表名 | 描述 |
|------|------|
| `users` | 用户信息 |
| `wrong_questions` | 错题记录 |
| `explanations` | 讲解记录 |
| `daily_plans` | 每日计划 |
| `study_records` | 学习记录 |
| `parent_child_relations` | 亲子绑定关系 |

### 4.2 ORM

使用 **Prisma** 作为ORM，类型安全且支持自动迁移。

### 4.3 字段命名

- 使用**蛇形命名**（数据库）：`user_openid`, `question_text`
- 使用**小驼峰**（TypeScript）：`userOpenid`, `questionText`
- 时间字段：`created_at`, `updated_at`

---

## 5. 项目结构

### 5.1 后端结构（server/）

```
server/
├── src/
│   ├── config/          # 配置
│   │   └── index.ts
│   ├── routes/          # 路由
│   │   ├── wechat.ts
│   │   └── api/
│   ├── services/        # 业务逻辑
│   │   ├── user.ts
│   │   ├── study.ts
│   │   └── ai.ts
│   ├── prisma/          # Prisma
│   │   └── schema.prisma
│   └── utils/           # 工具
│   └── index.ts         # 入口
├── package.json
└── tsconfig.json
```

### 5.2 前端结构（client/）

```
client/
├── src/
│   ├── pages/           # 页面
│   │   ├── index/
│   │   ├── question/
│   │   └── plan/
│   ├── components/     # 组件
│   ├── stores/          # 状态管理
│   └── app.ts
├── package.json
└── tsconfig.json
```

---

## 6. Prompt工程

### 6.1 文件组织

```
server/src/prompts/
├── tutor.ts         # 陪练讲解Prompt
├── emotional.ts     # 情绪支持Prompt
├── planner.ts       # 学习规划Prompt
└── parent.ts        # 家长端Prompt
```

### 6.2 Prompt设计原则

1. **角色设定**：明确AI扮演的角色身份（高中学习伙伴）
2. **约束条件**：说明回答的边界和限制
3. **输出格式**：规定回复的结构和格式
4. **情感基调**：匹配高中生群体的语言习惯

---

## 7. 环境配置

### 7.1 环境变量

```bash
# 微信公众号
WECHAT_APP_ID=
WECHAT_APP_SECRET=
WECHAT_TOKEN=
WECHAT_AES_KEY=

# AI服务
OPENAI_API_KEY=
OPENAI_BASE_URL=

# 数据库
DATABASE_URL=postgresql://user:password@localhost:5432/study_agent
REDIS_URL=redis://localhost:6379

# 服务
PORT=3000
NODE_ENV=development
```

### 7.2 敏感信息

**绝对禁止**：
- 提交到Git仓库
- 打印到日志
- 出现在错误信息中

---

## 8. 日志规范

```javascript
// 使用logger而不是console.log
import logger from './utils/logger.js';

logger.info('用户登录', { openid, platform });
logger.warn('请求频率过高', { openid, count });
logger.error('处理失败', { error: error.message, context });
```

---

## 8. 测试规范

### 8.1 测试文件位置

```
src/
├── services/
│   └── study.js
└── __tests__/
    └── study.test.js
```

### 8.2 测试命名

```javascript
describe('StudyService', () => {
  it('应该正确识别错题知识点', () => {});
  it('应该正确计算薄弱点', () => {});
});
```

---

## 10. AI编程规范

### 10.1 功能开发流程

**每次输入新功能时，必须遵循以下流程：**

```
┌─────────────────────────────────────────────────────┐
│                    开发流程                          │
├─────────────────────────────────────────────────────┤
│                                                      │
│  1️⃣ 规划阶段                                        │
│     ├── 分析需求，确定范围                           │
│     ├── 设计数据结构                                 │
│     └── 输出：更新的任务清单                         │
│                                                      │
│  2️⃣ 文档更新                                        │
│     ├── 更新PRD.md（如需）                          │
│     └── 更新代码注释（如需）                         │
│                                                      │
│  3️⃣ 代码实现                                        │
│     ├── 核心业务逻辑                                 │
│     ├── 错误处理                                     │
│     └── 日志记录                                     │
│                                                      │
│  4️⃣ 测试代码                                        │
│     ├── 编写单元测试                                 │
│     └── 覆盖边界条件                                 │
│                                                      │
│  5️⃣ 自测验证                                        │
│     ├── 运行测试确保通过                             │
│     └── 手动功能验证                                 │
│                                                      │
│  ✅ 全部通过才算完成                                 │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 10.2 流程详细说明

#### 第一步：规划

在开始写代码之前，必须先思考：
- 这个功能的核心是什么？
- 需要修改哪些文件？
- 是否有边界条件需要注意？
- 对现有代码是否有侵入性？

#### 第二步：更新文档

- 如果是新增功能，更新 `docs/PRD.md`
- 如果是接口变更，更新 `docs/DEVELOPMENT.md`
- 如果是Bug修复，在Commit中注明

#### 第三步：更新代码

- 按照代码规范编写
- 添加适当的错误处理
- 添加关键日志
- **不要破坏现有功能**

#### 第四步：更新测试代码

- 为新功能编写单元测试
- 测试文件放在 `src/__tests__/` 目录
- 测试命名：`模块名.test.js`

#### 第五步：自测验证

- 运行 `npm test` 确保测试通过
- 手动触发相关功能验证
- 检查日志输出是否正常

### 10.3 自测检查清单

```
功能开发完成后，必须确认：

□ 代码能正常运行，无语法错误
□ 测试用例全部通过
□ 边界条件已处理
□ 错误处理已添加
□ 日志记录正常
□ 不影响现有功能
□ 文档已更新（如需要）

全部确认后，功能才算完成。
```

---

## 11. 部署规范

### 11.1 生产环境检查

- [ ] 所有敏感配置使用环境变量
- [ ] 日志级别设置为 ERROR 或 WARN
- [ ] 开启压缩和缓存
- [ ] 配置健康检查接口

### 11.2 PM2进程管理

```bash
pm2 start src/server/index.js --name study-agent
pm2 logs study-agent
pm2 restart study-agent
```

---

*最后更新：2026-03-29*
