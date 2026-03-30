import { prisma } from '../prisma/index.js';
import { nanoid } from 'nanoid';

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  totalMinutes: number;
  totalTomatoes: number;
  questionsReviewed: number;
  questionsMastered: number;
  topWeakPoints: { knowledgePoint: string; count: number }[];
  emotionTrend: 'positive' | 'neutral' | 'negative';
  suggestions: string[];
}

export class ParentService {
  async bindChild(parentOpenid: string, bindCode: string, relation: string): Promise<void> {
    const relationRecord = await prisma.parentChildRelation.findFirst({
      where: {
        bindCode,
        bindCodeExpireAt: { gt: new Date() },
      },
    });

    if (!relationRecord) {
      throw new Error('Invalid or expired bind code');
    }

    await prisma.parentChildRelation.update({
      where: { id: relationRecord.id },
      data: {
        parentOpenid,
        relation,
        bindCode: null,
        bindCodeExpireAt: null,
      },
    });

    await prisma.user.update({
      where: { openid: relationRecord.childOpenid },
      data: { parentOpenid },
    });
  }

  async generateBindCode(openid: string): Promise<{ bindCode: string; expireAt: Date }> {
    const bindCode = nanoid(6).toUpperCase();
    const expireAt = new Date(Date.now() + 30 * 60 * 1000);

    const existing = await prisma.parentChildRelation.findFirst({
      where: { childOpenid: openid },
    });

    if (existing) {
      await prisma.parentChildRelation.update({
        where: { id: existing.id },
        data: {
          bindCode,
          bindCodeExpireAt: expireAt,
        },
      });
    } else {
      await prisma.parentChildRelation.create({
        data: {
          childOpenid: openid,
          parentOpenid: '',
          bindCode,
          bindCodeExpireAt: expireAt,
        },
      });
    }

    return { bindCode, expireAt };
  }

  async getChildren(parentOpenid: string): Promise<{ openid: string; nickname: string | null; grade: number | null }[]> {
    const relations = await prisma.parentChildRelation.findMany({
      where: { parentOpenid },
    });

    const childOpenids = relations.map((r) => r.childOpenid);

    const children = await prisma.user.findMany({
      where: { openid: { in: childOpenids } },
      select: { openid: true, nickname: true, grade: true },
    });

    return children.map((child) => ({
      openid: child.openid,
      nickname: child.nickname,
      grade: child.grade,
    }));
  }

  async generateWeeklyReport(childOpenid: string): Promise<WeeklyReport> {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const [plans, questions, records] = await Promise.all([
      prisma.dailyPlan.findMany({
        where: {
          openid: childOpenid,
          planDate: { gte: weekStart, lte: weekEnd },
        },
      }),
      prisma.wrongQuestion.findMany({
        where: {
          openid: childOpenid,
          createdAt: { gte: weekStart, lte: weekEnd },
        },
      }),
      prisma.studyRecord.findMany({
        where: {
          openid: childOpenid,
          recordDate: { gte: weekStart, lte: weekEnd },
        },
      }),
    ]);

    const totalMinutes = plans.reduce((sum, p) => sum + p.totalMinutes, 0);
    const totalTomatoes = plans.reduce((sum, p) => sum + p.tomatoCount, 0);
    const questionsReviewed = questions.length;
    const questionsMastered = questions.filter((q) => q.status === 'mastered').length;

    const weakPointMap = new Map<string, number>();
    for (const q of questions) {
      if (q.knowledgePoint) {
        weakPointMap.set(q.knowledgePoint, (weakPointMap.get(q.knowledgePoint) || 0) + q.wrongCount);
      }
    }
    const topWeakPoints = Array.from(weakPointMap.entries())
      .map(([knowledgePoint, count]) => ({ knowledgePoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const emotionCounts = { positive: 0, neutral: 0, negative: 0 };
    for (const r of records) {
      if (r.emotionStatus && emotionCounts[r.emotionStatus as keyof typeof emotionCounts] !== undefined) {
        emotionCounts[r.emotionStatus as keyof typeof emotionCounts]++;
      }
    }
    const emotionTrend = emotionCounts.positive >= emotionCounts.negative ? 'positive' : 'negative';

    const suggestions = this.generateSuggestions({ totalMinutes, totalTomatoes, questionsMastered, emotionTrend });

    return {
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      totalMinutes,
      totalTomatoes,
      questionsReviewed,
      questionsMastered,
      topWeakPoints,
      emotionTrend,
      suggestions,
    };
  }

  private generateSuggestions(report: { totalMinutes: number; totalTomatoes: number; questionsMastered: number; emotionTrend: string }): string[] {
    const suggestions: string[] = [];

    if (report.totalMinutes < 60) {
      suggestions.push('本周学习时间较少，建议与孩子沟通了解情况');
    }
    if (report.totalTomatoes < 10) {
      suggestions.push('专注时间有提升空间，可以试试番茄工作法');
    }
    if (report.questionsMastered < 3) {
      suggestions.push('错题复习效果不明显，建议加强薄弱点训练');
    }
    if (report.emotionTrend === 'negative') {
      suggestions.push('孩子情绪偏负面，建议多给予鼓励和支持');
    }

    if (suggestions.length === 0) {
      suggestions.push('本周表现不错，继续保持！');
    }

    return suggestions;
  }

  async checkAbnormal(childOpenid: string): Promise<{ hasAbnormal: boolean; reason?: string }> {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    threeDaysAgo.setHours(0, 0, 0, 0);

    const recentPlans = await prisma.dailyPlan.findMany({
      where: {
        openid: childOpenid,
        planDate: { gt: threeDaysAgo },
      },
      orderBy: { planDate: 'desc' },
    });

    const recentRecords = await prisma.studyRecord.findMany({
      where: {
        openid: childOpenid,
        recordDate: { gt: threeDaysAgo },
      },
      orderBy: { recordDate: 'desc' },
    });

    if (recentPlans.length === 0 && recentRecords.length === 0) {
      return { hasAbnormal: true, reason: '连续3天无学习记录' };
    }

    const negativeEmotions = recentRecords.filter((r) => r.emotionStatus === 'negative').length;
    if (negativeEmotions >= 2) {
      return { hasAbnormal: true, reason: '情绪持续低落' };
    }

    return { hasAbnormal: false };
  }

  async updateNotifySettings(
    parentOpenid: string,
    settings: { notifyEnabled?: boolean; weeklyReportDay?: number; abnormalAlert?: boolean }
  ): Promise<void> {
    await prisma.parentChildRelation.updateMany({
      where: { parentOpenid },
      data: {
        notifyEnabled: settings.notifyEnabled,
        weeklyReportDay: settings.weeklyReportDay,
      },
    });
  }
}

export const parentService = new ParentService();
