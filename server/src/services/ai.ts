import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { chatHistoryService } from './chatHistory.js';
import axios from 'axios';

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

const MOCK_REPLIES = [
  '学习路上偶尔遇到困难很正常呀，重要的是你愿意面对它 🌟',
  '别灰心！每一次挫折都是成长的机会哦 💪',
  '听起来你最近压力有点大，要不要先休息一下再继续？',
  '我理解你的感受，让我们一起想办法解决吧～',
  '记得给自己一点鼓励，你比自己想象的更厉害！',
];

export class AIService {
  private defaultSystemPrompt = `你是智学伴，一个高中生的AI学习伙伴。你的特点是：
1. 温暖、耐心、像朋友一样对话
2. 讲解题目时用引导式提问，而不是直接给答案
3. 理解高中生的压力和焦虑，给予适当鼓励
4. 语言简洁生动，符合高中生习惯
5. 如果有对话历史摘要，需要基于之前的上下文保持连贯

记住：你是伙伴，不是老师。`;

  private isConfigured(): boolean {
    return !!config.google.apiKey || !!config.openai.apiKey;
  }

  async chat(openid: string, messages: ChatMessage[]): Promise<ChatResult> {
    try {
      if (config.google.apiKey) {
        return await this.chatWithGoogle(openid, messages);
      }

      if (config.openai.apiKey) {
        return await this.chatWithOpenAI(openid, messages);
      }

      logger.warn('AI service not configured, returning mock response');
      const lastMessage = messages[messages.length - 1]?.content || '';
      const mockReply = this.getMockReply(lastMessage);
      return {
        reply: mockReply,
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      };
    } catch (error) {
      logger.error('AI chat failed, using mock reply', { error });
      const lastMessage = messages[messages.length - 1]?.content || '';
      return {
        reply: this.getMockReply(lastMessage),
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      };
    }
  }

  async chatWithHistory(
    openid: string,
    newMessage: string,
    messageType: string = 'general'
  ): Promise<ChatResult> {
    const shouldCompress = await chatHistoryService.shouldSummarize(openid);

    if (shouldCompress) {
      await chatHistoryService.compressHistory(openid);
    }

    const historySummary = await chatHistoryService.getOrCreateTodayHistory(openid);
    const recentMessages = await chatHistoryService.getMessagesForContext(openid);

    let messagesToSend: ChatMessage[] = [];

    if (historySummary.summary) {
      messagesToSend.push({
        role: 'system',
        content: `之前对话摘要：${historySummary.summary}\n\n请基于摘要和以下对话继续。`
      });
    }

    messagesToSend.push(...recentMessages.map(m => ({ role: m.role as ChatMessage['role'], content: m.content })));

    if (messageType === 'emotional') {
      messagesToSend.push({
        role: 'system',
        content: '这是一个情感支持对话，请用温暖、耐心的方式回复。'
      });
    }

    messagesToSend.push({ role: 'user', content: newMessage });

    const result = await this.chat(openid, messagesToSend);

    await chatHistoryService.addMessage(openid, 'user', newMessage, messageType);
    await chatHistoryService.addMessage(openid, 'assistant', result.reply, messageType);

    return result;
  }

  private getMockReply(userMessage: string): string {
    const lower = userMessage.toLowerCase();
    if (lower.includes('考砸') || lower.includes('考试')) {
      return '考试只是检验学习效果的一种方式，考砸了说明还有提升空间呢！📚 与其自责，不如我们一起分析一下哪些知识点还没掌握，下次一定能进步！';
    }
    if (lower.includes('累') || lower.includes('休息')) {
      return '学习确实很累人的～适当的休息很重要！🛋️ 不如站起来动一动，或者听听音乐放松一下，休息好了学习效率会更高的！';
    }
    if (lower.includes('数学') || lower.includes('题')) {
      return '遇到难题很正常呀！🤔 不如先把题目拆解一下，看看哪一步卡住了？我可以帮你分析思路，但答案要你自己想出来才有成就感哦～';
    }
    if (lower.includes('压力') || lower.includes('焦虑')) {
      return '高中压力确实大，我理解你的感受。🌟 试试深呼吸几次，告诉自己"我能行"！你现在的努力一定会有回报的。';
    }
    const randomIndex = Math.floor(Math.random() * MOCK_REPLIES.length);
    return MOCK_REPLIES[randomIndex];
  }

  private async chatWithGoogle(openid: string, messages: ChatMessage[]): Promise<ChatResult> {
    try {
      const contents = messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const proxyUrl = process.env.https_proxy || process.env.HTTPS_PROXY || process.env.http_proxy;
      let proxyConfig: Record<string, unknown> = {};
      if (proxyUrl) {
        const url = new URL(proxyUrl);
        proxyConfig = {
          proxy: {
            host: url.hostname,
            port: parseInt(url.port, 10),
            protocol: url.protocol.replace(':', ''),
          },
        };
      }

      const response = await axios.post(
        `${config.google.baseURL}/gemini-2.5-flash:generateContent?key=${config.google.apiKey}`,
        {
          contents,
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1000,
          },
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000,
          ...proxyConfig,
        }
      );

      if (response.status !== 200) {
        const error = response.data;
        logger.error('Google AI error', { status: response.status, error });
        throw new Error(`Google AI failed: ${response.status}`);
      }

      const data = response.data as { candidates?: { content?: { parts?: { text?: string[] }[] } }[] };
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      logger.info('Google AI chat completed', { openid, replyLength: reply.length });

      return {
        reply,
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      };
    } catch (error) {
      logger.error('Google AI chat failed', { openid, error });
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          reply: '抱歉，AI服务响应超时，请稍后再试。',
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        };
      }
      throw error;
    }
  }

  private async chatWithOpenAI(openid: string, messages: ChatMessage[]): Promise<ChatResult> {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({
      apiKey: config.openai.apiKey,
      baseURL: config.openai.baseURL,
    });

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

      logger.info('OpenAI chat completed', {
        openid,
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
      logger.error('OpenAI chat failed', { openid, error });
      throw error;
    }
  }

  async extractKnowledgePoint(question: string): Promise<string | null> {
    try {
      const result = await this.chat('system', [
        { role: 'user', content: `请从以下题目中提取一个高中知识点名称（只输出知识点名称，不要其他内容）：\n\n${question}` },
      ]);
      return result.reply.trim() || null;
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

    const response = await this.chat('system', [
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