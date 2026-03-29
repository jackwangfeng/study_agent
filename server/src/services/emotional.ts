import { aiService } from './ai.js';
import { buildEmotionalPrompt } from '../prompts/emotional.js';
import { prisma } from '../prisma/index.js';

export type EmotionStatus = 'positive' | 'neutral' | 'negative';

export interface EmotionResult {
  emotion: EmotionStatus;
  reply: string;
  suggestions: string[];
}

const emotionKeywords: Record<EmotionStatus, string[]> = {
  positive: ['开心', '高兴', '进步', '成功', '厉害', '棒', '不错', '好开心', '太棒了', '有动力'],
  negative: ['考砸', '退步', '失败', '焦虑', '压力', '累', '烦', '不想学', '放弃', '绝望', '难过', '伤心'],
  neutral: [],
};

const emotionResponses: Record<EmotionStatus, string[]> = {
  positive: [
    '太好了！继续保持这个状态，你真的很棒！💪',
    '进步让人开心！有什么学习方法想和我分享吗？',
    '厉害！你的努力被看到了～',
  ],
  negative: [
    '我理解你的感受。考试只是检验学习的一种方式，不是定义你的全部。',
    '累了就休息一下，偶尔放松不会影响学习的。',
    '焦虑的时候，可以试试深呼吸，或者和我聊聊？',
  ],
  neutral: [
    '今天怎么样？有什么想和我分享的吗？',
    '学习上有什么困难吗？我可以帮你。',
    '想聊聊吗？我随时都在。',
  ],
};

export class EmotionalService {
  detectEmotion(message: string): EmotionStatus {
    const lower = message.toLowerCase();

    for (const keyword of emotionKeywords.positive) {
      if (lower.includes(keyword)) return 'positive';
    }
    for (const keyword of emotionKeywords.negative) {
      if (lower.includes(keyword)) return 'negative';
    }
    return 'neutral';
  }

  async provideSupport(message: string, userOpenid: string): Promise<EmotionResult> {
    const emotion = this.detectEmotion(message);

    const systemPrompt = buildEmotionalPrompt(message, emotion);
    const result = await aiService.chat([{ role: 'user', content: systemPrompt }]);

    await this.recordEmotion(userOpenid, emotion);

    const suggestions = this.getSuggestions(emotion);

    return {
      emotion,
      reply: result.reply,
      suggestions,
    };
  }

  async examPostmortem(userOpenid: string, examResult: string): Promise<string> {
    const prompt = `用户刚考试结束，考试成绩/情况是：${examResult}

请给用户一些考后复盘的建议：
1. 先共情，不要批评
2. 客观分析问题
3. 给出具体的改进建议
4. 保持鼓励的态度`;

    const result = await aiService.chat([{ role: 'user', content: prompt }]);
    return result.reply;
  }

  async motivate(userOpenid: string): Promise<string> {
    const motivations = [
      '学习是一场马拉松，不是短跑。坚持下去的才是赢家！🏃‍♂️',
      '每解决一道难题，你就比昨天的自己更强一点。💪',
      '累了就休息，但别放弃。你已经在努力了，这本身就值得骄傲。',
      '记住：现在的每一分努力，都是在为自己的未来铺路。📚',
      '遇到困难是正常的，这说明你在进步。突破它！',
    ];

    const randomIndex = Math.floor(Math.random() * motivations.length);
    return motivations[randomIndex];
  }

  private getSuggestions(emotion: EmotionStatus): string[] {
    switch (emotion) {
      case 'positive':
        return ['继续保持', '挑战更难的题目', '复习巩固一下'];
      case 'negative':
        return ['休息一下', '去运动放松', '找我聊聊', '听首歌'];
      default:
        return ['制定今日计划', '复习薄弱点', '开始学习'];
    }
  }

  async recordEmotion(openid: string, emotion: EmotionStatus): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.studyRecord.upsert({
      where: {
        openid_recordDate: {
          openid,
          recordDate: today,
        },
      },
      update: {
        emotionStatus: emotion,
      },
      create: {
        openid,
        recordDate: today,
        emotionStatus: emotion,
        records: [],
      },
    });
  }
}

export const emotionalService = new EmotionalService();
