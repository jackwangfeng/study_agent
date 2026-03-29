import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StudyService } from '../services/study.js';

vi.mock('../prisma/index.js', () => ({
  prisma: {
    wrongQuestion: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    explanation: {
      create: vi.fn(),
    },
  },
}));

describe('StudyService', () => {
  let studyService: StudyService;

  beforeEach(() => {
    studyService = new StudyService();
    vi.clearAllMocks();
  });

  describe('createQuestion', () => {
    it('should create a new question', async () => {
      const mockQuestion = {
        id: 'q1',
        openid: 'user1',
        questionText: 'Test question',
        subject: 'math',
        status: 'unmastered',
        wrongCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { prisma } = await import('../prisma/index.js');
      vi.mocked(prisma.wrongQuestion.create).mockResolvedValue(mockQuestion);

      const result = await studyService.createQuestion({
        openid: 'user1',
        questionText: 'Test question',
        subject: 'math',
      });

      expect(result.questionText).toBe('Test question');
      expect(result.status).toBe('unmastered');
    });
  });

  describe('getQuestions', () => {
    it('should return paginated questions', async () => {
      const mockQuestions = [
        { id: 'q1', openid: 'user1', questionText: 'Q1', status: 'unmastered', createdAt: new Date(), updatedAt: new Date() },
        { id: 'q2', openid: 'user1', questionText: 'Q2', status: 'learning', createdAt: new Date(), updatedAt: new Date() },
      ];

      const { prisma } = await import('../prisma/index.js');
      vi.mocked(prisma.wrongQuestion.findMany).mockResolvedValue(mockQuestions);
      vi.mocked(prisma.wrongQuestion.count).mockResolvedValue(2);

      const result = await studyService.getQuestions('user1', { page: 1, pageSize: 20 });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });

  describe('getWeakPoints', () => {
    it('should aggregate weak points by knowledge point', async () => {
      const mockQuestions = [
        { knowledgePoint: '函数', subject: 'math', wrongCount: 2 },
        { knowledgePoint: '函数', subject: 'math', wrongCount: 3 },
        { knowledgePoint: '几何', subject: 'math', wrongCount: 1 },
      ];

      const { prisma } = await import('../prisma/index.js');
      vi.mocked(prisma.wrongQuestion.findMany).mockResolvedValue(mockQuestions as any);

      const result = await studyService.getWeakPoints('user1');

      expect(result).toHaveLength(2);
      const 函数 = result.find(r => r.knowledgePoint === '函数');
      expect(函数?.count).toBe(5);
    });
  });

  describe('markAsMastered', () => {
    it('should update status to mastered and increment correct count', async () => {
      const masteredQuestion = {
        id: 'q1',
        openid: 'user1',
        status: 'mastered',
        correctCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { prisma } = await import('../prisma/index.js');
      vi.mocked(prisma.wrongQuestion.update).mockResolvedValue(masteredQuestion);

      const result = await studyService.markAsMastered('q1');

      expect(result.status).toBe('mastered');
      expect(result.correctCount).toBe(1);
    });
  });
});
