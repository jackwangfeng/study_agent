import { prisma } from '../prisma/index.js';
import { aiService } from './ai.js';
import { userService } from './user.js';
import { studyService } from './study.js';
import { buildPlannerPrompt } from '../prompts/planner.js';
import { nanoid } from 'nanoid';
import { logger } from '../utils/logger.js';

export interface PlanItem {
  id: string;
  type: 'review' | 'practice' | 'plan';
  title: string;
  subject: string;
  knowledgePoint?: string;
  targetCount: number;
  completedCount: number;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface DailyPlan {
  id: string;
  openid: string;
  planDate: Date;
  items: PlanItem[];
  tomatoCount: number;
  totalMinutes: number;
  summary?: string;
}

export class PlannerService {
  async getTodayPlan(openid: string): Promise<DailyPlan | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const plan = await prisma.dailyPlan.findFirst({
      where: {
        openid,
        planDate: today,
      },
    });

    if (!plan) {
      return null;
    }

    return {
      id: plan.id,
      openid: plan.openid,
      planDate: plan.planDate,
      items: plan.items as PlanItem[],
      tomatoCount: plan.tomatoCount,
      totalMinutes: plan.totalMinutes,
      summary: plan.summary || undefined,
    };
  }

  async generateTodayPlan(
    openid: string,
    focusSubjects?: string[],
    availableMinutes: number = 120,
    customGoal?: string
  ): Promise<DailyPlan> {
    const user = await userService.getUserByOpenid(openid);
    if (!user) {
      throw new Error('User not found');
    }

    const weakPoints = await studyService.getWeakPoints(openid);

    let items: PlanItem[] = [];

    try {
      const prompt = buildPlannerPrompt(
        user.grade || 1,
        user.subjects || ['数学', '语文', '英语'],
        weakPoints,
        availableMinutes,
        customGoal
      );

      const result = await aiService.chat([
        { role: 'user', content: prompt },
      ]);

      if (result.reply && !result.reply.includes('抱歉，AI服务暂时未配置')) {
        const jsonMatch = result.reply.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          items = parsed.items || [];
        }
      }
    } catch (error) {
      logger.warn('AI plan generation failed, using default', { error });
    }

    if (items.length === 0) {
      items = this.createDefaultPlanItems(weakPoints, customGoal);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const plan = await prisma.dailyPlan.upsert({
      where: {
        openid_planDate: {
          openid,
          planDate: today,
        },
      },
      update: {
        items,
      },
      create: {
        openid,
        planDate: today,
        items,
        tomatoCount: 0,
        totalMinutes: 0,
      },
    });

    return {
      id: plan.id,
      openid: plan.openid,
      planDate: plan.planDate,
      items: plan.items as PlanItem[],
      tomatoCount: plan.tomatoCount,
      totalMinutes: plan.totalMinutes,
    };
  }

  private createDefaultPlanItems(
    weakPoints: { knowledgePoint: string; subject: string; count: number }[],
    customGoal?: string
  ): PlanItem[] {
    const items: PlanItem[] = [];

    if (customGoal) {
      items.push({
        id: nanoid(),
        type: 'practice',
        title: customGoal,
        subject: '用户指定',
        targetCount: 1,
        completedCount: 0,
        status: 'pending',
      });
    }

    const topWeak = weakPoints.slice(0, 3);
    for (let i = 0; i < topWeak.length; i++) {
      items.push({
        id: nanoid(),
        type: 'review',
        title: `复习${topWeak[i].knowledgePoint}`,
        subject: topWeak[i].subject,
        knowledgePoint: topWeak[i].knowledgePoint,
        targetCount: 3,
        completedCount: 0,
        status: 'pending',
      });
    }

    items.push({
      id: nanoid(),
      type: 'plan',
      title: '整理今日错题',
      subject: 'general',
      targetCount: 5,
      completedCount: 0,
      status: 'pending',
    });

    return items;
  }

  async completePlanItem(openid: string, itemId: string, completedCount?: number, actualMinutes?: number): Promise<DailyPlan> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const plan = await prisma.dailyPlan.findFirst({
      where: { openid, planDate: today },
    });

    if (!plan) {
      throw new Error('Plan not found');
    }

    const items = plan.items as PlanItem[];
    const itemIndex = items.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) {
      throw new Error('Item not found');
    }

    items[itemIndex].completedCount = completedCount || items[itemIndex].targetCount;
    items[itemIndex].status = 'completed';

    const updateData: Record<string, unknown> = {
      items,
    };

    if (actualMinutes) {
      updateData.totalMinutes = plan.totalMinutes + actualMinutes;
    }

    const updated = await prisma.dailyPlan.update({
      where: { id: plan.id },
      data: updateData,
    });

    return {
      id: updated.id,
      openid: updated.openid,
      planDate: updated.planDate,
      items: updated.items as PlanItem[],
      tomatoCount: updated.tomatoCount,
      totalMinutes: updated.totalMinutes,
    };
  }

  async startTomatoClock(openid: string, planItemId?: string, subject?: string): Promise<{ tomatoId: string; endTime: Date }> {
    const tomatoId = nanoid();
    const endTime = new Date(Date.now() + 25 * 60 * 1000);

    return { tomatoId, endTime };
  }

  async completeTomatoClock(openid: string, tomatoId: string, result: 'completed' | 'interrupted'): Promise<{ totalTomatoesToday: number; totalMinutesToday: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let plan = await prisma.dailyPlan.findFirst({
      where: { openid, planDate: today },
    });

    if (!plan) {
      plan = await prisma.dailyPlan.create({
        data: {
          openid,
          planDate: today,
          items: [],
          tomatoCount: 0,
          totalMinutes: 0,
        },
      });
    }

    const minutes = result === 'completed' ? 25 : Math.floor(Math.random() * 10);

    const updated = await prisma.dailyPlan.update({
      where: { id: plan.id },
      data: {
        tomatoCount: plan.tomatoCount + 1,
        totalMinutes: plan.totalMinutes + minutes,
      },
    });

    return {
      totalTomatoesToday: updated.tomatoCount,
      totalMinutesToday: updated.totalMinutes,
    };
  }

  async generateDailySummary(openid: string): Promise<string> {
    const plan = await this.getTodayPlan(openid);
    if (!plan) {
      return '今天还没有学习计划哦，快去制定一个吧！';
    }

    const completedItems = plan.items.filter((i) => i.status === 'completed').length;
    const totalItems = plan.items.length;
    const completionRate = Math.round((completedItems / totalItems) * 100);

    const suggestions = [
      completionRate >= 80 ? '今天完成得很棒！记得复习一下薄弱知识点～' : '今天还有进步空间，明天继续加油！',
      plan.tomatoCount >= 4 ? `完成了${plan.tomatoCount}个番茄钟，专注力不错！` : '明天可以多设置几个番茄钟，提高专注力～',
    ];

    return `今日学习总结：

📊 完成情况：${completedItems}/${totalItems} 项（${completionRate}%）
⏱️ 学习时长：${plan.totalMinutes}分钟
🍅 番茄钟：${plan.tomatoCount}个

${suggestions.join('\n')}`;
  }
}

export const plannerService = new PlannerService();