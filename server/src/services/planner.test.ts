import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlannerService } from '../services/planner.js';

vi.mock('../prisma/index.js', () => ({
  prisma: {
    dailyPlan: {
      findFirst: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('../services/ai.js', () => ({
  aiService: {
    chat: vi.fn(),
  },
}));

vi.mock('../services/user.js', () => ({
  userService: {
    getUserByOpenid: vi.fn(),
  },
}));

vi.mock('../services/study.js', () => ({
  studyService: {
    getWeakPoints: vi.fn(),
  },
}));

describe('PlannerService', () => {
  let plannerService: PlannerService;

  beforeEach(() => {
    plannerService = new PlannerService();
    vi.clearAllMocks();
  });

  describe('getTodayPlan', () => {
    it('should return null if no plan exists', async () => {
      const { prisma } = await import('../prisma/index.js');
      vi.mocked(prisma.dailyPlan.findFirst).mockResolvedValue(null);

      const result = await plannerService.getTodayPlan('user1');
      expect(result).toBeNull();
    });
  });

  describe('completePlanItem', () => {
    it('should throw error if plan not found', async () => {
      const { prisma } = await import('../prisma/index.js');
      vi.mocked(prisma.dailyPlan.findFirst).mockResolvedValue(null);

      await expect(plannerService.completePlanItem('user1', 'item1')).rejects.toThrow('Plan not found');
    });
  });
});
