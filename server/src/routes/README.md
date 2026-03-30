# 路由目录

后端 API 路由定义

## 目录结构

```
routes/
├── api/       # REST API 路由
└── wechat.ts  # 微信公众号接口
```

## API 路由

### api/ 目录

```
api/
├── ai.ts         # AI 服务
├── auth.ts       # 认证
├── emotional.ts  # 情绪服务
├── index.ts      # 路由入口
├── member.ts     # 会员服务
├── parent.ts     # 家长服务
├── plan.ts       # 学习计划
├── question.ts   # 错题服务
└── user.ts       # 用户服务
```

### 路由说明

| 路由文件 | 功能 | 路径前缀 |
|----------|------|----------|
| `ai.ts` | AI 服务 | `/api/ai/*` |
| `auth.ts` | 认证 | `/api/auth/*` |
| `emotional.ts` | 情绪服务 | `/api/emotional/*` |
| `member.ts` | 会员服务 | `/api/member/*` |
| `parent.ts` | 家长服务 | `/api/parent/*` |
| `plan.ts` | 学习计划 | `/api/plan/*` |
| `question.ts` | 错题服务 | `/api/question/*` |
| `user.ts` | 用户服务 | `/api/user/*` |

## 微信接口

- `GET /wechat` - 微信验证
- `POST /wechat` - 接收微信消息

## 路由配置

路由通过 Express Router 配置，在 `api/index.ts` 中统一注册：

```typescript
import express from 'express';
import ai from './ai.js';
import auth from './auth.js';
import user from './user.js';
import question from './question.js';
import plan from './plan.js';
import emotional from './emotional.js';
import parent from './parent.js';
import member from './member.js';

const router = express.Router();

router.use('/ai', ai);
router.use('/auth', auth);
router.use('/user', user);
router.use('/question', question);
router.use('/plan', plan);
router.use('/emotional', emotional);
router.use('/parent', parent);
router.use('/member', member);

export default router;
```

## 认证中间件

所有 API 路由都需要通过认证中间件验证 `X-Wechat-Openid` 请求头：

```typescript
router.use((req, res, next) => {
  const openid = req.headers['x-wechat-openid'] as string;
  if (!openid) {
    return res.status(401).json({ code: 401, message: 'Unauthorized' });
  }
  next();
});
```

## 响应格式

所有 API 响应都返回标准格式：

```json
{
  "code": 200,
  "data": {...},
  "message": "Success"
}
```

- `code: 200` - 成功
- `code: 401` - 未授权
- `code: 404` - 资源不存在
- `code: 500` - 服务器错误