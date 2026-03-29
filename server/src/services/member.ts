import { prisma } from '../prisma/index.js';

export type MembershipLevel = 'free' | 'monthly' | 'quarterly' | 'yearly';

export interface MembershipInfo {
  level: MembershipLevel;
  expireAt: Date | null;
  dailyQuestionUsed: number;
  dailyQuestionLimit: number;
  aiChatUsed: number;
  aiChatLimit: number;
}

const membershipLimits: Record<MembershipLevel, { dailyQuestions: number; aiChat: number }> = {
  free: { dailyQuestions: 5, aiChat: 10 },
  monthly: { dailyQuestions: -1, aiChat: -1 },
  quarterly: { dailyQuestions: -1, aiChat: -1 },
  yearly: { dailyQuestions: -1, aiChat: -1 },
};

const membershipPrices: Record<Exclude<MembershipLevel, 'free'>, number> = {
  monthly: 29,
  quarterly: 79,
  yearly: 199,
};

export class MemberService {
  async getMembership(openid: string): Promise<MembershipInfo> {
    const user = await prisma.user.findUnique({
      where: { openid },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const limits = membershipLimits[user.membershipLevel as MembershipLevel] || membershipLimits.free;

    return {
      level: user.membershipLevel as MembershipLevel,
      expireAt: user.membershipExpireAt,
      dailyQuestionUsed: 0,
      dailyQuestionLimit: limits.dailyQuestions,
      aiChatUsed: 0,
      aiChatLimit: limits.aiChat,
    };
  }

  async checkQuota(openid: string, type: 'question' | 'aiChat'): Promise<boolean> {
    const membership = await this.getMembership(openid);

    if (membership.level !== 'free') {
      return true;
    }

    if (type === 'question') {
      return membership.dailyQuestionUsed < membership.dailyQuestionLimit;
    }

    return membership.aiChatUsed < membership.aiChatLimit;
  }

  async purchaseMembership(openid: string, level: Exclude<MembershipLevel, 'free'>): Promise<{ orderId: string; payParams: object }> {
    const daysMap: Record<Exclude<MembershipLevel, 'free'>, number> = {
      monthly: 30,
      quarterly: 90,
      yearly: 365,
    };

    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + daysMap[level]);

    await prisma.user.update({
      where: { openid },
      data: {
        membershipLevel: level,
        membershipExpireAt: expireAt,
      },
    });

    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      orderId,
      payParams: {
        orderId,
        amount: membershipPrices[level],
        level,
      },
    };
  }

  async getProducts(): Promise<{ productId: string; name: string; level: MembershipLevel; price: number; features: string[] }[]> {
    return [
      {
        productId: 'monthly',
        name: '月卡',
        level: 'monthly',
        price: membershipPrices.monthly,
        features: [
          '无限错题上传',
          '无限AI讲解',
          '薄弱点追踪',
          'AI学习规划',
          '番茄钟专注',
        ],
      },
      {
        productId: 'quarterly',
        name: '季卡',
        level: 'quarterly',
        price: membershipPrices.quarterly,
        features: [
          '月卡全部功能',
          '每日学习日报',
          '错题复习提醒',
          '同类题推送',
          '家长异常提醒',
        ],
      },
      {
        productId: 'yearly',
        name: '年卡',
        level: 'yearly',
        price: membershipPrices.yearly,
        features: [
          '季卡全部功能',
          '月度学习分析',
          '完整家长报告',
          '优先客服支持',
        ],
      },
    ];
  }

  async checkAndExpireMembership(): Promise<void> {
    const now = new Date();
    await prisma.user.updateMany({
      where: {
        membershipLevel: { not: 'free' },
        membershipExpireAt: { lt: now },
      },
      data: {
        membershipLevel: 'free',
        membershipExpireAt: null,
      },
    });
  }
}

export const memberService = new MemberService();
