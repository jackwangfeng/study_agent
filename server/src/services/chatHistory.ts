import { prisma } from '../prisma/index.js';
import { logger } from '../utils/logger.js';

export interface ChatMessageRecord {
  id: string;
  openid: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  messageType: string;
  createdAt: Date;
}

export interface ChatHistoryRecord {
  id: string;
  openid: string;
  sessionDate: Date;
  summary: string | null;
  messages: ChatMessageRecord[];
}

const MAX_MESSAGES_BEFORE_SUMMARY = 10;
const MAX_RECENT_MESSAGES_KEPT = 4;

export class ChatHistoryService {
  async getOrCreateTodayHistory(openid: string): Promise<{ id: string; summary: string | null }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let history = await prisma.chatHistory.findUnique({
      where: {
        openid_sessionDate: {
          openid,
          sessionDate: today,
        },
      },
    });

    if (!history) {
      history = await prisma.chatHistory.create({
        data: {
          openid,
          sessionDate: today,
        },
      });
    }

    return { id: history.id, summary: history.summary || null };
  }

  async getRecentMessages(openid: string, limit: number = 10): Promise<ChatMessageRecord[]> {
    const messages = await prisma.chatMessage.findMany({
      where: { openid },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return messages.reverse() as ChatMessageRecord[];
  }

  async addMessage(
    openid: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    messageType: string = 'general'
  ): Promise<void> {
    const history = await this.getOrCreateTodayHistory(openid);

    await prisma.chatMessage.create({
      data: {
        openid,
        historyId: history.id,
        role,
        content,
        messageType,
      },
    });
  }

  async getMessagesForContext(openid: string): Promise<{ role: string; content: string }[]> {
    const recentMessages = await this.getRecentMessages(openid, MAX_MESSAGES_BEFORE_SUMMARY + MAX_RECENT_MESSAGES_KEPT);
    return recentMessages.map(m => ({
      role: m.role,
      content: m.content,
    }));
  }

  async shouldSummarize(openid: string): Promise<boolean> {
    const count = await prisma.chatMessage.count({
      where: { openid },
    });
    return count >= MAX_MESSAGES_BEFORE_SUMMARY;
  }

  async updateSummary(openid: string, summary: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.chatHistory.updateMany({
      where: {
        openid,
        sessionDate: today,
      },
      data: {
        summary,
      },
    });
  }

  async compressHistory(openid: string): Promise<string | null> {
    const recentMessages = await this.getRecentMessages(openid, MAX_MESSAGES_BEFORE_SUMMARY);

    if (recentMessages.length < MAX_MESSAGES_BEFORE_SUMMARY) {
      return null;
    }

    const summary = await this.generateSummary(recentMessages);

    await this.updateSummary(openid, summary);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const history = await prisma.chatHistory.findUnique({
      where: {
        openid_sessionDate: {
          openid,
          sessionDate: today,
        },
      },
    });

    if (history) {
      await prisma.chatMessage.deleteMany({
        where: {
          openid,
          historyId: history.id,
          id: {
            notIn: recentMessages.slice(-MAX_RECENT_MESSAGES_KEPT).map(m => m.id),
          },
        },
      });
    }

    logger.info('Chat history compressed', { openid, summaryLength: summary.length });
    return summary;
  }

  private async generateSummary(messages: ChatMessageRecord[]): Promise<string> {
    const conversationText = messages
      .map(m => `${m.role === 'user' ? '用户' : 'AI'}：${m.content}`)
      .join('\n');

    return `对话摘要（${messages.length}条消息）：${conversationText.substring(0, 500)}...`;
  }

  async clearHistory(openid: string): Promise<void> {
    await prisma.chatMessage.deleteMany({
      where: { openid },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.chatHistory.updateMany({
      where: {
        openid,
        sessionDate: today,
      },
      data: {
        summary: null,
      },
    });

    logger.info('Chat history cleared', { openid });
  }

  async getHistorySummary(openid: string): Promise<{ date: string; summary: string | null; messageCount: number }[]> {
    const histories = await prisma.chatHistory.findMany({
      where: { openid },
      orderBy: { sessionDate: 'desc' },
      take: 7,
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    return histories.map(h => ({
      date: h.sessionDate.toISOString().split('T')[0],
      summary: h.summary,
      messageCount: h._count.messages,
    }));
  }
}

export const chatHistoryService = new ChatHistoryService();