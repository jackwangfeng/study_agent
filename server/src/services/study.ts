import { prisma } from '../prisma/index.js';
import type { WrongQuestion } from '@prisma/client';

export interface CreateQuestionParams {
  openid: string;
  questionImage?: string;
  questionText?: string;
  subject?: string;
  knowledgePoint?: string;
}

export interface QuestionFilter {
  subject?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export class StudyService {
  async createQuestion(params: CreateQuestionParams): Promise<WrongQuestion> {
    return prisma.wrongQuestion.create({
      data: {
        openid: params.openid,
        questionImage: params.questionImage,
        questionText: params.questionText,
        subject: params.subject,
        knowledgePoint: params.knowledgePoint,
        status: 'unmastered',
        wrongCount: 1,
      },
    });
  }

  async getQuestions(openid: string, filter: QuestionFilter): Promise<{ items: WrongQuestion[]; total: number }> {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = { openid };
    if (filter.subject) {
      where.subject = filter.subject;
    }
    if (filter.status) {
      where.status = filter.status;
    }

    const [items, total] = await Promise.all([
      prisma.wrongQuestion.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.wrongQuestion.count({ where }),
    ]);

    return { items, total };
  }

  async getQuestionById(id: string): Promise<WrongQuestion | null> {
    return prisma.wrongQuestion.findUnique({
      where: { id },
    });
  }

  async deleteQuestion(id: string): Promise<void> {
    await prisma.wrongQuestion.delete({
      where: { id },
    });
  }

  async markAsLearning(id: string): Promise<WrongQuestion> {
    return prisma.wrongQuestion.update({
      where: { id },
      data: { status: 'learning' },
    });
  }

  async markAsMastered(id: string): Promise<WrongQuestion> {
    return prisma.wrongQuestion.update({
      where: { id },
      data: {
        status: 'mastered',
        correctCount: { increment: 1 },
      },
    });
  }

  async getWeakPoints(openid: string, subject?: string): Promise<{ knowledgePoint: string; subject: string; count: number }[]> {
    const where: Record<string, unknown> = {
      openid,
      status: { not: 'mastered' },
    };
    if (subject) {
      where.subject = subject;
    }

    const questions = await prisma.wrongQuestion.findMany({
      where,
      select: {
        knowledgePoint: true,
        subject: true,
        wrongCount: true,
      },
    });

    const weakMap = new Map<string, { knowledgePoint: string; subject: string; count: number }>();

    for (const q of questions) {
      if (!q.knowledgePoint) continue;
      const key = `${q.knowledgePoint}-${q.subject}`;
      const existing = weakMap.get(key);
      if (existing) {
        existing.count += q.wrongCount;
      } else {
        weakMap.set(key, {
          knowledgePoint: q.knowledgePoint,
          subject: q.subject || '',
          count: q.wrongCount,
        });
      }
    }

    return Array.from(weakMap.values())
      .sort((a, b) => b.count - a.count);
  }

  async addExplanation(
    questionId: string,
    doubt: string,
    explanation: string,
    isUnderstood?: boolean
  ): Promise<void> {
    await prisma.explanation.create({
      data: {
        questionId,
        doubt,
        explanation,
        isUnderstood,
      },
    });

    await prisma.wrongQuestion.update({
      where: { id: questionId },
      data: { wrongCount: { increment: 1 } },
    });
  }
}

export const studyService = new StudyService();
