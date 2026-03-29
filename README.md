# 智学伴 StudyPal

高中学习监督Agent - 错题本+学习规划+情绪支持的智能陪练

---

## 产品定位

**一句话说清楚**：一个懂高中生心理、专治"努力了没进步"的AI错题陪练

**产品口号**：陪你搞定每一道错题，见证每一次进步

---

## 核心功能

### 学生端

| 功能 | 描述 |
|------|------|
| 错题本 | 拍照上传、AI识别、引导式讲解、薄弱点追踪 |
| 每日学习规划 | AI学习规划师、番茄钟专注、学习日报、连续打卡 |
| 情绪支持 | 考后疏导、学习激励、倾诉树洞 |

### 家长端

| 功能 | 描述 |
|------|------|
| 学习报告 | 每周主动推送学习周报 |
| 异常提醒 | 连续未学习、情绪低落时通知 |
| 进度查看 | 了解孩子各科学习状态 |

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Taro 3 + React + TypeScript |
| 后端 | Express + TypeScript |
| 数据库 | PostgreSQL + Redis |
| AI | OpenAI GPT-3.5/GPT-4 |
| OCR | Tesseract.js / 腾讯云OCR |

---

## 项目结构

```
study_agent/
├── docs/                   # 文档
│   ├── PRD.md            # 产品需求文档
│   ├── ARCHITECTURE.md   # 技术架构文档
│   ├── DEVELOPMENT.md    # 开发规范
│   └── API.md            # API文档
├── server/                # 后端（Express + TypeScript）
│   ├── src/
│   │   ├── config/       # 配置
│   │   ├── routes/       # 路由
│   │   ├── services/     # 业务逻辑
│   │   ├── prisma/       # Prisma ORM
│   │   └── utils/        # 工具函数
│   └── package.json
├── client/                # 前端（Taro 3 + TypeScript）
│   ├── src/
│   │   ├── pages/        # 页面
│   │   ├── components/   # 组件
│   │   └── stores/       # 状态管理
│   └── package.json
└── docs/
```

---

## 开发阶段

| 阶段 | 功能 | 周期 |
|------|------|------|
| MVP | 微信接入、错题识别、引导式讲解、情绪关键词回复 | 2周 |
| 核心功能 | 错题本存储、知识点分类、薄弱点统计、家长端 | 2周 |
| 增长功能 | 复习提醒、同类题推送、学习报告、成就系统 | 3周 |

---

## 会员体系

| 等级 | 价格 | 核心权益 |
|------|------|----------|
| 免费版 | ¥0 | 每天5道错题、基础讲解 |
| 月卡 | ¥29/月 | 无限错题、薄弱点分析、AI规划 |
| 季卡 | ¥79/季 | 每日日报、家长异常提醒 |
| 年卡 | ¥199/年 | 月度分析、完整家长报告 |

---

## 快速开始

### 环境要求

- Node.js >= 18
- PostgreSQL >= 15
- Redis >= 7

### 后端启动

```bash
cd server
npm install
cp .env.example .env
# 编辑 .env 填入配置
npm run dev
```

### 前端启动

```bash
cd client
npm install
npm run dev:h5
```

---

## 联系方式

如有问题或建议，请通过微信公众号联系我们。

---

*最后更新：2026-03-29*
# study_agent
