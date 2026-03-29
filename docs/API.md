openapi: 3.0.3
info:
  title: 智学伴 StudyPal API
  description: |
    高中学习监督Agent - 错题本+学习规划+情绪支持的智能陪练

    ## 概述
    - 平台：微信公众号
    - 认证：微信openid
    - 文档更新：2026-03-29
  version: 1.0.0
  contact:
    name: 智学伴
    email: support@studypal.com

servers:
  - url: https://api.studypal.com
    description: 生产环境
  - url: http://localhost:3000
    description: 开发环境

tags:
  - name: 微信回调
    description: 微信公众号消息回调接口
  - name: 用户
    description: 用户相关接口
  - name: 错题
    description: 错题本相关接口
  - name: 学习计划
    description: 每日学习规划和番茄钟
  - name: 学习记录
    description: 学习数据记录
  - name: 家长端
    description: 家长监督相关接口
  - name: 会员
    description: 会员订阅相关接口
  - name: AI
    description: AI能力接口

paths:
  /wechat:
    get:
      tags:
        - 微信回调
      summary: 微信服务器验证
      description: 微信公众号后台配置时的URL验证接口
      operationId: verifyWechat
      parameters:
        - name: signature
          in: query
          description: 微信加密签名
          required: true
          schema:
            type: string
        - name: timestamp
          in: query
          description: 时间戳
          required: true
          schema:
            type: string
        - name: nonce
          in: query
          description: 随机数
          required: true
          schema:
            type: string
        - name: echostr
          in: query
          description: 随机字符串
          required: false
          schema:
            type: string
      responses:
        '200':
          description: 验证成功
          content:
            text/plain:
              schema:
                type: string
        '403':
          description: 验证失败
          content:
            text/plain:
              schema:
                type: string

    post:
      tags:
        - 微信回调
      summary: 接收微信消息
      description: 接收微信公众号推送的消息和事件
      operationId: receiveWechatMessage
      requestBody:
        required: true
        content:
          application/xml:
            schema:
              type: object
              properties:
                xml:
                  $ref: '#/components/schemas/WechatMessage'
      responses:
        '200':
          description: 成功接收
          content:
            application/xml:
              schema:
                type: object

  /api/users/me:
    get:
      tags:
        - 用户
      summary: 获取当前用户信息
      description: 获取当前登录用户（通过openid识别）的完整信息
      operationId: getCurrentUser
      security:
        - wechatAuth: []
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '401':
          description: 未授权
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    put:
      tags:
        - 用户
      summary: 更新用户信息
      description: 更新用户资料，包括年级、科目等
      operationId: updateUser
      security:
        - wechatAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                nickname:
                  type: string
                  description: 昵称
                grade:
                  type: integer
                  enum: [1, 2, 3]
                  description: 年级：1-高一，2-高二，3-高三
                subjects:
                  type: array
                  items:
                    type: string
                    enum:
                      - math
                      - chinese
                      - english
                      - physics
                      - chemistry
                      - biology
                      - history
                      - geography
                      - politics
                  description: 选择的科目
                examDate:
                  type: string
                  format: date
                  description: 期末考试日期
      responses:
        '200':
          description: 更新成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          description: 参数错误
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /api/users/bind-parent:
    post:
      tags:
        - 用户
      summary: 生成家长绑定码
      description: 学生端调用，生成唯一的绑定码供家长扫码绑定
      operationId: generateBindCode
      security:
        - wechatAuth: []
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  bindCode:
                    type: string
                    description: 6位绑定码
                  expireAt:
                    type: string
                    format: date-time
                    description: 过期时间
                  qrcodeUrl:
                    type: string
                    description: 二维码链接

  /api/questions:
    get:
      tags:
        - 错题
      summary: 获取错题列表
      description: 获取用户的错题列表，支持筛选
      operationId: getQuestions
      security:
        - wechatAuth: []
      parameters:
        - name: subject
          in: query
          description: 按科目筛选
          schema:
            type: string
        - name: status
          in: query
          description: 按状态筛选
          schema:
            type: string
            enum:
              - unmastered
              - learning
              - mastered
        - name: page
          in: query
          description: 页码
          schema:
            type: integer
            default: 1
        - name: pageSize
          in: query
          description: 每页数量
          schema:
            type: integer
            default: 20
            maximum: 100
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  items:
                    type: array
                    items:
                      $ref: '#/components/schemas/WrongQuestion'
                  total:
                    type: integer
                  page:
                    type: integer
                  pageSize:
                    type: integer

    post:
      tags:
        - 错题
      summary: 上传错题
      description: 上传错题图片，AI自动识别题目并保存
      operationId: uploadQuestion
      security:
        - wechatAuth: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                image:
                  type: string
                  format: binary
                  description: 错题图片
                subject:
                  type: string
                  enum:
                    - math
                    - chinese
                    - english
                    - physics
                    - chemistry
                    - biology
                    - history
                    - geography
                    - politics
                  description: 科目（可选，AI会自动识别）
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  questionId:
                    type: string
                    description: 错题ID
                  questionText:
                    type: string
                    description: 识别出的题目
                  subject:
                    type: string
                    description: 识别的科目
                  knowledgePoint:
                    type: string
                    description: 知识点
        '429':
          description: 今日次数用尽
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /api/questions/{questionId}:
    get:
      tags:
        - 错题
      summary: 获取错题详情
      description: 获取某道错题的详细信息
      operationId: getQuestionById
      security:
        - wechatAuth: []
      parameters:
        - name: questionId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WrongQuestion'
        '404':
          description: 错题不存在
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    delete:
      tags:
        - 错题
      summary: 删除错题
      description: 删除某道错题
      operationId: deleteQuestion
      security:
        - wechatAuth: []
      parameters:
        - name: questionId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: 删除成功

  /api/questions/{questionId}/explain:
    post:
      tags:
        - 错题
      summary: 获取错题讲解
      description: 对错题进行引导式讲解，用户描述疑惑点后AI逐步引导
      operationId: explainQuestion
      security:
        - wechatAuth: []
      parameters:
        - name: questionId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - doubt
              properties:
                doubt:
                  type: string
                  description: 学生的疑惑点
                conversationHistory:
                  type: array
                  items:
                    type: object
                    properties:
                      role:
                        type: string
                        enum:
                          - user
                          - assistant
                      content:
                        type: string
                  description: 对话历史（用于多轮讲解）
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  explanation:
                    type: string
                    description: AI讲解内容
                  isCompleted:
                    type: boolean
                    description: 讲解是否完成
                  nextQuestion:
                    type: string
                    description: 下一步引导问题（如果未完成）

  /api/questions/{questionId}/master:
    post:
      tags:
        - 错题
      summary: 标记为已掌握
      description: 学生确认掌握了这道题，更新掌握状态
      operationId: markQuestionMastered
      security:
        - wechatAuth: []
      parameters:
        - name: questionId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WrongQuestion'

  /api/weak-points:
    get:
      tags:
        - 错题
      summary: 获取薄弱点统计
      description: 获取用户的薄弱知识点统计
      operationId: getWeakPoints
      security:
        - wechatAuth: []
      parameters:
        - name: subject
          in: query
          description: 按科目筛选
          schema:
            type: string
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  weakPoints:
                    type: array
                    items:
                      type: object
                      properties:
                        knowledgePoint:
                          type: string
                          description: 知识点名称
                        subject:
                          type: string
                          description: 科目
                        wrongCount:
                          type: integer
                          description: 错题次数
                        questionIds:
                          type: array
                          items:
                            type: string
                          description: 相关错题ID列表

  /api/plans/today:
    get:
      tags:
        - 学习计划
      summary: 获取今日学习计划
      description: 获取当天的学习计划及完成进度
      operationId: getTodayPlan
      security:
        - wechatAuth: []
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DailyPlan'

  /api/plans/generate:
    post:
      tags:
        - 学习计划
      summary: 生成学习计划
      description: AI根据用户情况和薄弱点生成当日学习计划
      operationId: generatePlan
      security:
        - wechatAuth: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                focusSubjects:
                  type: array
                  items:
                    type: string
                  description: 重点科目（可选，不填则AI自动安排）
                availableMinutes:
                  type: integer
                  description: 可用学习时间（分钟），默认120
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DailyPlan'

  /api/plans/items/{itemId}/complete:
    put:
      tags:
        - 学习计划
      summary: 完成计划项
      description: 标记某个计划项为已完成
      operationId: completePlanItem
      security:
        - wechatAuth: []
      parameters:
        - name: itemId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                completedCount:
                  type: integer
                  description: 完成的数量
                actualMinutes:
                  type: integer
                  description: 实际用时（分钟）
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DailyPlan'

  /api/plans/tomato/start:
    post:
      tags:
        - 学习计划
      summary: 开始番茄钟
      description: 开始一个25分钟的专注番茄钟
      operationId: startTomatoClock
      security:
        - wechatAuth: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                planItemId:
                  type: string
                  description: 关联的计划项ID（可选）
                subject:
                  type: string
                  description: 当前学习科目
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  tomatoId:
                    type: string
                  startTime:
                    type: string
                    format: date-time
                  endTime:
                    type: string
                    format: date-time
                  duration:
                    type: integer
                    description: 时长（分钟）
                    example: 25

  /api/plans/tomato/{tomatoId}/complete:
    post:
      tags:
        - 学习计划
      summary: 完成番茄钟
      description: 确认完成一个番茄钟
      operationId: completeTomatoClock
      security:
        - wechatAuth: []
      parameters:
        - name: tomatoId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                result:
                  type: string
                  enum:
                    - completed
                    - interrupted
                  description: 完成结果
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  totalTomatoesToday:
                    type: integer
                    description: 今日完成的番茄钟数
                  totalMinutesToday:
                    type: integer
                    description: 今日总学习时长

  /api/plans/summary:
    get:
      tags:
        - 学习计划
      summary: 获取学习日报
      description: 获取当天的学习总结
      operationId: getDailySummary
      security:
        - wechatAuth: []
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  date:
                    type: string
                    format: date
                  totalMinutes:
                    type: integer
                    description: 总学习时长
                  tomatoCount:
                    type: integer
                    description: 完成的番茄钟数
                  completedItems:
                    type: integer
                    description: 完成的计划项数
                  totalItems:
                    type: integer
                    description: 计划总项数
                  summary:
                    type: string
                    description: AI生成的学习总结
                  suggestions:
                    type: array
                    items:
                      type: string
                    description: 明日建议

  /api/records:
    get:
      tags:
        - 学习记录
      summary: 获取学习记录
      description: 获取历史学习记录
      operationId: getStudyRecords
      security:
        - wechatAuth: []
      parameters:
        - name: startDate
          in: query
          schema:
            type: string
            format: date
        - name: endDate
          in: query
          schema:
            type: string
            format: date
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: pageSize
          in: query
          schema:
            type: integer
            default: 30
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  items:
                    type: array
                    items:
                      $ref: '#/components/schemas/StudyRecord'
                  total:
                    type: integer

  /api/records/emotion:
    post:
      tags:
        - 学习记录
      summary: 记录情绪状态
      description: 记录当日的情绪状态
      operationId: recordEmotion
      security:
        - wechatAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  enum:
                    - positive
                    - neutral
                    - negative
                  description: 情绪状态
                note:
                  type: string
                  description: 情绪备注（可选）
      responses:
        '200':
          description: 记录成功

  /api/parent/bind:
    post:
      tags:
        - 家长端
      summary: 家长绑定孩子
      description: 家长通过绑定码绑定孩子账号
      operationId: bindChild
      security:
        - wechatAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                bindCode:
                  type: string
                  description: 6位绑定码
                relation:
                  type: string
                  enum:
                    - father
                    - mother
                    - guardian
                  description: 与孩子的关系
      responses:
        '200':
          description: 绑定成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  child:
                    $ref: '#/components/schemas/User'
        '400':
          description: 绑定码无效或已过期

  /api/parent/children:
    get:
      tags:
        - 家长端
      summary: 获取已绑定的孩子列表
      description: 获取家长账号下绑定的所有孩子
      operationId: getChildren
      security:
        - wechatAuth: []
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    openid:
                      type: string
                    nickname:
                      type: string
                    grade:
                      type: integer
                    bindTime:
                      type: string
                      format: date-time

  /api/parent/children/{childOpenid}/report:
    get:
      tags:
        - 家长端
      summary: 获取孩子学习周报
      description: 获取指定孩子的本周学习报告
      operationId: getChildWeeklyReport
      security:
        - wechatAuth: []
      parameters:
        - name: childOpenid
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  weekStart:
                    type: string
                    format: date
                  weekEnd:
                    type: string
                    format: date
                  totalMinutes:
                    type: integer
                    description: 本周总学习时长
                  totalTomatoes:
                    type: integer
                    description: 本周总番茄钟数
                  questionsReviewed:
                    type: integer
                    description: 本周复习错题数
                  questionsMastered:
                    type: integer
                    description: 本周掌握错题数
                  topWeakPoints:
                    type: array
                    items:
                      type: object
                      properties:
                        knowledgePoint:
                          type: string
                        count:
                          type: integer
                    description: 主要薄弱点
                  emotionTrend:
                    type: string
                    enum:
                      - positive
                      - neutral
                      - negative
                    description: 本周情绪趋势
                  suggestions:
                    type: array
                    items:
                      type: string
                    description: 改进建议

  /api/parent/notify-settings:
    put:
      tags:
        - 家长端
      summary: 更新通知设置
      description: 家长端更新通知偏好
      operationId: updateNotifySettings
      security:
        - wechatAuth: []
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                notifyEnabled:
                  type: boolean
                  description: 是否启用通知
                weeklyReportDay:
                  type: integer
                  minimum: 0
                  maximum: 6
                  description: 每周报告推送日（0=周日，6=周六）
                abnormalAlert:
                  type: boolean
                  description: 异常提醒（连续未学习）
      responses:
        '200':
          description: 更新成功

  /api/membership:
    get:
      tags:
        - 会员
      summary: 获取会员状态
      description: 获取当前用户的会员信息
      operationId: getMembership
      security:
        - wechatAuth: []
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Membership'

  /api/membership/products:
    get:
      tags:
        - 会员
      summary: 获取会员产品列表
      description: 获取可购买的会员产品
      operationId: getMembershipProducts
      security:
        - wechatAuth: []
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    productId:
                      type: string
                    name:
                      type: string
                    level:
                      type: string
                      enum:
                        - monthly
                        - quarterly
                        - yearly
                    price:
                      type: number
                      description: 价格（元）
                    features:
                      type: array
                      items:
                        type: string

  /api/membership/purchase:
    post:
      tags:
        - 会员
      summary: 购买会员
      description: 发起会员购买流程
      operationId: purchaseMembership
      security:
        - wechatAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                productId:
                  type: string
                paymentMethod:
                  type: string
                  enum:
                    - wechat_pay
                  description: 支付方式
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  orderId:
                    type: string
                  payParams:
                    type: object
                    description: 支付参数（微信支付调起参数）

  /api/ai/chat:
    post:
      tags:
        - AI
      summary: AI对话
      description: 通用AI对话接口，支持上下文
      operationId: aiChat
      security:
        - wechatAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
                  description: 用户消息
                context:
                  type: array
                  items:
                    type: object
                    properties:
                      role:
                        type: string
                        enum:
                          - user
                          - assistant
                      content:
                        type: string
                  description: 对话历史上下文
                type:
                  type: string
                  enum:
                    - general
                    - emotional
                    - planning
                  description: 对话类型
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  reply:
                    type: string
                    description: AI回复
                  detectedEmotion:
                    type: string
                    enum:
                      - positive
                      - neutral
                      - negative
                    description: 检测到的情绪
                  suggestedActions:
                    type: array
                    items:
                      type: string
                    description: 建议的后续动作

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        openid:
          type: string
          description: 微信openid
        userType:
          type: string
          enum:
            - student
            - parent
        nickname:
          type: string
        avatar:
          type: string
        grade:
          type: integer
          enum: [1, 2, 3]
          description: 年级
        subjects:
          type: array
          items:
            type: string
          description: 科目数组
        examDate:
          type: string
          format: date
          description: 期末考试日期
        membershipLevel:
          type: string
          enum:
            - free
            - monthly
            - quarterly
            - yearly
        membershipExpireAt:
          type: string
          format: date-time
        parentOpenid:
          type: string
          description: 绑定的家长openid
        createdAt:
          type: string
          format: date-time

    WrongQuestion:
      type: object
      properties:
        id:
          type: string
          format: uuid
        openid:
          type: string
        questionImage:
          type: string
          description: 错题图片URL
        questionText:
          type: string
          description: OCR识别后的题目
        subject:
          type: string
        knowledgePoint:
          type: string
        wrongCount:
          type: integer
        correctCount:
          type: integer
        status:
          type: string
          enum:
            - unmastered
            - learning
            - mastered
        createdAt:
          type: string
          format: date-time

    Explanation:
      type: object
      properties:
        id:
          type: string
          format: uuid
        questionId:
          type: string
          format: uuid
        doubt:
          type: string
          description: 学生的疑惑点
        explanation:
          type: string
          description: AI讲解内容
        isUnderstood:
          type: boolean
        createdAt:
          type: string
          format: date-time

    DailyPlan:
      type: object
      properties:
        id:
          type: string
          format: uuid
        openid:
          type: string
        planDate:
          type: string
          format: date
        items:
          type: array
          items:
            type: object
            properties:
              id:
                type: string
              type:
                type: string
                enum:
                  - review
                  - practice
                  - plan
              title:
                type: string
              subject:
                type: string
              knowledgePoint:
                type: string
              targetCount:
                type: integer
              completedCount:
                type: integer
              status:
                type: string
                enum:
                  - pending
                  - in_progress
                  - completed
        tomatoCount:
          type: integer
        totalMinutes:
          type: integer
        summary:
          type: string
        createdAt:
          type: string
          format: date-time

    StudyRecord:
      type: object
      properties:
        id:
          type: string
          format: uuid
        openid:
          type: string
        recordDate:
          type: string
          format: date
        records:
          type: array
          items:
            type: object
            properties:
              type:
                type: string
                enum:
                  - question
                  - tomato
                  - plan
              subject:
                type: string
              duration:
                type: integer
              count:
                type: integer
              result:
                type: string
                enum:
                  - correct
                  - wrong
                  - skipped
        emotionStatus:
          type: string
          enum:
            - positive
            - neutral
            - negative
        emotionNote:
          type: string
        createdAt:
          type: string
          format: date-time

    Membership:
      type: object
      properties:
        level:
          type: string
          enum:
            - free
            - monthly
            - quarterly
            - yearly
        expireAt:
          type: string
          format: date-time
        dailyQuestionUsed:
          type: integer
          description: 今日已用错题次数
        dailyQuestionLimit:
          type: integer
          description: 每日错题次数限制
        aiChatUsed:
          type: integer
          description: 今日AI对话已用次数
        aiChatLimit:
          type: integer
          description: 每日AI对话限制

    WechatMessage:
      type: object
      properties:
        ToUserName:
          type: string
          description: 开发者微信号
        FromUserName:
          type: string
          description: 发送方账号（openid）
        CreateTime:
          type: string
          description: 消息创建时间
        MsgType:
          type: string
          enum:
            - text
            - image
            - voice
            - video
            - shortvideo
            - location
            - link
            - event
        Content:
          type: string
          description: 文本消息内容
        MsgId:
          type: string
          description: 消息ID
        PicUrl:
          type: string
          description: 图片链接
        MediaId:
          type: string
          description: 媒体ID
        Event:
          type: string
          description: 事件类型

    Error:
      type: object
      properties:
        code:
          type: integer
          description: 错误码
        message:
          type: string
          description: 错误信息
      example:
        code: 400
        message: 参数错误

  securitySchemes:
    wechatAuth:
      type: apiKey
      in: header
      name: X-Wechat-Openid
      description: 微信用户openid（通过微信客户端自动携带）
