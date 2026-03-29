import OpenAI from 'openai';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
  baseURL: config.openai.baseURL,
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResult {
  reply: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class AIService {
  private defaultSystemPrompt = `你是智学伴，一个高中生的AI学习伙伴。你的特点是：
1. 温暖、耐心、像朋友一样对话
2. 讲解题目时用引导式提问，而不是直接给答案
3. 理解高中生的压力和焦虑，给予适当鼓励
4. 语言简洁生动，符合高中生习惯

记住：你是伙伴，不是老师。`;

  async chat(messages: ChatMessage[]): Promise<ChatResult> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: this.defaultSystemPrompt },
          ...messages,
        ],
        temperature: 0.8,
        max_tokens: 1000,
      });

      const reply = response.choices[0]?.message?.content || '';
      const usage = response.usage;

      logger.info('AI chat completed', {
        promptTokens: usage?.prompt_tokens,
        completionTokens: usage?.completion_tokens,
      });

      return {
        reply,
        usage: usage ? {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      logger.error('AI chat failed', { error });
      throw error;
    }
  }

  async extractKnowledgePoint(question: string): Promise<string | null> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个高中知识点分类器。用户会给你一道题目，你需要输出这道题所属的知识点名称（只需要输出知识点名称，不需要其他内容）。例如：二次函数、三角函数、平面几何、氧化还原反应等。',
          },
          {
            role: 'user',
            content: question,
          },
        ],
        temperature: 0,
        max_tokens: 50,
      });

      return response.choices[0]?.message?.content?.trim() || null;
    } catch (error) {
      logger.error('Extract knowledge point failed', { error });
      return null;
    }
  }

  async explainQuestion(
    question: string,
    doubt: string,
    conversationHistory: { role: 'user' | 'assistant'; content: string }[]
  ): Promise<{ explanation: string; isCompleted: boolean; nextQuestion?: string }> {
    const historyMessages: ChatMessage[] = conversationHistory.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await this.chat([
      ...historyMessages,
      {
        role: 'user',
        content: `题目：${question}\n\n学生的疑惑点：${doubt}\n\n请用引导式的方式讲解这道题，让学生自己思考出答案。不要直接给答案，而是通过提问引导思考。`,
      },
    ]);

    const reply = response.reply;

    if (reply.includes('懂了') || reply.includes('明白了') || reply.includes('理解了')) {
      return { explanation: reply, isCompleted: true };
    }

    const nextQuestionMatch = reply.match(/你能告诉我(.*?)吗/);
    const nextQuestion = nextQuestionMatch ? nextQuestionMatch[0] : undefined;

    return {
      explanation: reply,
      isCompleted: false,
      nextQuestion,
    };
  }
}

export const aiService = new AIService();
