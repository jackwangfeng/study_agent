# 技术架构文档

## 1. 系统架构总览

### 1.1 架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           微信客户端                                    │
│                    (WeChat Official Account)                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Taro 3 + React + TypeScript                         │
│                         H5/小程序前端                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Express + TypeScript 后端服务                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        Express Web Server                        │   │
│  │   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │   │
│  │   │   路由层     │  │   中间件层   │  │    业务逻辑层        │ │   │
│  │   │  routes/    │  │ 鉴权/日志    │  │   services/         │ │   │
│  │   └──────────────┘  └──────────────┘  └──────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │  用户服务    │  │  错题服务    │  │  计划服务    │  │ AI服务    │  │
│  │ user.ts     │  │ study.ts     │  │ planner.ts   │  │ ai.ts     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └───────────┘  │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ 情绪服务    │  │ 家长服务    │  │ 会员服务    │  │ 消息服务  │  │
│  │ emotional.ts│  │ parent.ts   │  │ member.ts   │  │ message.ts│  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └───────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   PostgreSQL     │  │      Redis       │  │   OpenAI API     │
│     (主数据库)   │  │    (缓存/会话)   │  │    (AI能力)      │
└──────────────────┘  └──────────────────┘  └──────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   文件存储       │  │   微信API        │  │   定时任务       │
│ (七牛云/腾讯COS) │  │  (消息推送)      │  │   (学习提醒)     │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### 1.2 技术栈清单

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| **前端** | Taro 3 + React + TypeScript | 跨平台（H5/小程序） |
| **后端** | Express + TypeScript | Node.js 18+ |
| **数据库** | PostgreSQL 15+ | 关系型数据库 |
| **ORM** | Prisma / TypeORM | 类型安全的数据库操作 |
| **缓存** | Redis 7.x | 会话、队列、限流 |
| **AI** | OpenAI GPT-3.5/GPT-4 | 对话、OCR理解 |
| **微信** | 微信公众号API | 消息收发、模板推送 |
| **文件存储** | 腾讯云COS | 错题图片存储 |
| **OCR** | Tesseract.js / 腾讯云OCR | 印刷体识别 |
| **进程管理** | PM2 | 生产环境进程管理 |

---

## 2. 模块设计

### 2.1 模块依赖关系

```
                    ┌─────────────────┐
                    │   routes/      │
                    │   (路由入口)    │
                    └────────┬────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        services/                                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │  user   │ │  study  │ │ planner │ │emotional│ │ parent  │  │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘  │
│       │            │            │            │            │        │
│       └────────────┴────────────┴─────┬──────┴────────────┘        │
│                                        │                          │
│                                        ▼                          │
│                               ┌─────────────────┐                │
│                               │      ai.js      │                │
│                               │   (AI服务中台)   │                │
│                               └────────┬────────┘                │
└─────────────────────────────────────────┼─────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                         models/                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐             │
│  │  User    │ │ Question│ │  Plan   │ │ Record  │             │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 核心模块说明

#### 2.2.1 用户服务 (user.js)

**职责**：用户注册、登录、角色管理

**核心方法**：
```javascript
class UserService {
  async getOrCreateUser(openid)     // 获取或创建用户
  async updateUserProfile(openid, profile)  // 更新用户信息
  async getUserByOpenid(openid)     // 根据openid获取用户
  async bindParent(childOpenid, parentOpenid)  // 绑定家长
}
```

#### 2.2.2 错题服务 (study.js)

**职责**：错题拍照、OCR识别、引导式讲解、薄弱点追踪

**核心方法**：
```javascript
class StudyService {
  async processImageQuestion(openid, imageUrl)  // 处理图片
  async recognizeQuestion(imageBuffer)          // OCR识别
  async explainQuestion(question, doubt)         // 引导式讲解
  async saveWrongQuestion(openid, question)     // 保存错题
  async getWeakPoints(openid)                   // 获取薄弱点
  async reviewQuestion(openid, questionId)      // 错题复习
}
```

#### 2.2.3 学习规划服务 (planner.js)

**职责**：AI生成学习计划、番茄钟、每日日报

**核心方法**：
```javascript
class PlannerService {
  async generateDailyPlan(openid)              // 生成每日计划
  async startTomatoClock(openid)                // 开始番茄钟
  async completeTomatoClock(openid)             // 完成番茄钟
  async generateDailySummary(openid)            // 生成学习日报
  async getTodayProgress(openid)                // 获取今日进度
}
```

#### 2.2.4 情绪服务 (emotional.js)

**职责**：情绪识别、考后疏导、学习激励

**核心方法**：
```javascript
class EmotionalService {
  async detectEmotion(text)                     // 情绪识别
  async provideSupport(openid, emotion)         // 情绪支持
  async examPostmortem(openid, examResult)     // 考后复盘
  async motivate(openid)                        // 学习激励
}
```

#### 2.2.5 家长服务 (parent.js)

**职责**：亲子绑定、学习报告推送、异常提醒

**核心方法**：
```javascript
class ParentService {
  async bindChild(parentOpenid, childCode)      // 绑定孩子
  async generateWeeklyReport(childOpenid)       // 生成周报
  async checkAbnormal(childOpenid)              // 检查异常
  async sendWeeklyReport(parentOpenid, report)  // 推送周报
}
```

#### 2.2.6 AI服务 (ai.js)

**职责**：AI能力中台、Prompt管理、对话路由

**核心方法**：
```javascript
class AIService {
  async chat(openid, message, context)         // 对话
  async chatWithPrompt(prompt, systemPrompt)    // 自定义Prompt对话
  async generateLearningPlan(userProfile)       // 生成学习计划
  async extractKnowledgePoint(question)         // 提取知识点
}
```

---

## 3. 数据流设计

### 3.1 消息处理流程

```
微信服务器                              我们的服务器
     │                                      │
     │  ──── 用户发送消息 ────►            │
     │                                      │
     │                           ┌──────────────────┐
     │                           │  消息接收        │
     │                           │  (xml-bodyparser)│
     │                           └────────┬─────────┘
     │                                      │
     │                           ┌─────────▼─────────┐
     │                           │  消息类型路由     │
     │                           │  text/image/event │
     │                           └─────────┬─────────┘
     │                                      │
     │         ┌────────────────────────────┼────────────────────────┐
     │         │                            │                        │
     │         ▼                            ▼                        ▼
     │  ┌─────────────┐            ┌─────────────┐          ┌─────────────┐
     │  │  文本处理   │            │  图片处理   │          │  事件处理   │
     │  │ text.js    │            │ image.js    │          │ event.js   │
     │  └──────┬──────┘            └──────┬──────┘          └──────┬──────┘
     │         │                           │                        │
     │         └───────────────────────────┼────────────────────────┘
     │                                     │
     │                           ┌─────────▼─────────┐
     │                           │  AI服务路由        │
     │                           │  (判断意图/情绪)   │
     │                           └─────────┬─────────┘
     │                                     │
     │         ┌───────────────────────────┼────────────────────────┐
     │         │                           │                        │
     │         ▼                           ▼                        ▼
     │  ┌─────────────┐            ┌─────────────┐          ┌─────────────┐
     │  │  错题服务   │            │ 情绪服务    │          │ 规划服务    │
     │  └──────┬──────┘            └──────┬──────┘          └──────┬──────┘
     │         │                           │                        │
     │         └───────────────────────────┼────────────────────────┘
     │                                     │
     │                           ┌─────────▼─────────┐
     │                           │  回复组装         │
     │                           │  (消息XML生成)    │
     │                           └─────────┬─────────┘
     │                                     │
     │  ◄────── 回复消息 ──────           │
     │                                      │
```

### 3.2 错题学习流程

```
用户发送图片                    AI服务                       数据层
     │                           │                            │
     │  ┌─── 图片消息 ───►      │                            │
     │                           │                            │
     │                    ┌──────▼──────┐                    │
     │                    │ OCR识别     │                    │
     │                    │ (Tesseract) │                    │
     │                    └──────┬──────┘                    │
     │                           │                            │
     │                           │  题目文字                   │
     │                           ▼                            │
     │                    ┌────────────────┐                    │
     │                    │ 提取知识点    │                    │
     │                    │ (GPT分析)     │                    │
     │                    └───────┬──────┘                    │
     │                            │                           │
     │  ◄── "这道题考的XXX" ────  │                           │
     │                           │                            │
     │  ┌─── "我不懂这里" ───►   │                            │
     │                           │                            │
     │                    ┌──────▼──────┐                    │
     │                    │ 引导式讲解  │                    │
     │                    │ (Prompt)    │                    │
     │                    └──────┬──────┘                    │
     │                           │                            │
     │  ◄── 引导性问题 ────────  │                           │
     │                           │                            │
     │  ┌─── 用户回答 ────►      │                            │
     │                           │                            │
     │                    ┌──────▼──────┐                    │
     │                    │ 继续引导    │                    │
     │                    │ 或结束讲解  │                    │
     │                    └──────┬──────┘                    │
     │                           │                            │
     │  ◄── "下次遇到同类题" ── │                           │
     │                           │                            │
     │                    ┌──────▼──────┐                    │
     │                    │ 保存错题   │                    │
     │                    │ (MongoDB)  │                    │
     │                    └────────────┘                    │
```

---

## 4. API设计

### 4.1 微信公众号回调接口

#### 验证接口（GET）

```
GET /wechat?signature=xxx&timestamp=xxx&nonce=xxx&echostr=xxx
```

**响应**：直接返回 `echostr` 字符串

#### 消息接收接口（POST）

```
POST /wechat
Content-Type: application/xml
```

**处理消息类型**：
- 文本消息 (`text`)
- 图片消息 (`image`)
- 事件推送 (`event`)

### 4.2 内部REST API（可选，用于管理后台）

#### 用户管理

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/users/:openid` | 获取用户信息 |
| PUT | `/api/users/:openid` | 更新用户信息 |
| POST | `/api/users/:openid/bind-parent` | 绑定家长 |

#### 错题管理

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/questions` | 获取错题列表 |
| GET | `/api/questions/:id` | 获取错题详情 |
| GET | `/api/weak-points` | 获取薄弱点统计 |
| POST | `/api/questions/:id/review` | 标记已复习 |

#### 学习计划

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/plans/today` | 获取今日计划 |
| POST | `/api/plans/generate` | 生成新计划 |
| PUT | `/api/plans/:id/complete` | 完成计划项 |

### 4.3 消息格式

#### 被动回复消息

```xml
<xml>
  <ToUserName><![CDATA[发送方]]></ToUserName>
  <FromUserName><![CDATA[接收方]]></FromUserName>
  <CreateTime>1234567890</CreateTime>
  <MsgType><![CDATA[text]]></MsgType>
  <Content><![CDATA[回复内容]]></Content>
</xml>
```

#### 模板推送消息

```xml
<xml>
  <ToUserName><![CDATA[用户的openid]]></ToUserName>
  <TemplateId><![CDATA[模板ID]]></TemplateId>
  <Url><![CDATA[点击查看链接]]></Url>
  <Data>
    <First>
      <Value><![CDATA[您有一份学习周报]]></Value>
    </First>
    <Keyword1>
      <Value><![CDATA[本周学习时长]]></Value>
    </Keyword1>
    <Keyword2>
      <Value><![CDATA[完成任务数]]></Value>
    </Keyword2>
    <Remark>
      <Value><![CDATA[点击查看详情]]></Value>
    </Remark>
  </Data>
</xml>
```

---

## 5. 数据模型

### 5.1 用户表 (users)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  openid VARCHAR(64) UNIQUE NOT NULL,        -- 微信唯一标识
  user_type VARCHAR(20) DEFAULT 'student',   -- student/parent
  nickname VARCHAR(100),
  avatar VARCHAR(500),
  grade INTEGER,                              -- 1-3（学生）
  subjects TEXT[],                           -- 选择的科目数组（学生）
  exam_date DATE,                            -- 期末考试日期（学生）
  membership_level VARCHAR(20) DEFAULT 'free',
  membership_expire_at TIMESTAMP,
  parent_openid VARCHAR(64),                 -- 绑定的家长openid（学生）
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_openid ON users(openid);
CREATE INDEX idx_users_parent_openid ON users(parent_openid);
```

### 5.2 错题表 (wrong_questions)

```sql
CREATE TABLE wrong_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  openid VARCHAR(64) NOT NULL REFERENCES users(id),
  question_image VARCHAR(500),               -- 错题图片URL
  question_text TEXT,                        -- OCR识别后的题目
  subject VARCHAR(50),                       -- 科目
  knowledge_point VARCHAR(100),              -- 知识点
  wrong_count INTEGER DEFAULT 1,             -- 错误次数
  correct_count INTEGER DEFAULT 0,           -- 订正后正确次数
  status VARCHAR(20) DEFAULT 'unmastered',  -- unmastered/learning/mastered
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wrong_questions_openid ON wrong_questions(openid);
CREATE INDEX idx_wrong_questions_subject ON wrong_questions(subject);
CREATE INDEX idx_wrong_questions_status ON wrong_questions(status);
```

### 5.3 讲解记录表 (explanations)

```sql
CREATE TABLE explanations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES wrong_questions(id),
  doubt TEXT,                                -- 学生的疑惑点
  explanation TEXT,                           -- AI讲解内容
  is_understood BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5.4 学习计划表 (daily_plans)

```sql
CREATE TABLE daily_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  openid VARCHAR(64) NOT NULL REFERENCES users(id),
  plan_date DATE NOT NULL,
  items JSONB,                               -- 计划项目列表
  tomato_count INTEGER DEFAULT 0,            -- 完成番茄钟数
  total_minutes INTEGER DEFAULT 0,           -- 总学习时长
  summary TEXT,                              -- 学习日报内容
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(openid, plan_date)
);

CREATE INDEX idx_daily_plans_openid ON daily_plans(openid);
CREATE INDEX idx_daily_plans_date ON daily_plans(plan_date);
```

### 5.5 学习记录表 (study_records)

```sql
CREATE TABLE study_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  openid VARCHAR(64) NOT NULL REFERENCES users(id),
  record_date DATE NOT NULL,
  records JSONB,                             -- 学习记录数组
  emotion_status VARCHAR(20),                -- positive/neutral/negative
  emotion_note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(openid, record_date)
);

CREATE INDEX idx_study_records_openid ON study_records(openid);
```

### 5.6 亲子关系表 (parent_child_relations)

```sql
CREATE TABLE parent_child_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_openid VARCHAR(64) NOT NULL REFERENCES users(id),
  child_openid VARCHAR(64) NOT NULL REFERENCES users(id),
  relation VARCHAR(20),                       -- father/mother/guardian
  bind_code VARCHAR(6),                      -- 绑定邀请码
  bind_code_expire_at TIMESTAMP,
  notify_enabled BOOLEAN DEFAULT true,
  weekly_report_day INTEGER DEFAULT 6,       -- 0-6，默认为6（周六）
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(parent_openid, child_openid)
);

CREATE INDEX idx_parent_child_parent ON parent_child_relations(parent_openid);
CREATE INDEX idx_parent_child_child ON parent_child_relations(child_openid);
CREATE INDEX idx_parent_child_bind_code ON parent_child_relations(bind_code);
```

### 5.7 对话历史表 (chat_histories)

```sql
CREATE TABLE chat_histories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  openid VARCHAR(64) NOT NULL REFERENCES users(id),
  session_date DATE NOT NULL,                -- 对话日期（用于聚合查询）
  summary TEXT,                              -- AI生成的对话摘要
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(openid, session_date)
);

CREATE INDEX idx_chat_histories_openid ON chat_histories(openid);
CREATE INDEX idx_chat_histories_date ON chat_histories(session_date);
```

### 5.8 对话消息表 (chat_messages)

```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  openid VARCHAR(64) NOT NULL REFERENCES users(id),
  history_id UUID REFERENCES chat_histories(id),
  role VARCHAR(20) NOT NULL,                 -- user/assistant/system
  content TEXT NOT NULL,                      -- 消息内容
  message_type VARCHAR(20) DEFAULT 'general', -- general/emotional/plan
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_messages_openid ON chat_messages(openid);
CREATE INDEX idx_chat_messages_history ON chat_messages(history_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at);
```

---

## 6. 第三方服务集成

### 6.1 微信公众号

**接入地址**：`https://api.weixin.qq.com/`

**主要接口**：
| 接口 | 用途 |
|------|------|
| `GET /cgi-bin/token` | 获取access_token |
| `POST /cgi-bin/message/template/send` | 发送模板消息 |
| `POST /cgi-bin/media/upload` | 上传临时素材 |
| `GET /cgi-bin/user/info` | 获取用户信息 |

**access_token刷新策略**：
- 有效期2小时
- 提前5分钟刷新
- 存储在Redis中

### 6.2 OpenAI API

**接入地址**：配置在 `OPENAI_BASE_URL`

**调用方式**：
```javascript
// 流式对话
const stream = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ],
  stream: true
});
```

### 6.3 文件存储（腾讯云COS）

**用途**：存储用户上传的错题图片

**流程**：
1. 用户上传图片到微信服务器
2. 微信返回 `media_id`
3. 我们调用微信接口下载图片
4. 上传到COS，获取永久URL
5. 存储URL到MongoDB

---

## 7. 定时任务设计

### 7.1 任务列表

| 任务 | 周期 | 描述 |
|------|------|------|
| 刷新Token | 2小时 | 刷新微信access_token |
| 重置每日配额 | 每天0点 | 重置用户每日错题次数 |
| 错题复习提醒 | 每天20:00 | 提醒需要复习错题的用户 |
| 生成周报 | 每周六9:00 | 生成并推送学习周报 |
| 检查异常 | 每天21:00 | 检查连续未学习用户 |

### 7.2 任务调度

使用 `node-cron` 或 Redis的定时任务功能：

```javascript
import cron from 'node-cron';

// 每天0点重置配额
cron.schedule('0 0 * * *', async () => {
  await resetDailyQuestionCounts();
});

// 每天20点错题复习提醒
cron.schedule('0 20 * * *', async () => {
  await sendReviewReminders();
});
```

---

## 8. 安全设计

### 8.1 微信消息验证

```javascript
function verifySignature(token, timestamp, nonce, signature) {
  const arr = [token, timestamp, nonce].sort();
  const str = arr.join('');
  const hash = crypto.createHash('sha1').update(str).digest('hex');
  return hash === signature;
}
```

### 8.2 请求限流

使用Redis实现滑动窗口限流：

```javascript
const RATE_LIMIT = {
  message: { max: 60, window: 60 },     // 60条消息/分钟
  question: { max: 10, window: 60 },     // 10道题/分钟
  ai: { max: 30, window: 60 }           // 30次AI调用/分钟
};
```

### 8.3 敏感信息处理

- 用户openid不直接暴露在日志中
- 使用脱敏处理：`openid.substring(0, 8) + '***'`
- 数据库连接字符串存储在环境变量中

---

## 9. 部署架构

### 9.1 开发环境

```
┌─────────────────┐
│   本地开发机    │
│  localhost:3000 │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│   MongoDB       │
│   localhost:27017│
└─────────────────┘
        │
        ▼
┌─────────────────┐
│   Redis         │
│   localhost:6379│
└─────────────────┘
```

### 9.2 生产环境

```
                            ┌─────────────────┐
                            │   Nginx         │
                            │  (反向代理/HTTPS)│
                            └────────┬────────┘
                                     │
                                     ▼
┌─────────────────┐         ┌─────────────────┐
│   微信服务器    │────────►│   Node.js       │
│   公众号后台    │         │   (PM2集群)     │
└─────────────────┘         └────────┬────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
           ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
           │  MongoDB    │   │   Redis     │   │  腾讯云COS  │
           │  (主从/副本) │   │  (集群)     │   │  (文件存储) │
           └─────────────┘   └─────────────┘   └─────────────┘
```

---

## 10. 监控与日志

### 10.1 日志分级

| 级别 | 用途 | 触发场景 |
|------|------|----------|
| ERROR | 系统错误 | 数据库连接失败、API调用失败 |
| WARN | 警告 | 请求限流、异常操作 |
| INFO | 一般信息 | 用户登录、关键操作完成 |
| DEBUG | 调试信息 | 开发环境详细日志 |

### 10.2 关键指标

- 请求响应时间
- API调用成功率
- 用户活跃度（日活/月活）
- 消息处理延迟
- AI调用耗时

---

*最后更新：2026-03-29*
