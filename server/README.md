# 后端服务

基于 Express + TypeScript 的后端服务

## 目录结构

```
server/
├── src/
│   ├── config/        # 配置
│   ├── routes/        # 路由
│   │   ├── api/       # REST API
│   │   └── wechat.ts  # 微信公众号接口
│   ├── services/      # 业务逻辑
│   │   ├── ai.ts      # AI 服务
│   │   ├── user.ts    # 用户服务
│   │   ├── study.ts   # 学习服务
│   │   ├── planner.ts # 学习规划服务
│   │   └── parent.ts  # 家长服务
│   ├── prisma/        # Prisma ORM
│   │   └── schema.prisma # 数据库模型
│   ├── prompts/       # AI 提示词
│   └── utils/         # 工具函数
├── scripts/           # 脚本
├── start.sh           # 启动脚本
├── stop.sh            # 停止脚本
├── package.json       # 依赖
└── tsconfig.json      # TypeScript 配置
```

## 启动开发

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入数据库配置

# 数据库迁移
npx prisma db push

# 启动开发模式
npm run dev

# 生产启动
./start.sh

# 停止服务
./stop.sh
```

## 主要功能

- 🔐 用户认证：微信登录、家长绑定
- 📚 错题管理：OCR 识别、知识点提取
- 📅 学习计划：AI 生成、番茄钟、日报
- 💬 聊天服务：情绪支持、对话记忆
- 👨‍👩‍👧 家长服务：学习报告、异常提醒
- 🤖 AI 服务：Gemini/OpenAI 集成

## 数据库模型

- `User`：用户信息
- `WrongQuestion`：错题
- `DailyPlan`：学习计划
- `StudyRecord`：学习记录
- `ParentChildRelation`：亲子关系
- `ChatHistory`：对话历史
- `ChatMessage`：聊天消息

## API 接口

### REST API

| 路径 | 方法 | 功能 |
|------|------|------|
| `/api/auth/*` |  | 认证 |
| `/api/user/*` |  | 用户管理 |
| `/api/question/*` |  | 错题管理 |
| `/api/plan/*` |  | 学习计划 |
| `/api/ai/*` |  | AI 服务 |
| `/api/parent/*` |  | 家长服务 |

### 微信接口

- `GET /wechat`：微信验证
- `POST /wechat`：接收微信消息

## 环境变量

在 `.env` 文件中配置：

- `DATABASE_URL`：数据库连接串
- `GOOGLE_API_KEY`：Google AI API 密钥
- `OPENAI_API_KEY`：OpenAI API 密钥
- `WECHAT_TOKEN`：微信公众号 token
- `WECHAT_APPID`：微信公众号 appid
- `WECHAT_APPSECRET`：微信公众号 appsecret

## 日志

日志输出到 `nohup.out` 文件。