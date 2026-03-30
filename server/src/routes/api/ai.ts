import { Router } from 'express';
import { aiService } from '../../services/ai.js';
import { studyService } from '../../services/study.js';
import { chatHistoryService } from '../../services/chatHistory.js';

const router = Router();

router.post('/chat', async (req, res) => {
  try {
    const openid = req.headers['x-wechat-openid'] as string;
    if (!openid) {
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }

    const { message, type } = req.body;

    const result = await aiService.chatWithHistory(openid, message, type);

    const detectedEmotion = detectEmotion(message);

    return res.json({
      code: 200,
      data: {
        reply: result.reply,
        detectedEmotion,
        suggestedActions: getSuggestedActions(detectedEmotion),
      },
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    return res.status(500).json({ code: 500, message: 'Internal error' });
  }
});

router.post('/explain/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    const { doubt, conversationHistory } = req.body;

    const question = await studyService.getQuestionById(questionId);
    if (!question) {
      return res.status(404).json({ code: 404, message: 'Question not found' });
    }

    const result = await aiService.explainQuestion(
      question.questionText || '',
      doubt,
      conversationHistory || []
    );

    await studyService.addExplanation(questionId, doubt, result.explanation, result.isCompleted);

    return res.json({ code: 200, data: result });
  } catch (error) {
    console.error('Error explaining question:', error);
    return res.status(500).json({ code: 500, message: 'Internal error' });
  }
});

router.post('/extract-knowledge', async (req, res) => {
  try {
    const { question } = req.body;
    const knowledgePoint = await aiService.extractKnowledgePoint(question);
    return res.json({ code: 200, data: { knowledgePoint } });
  } catch (error) {
    console.error('Error extracting knowledge point:', error);
    return res.status(500).json({ code: 500, message: 'Internal error' });
  }
});

router.delete('/conversation', async (req, res) => {
  try {
    const openid = req.headers['x-wechat-openid'] as string;
    if (!openid) {
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }

    await chatHistoryService.clearHistory(openid);
    return res.json({ code: 200, message: 'Conversation cleared' });
  } catch (error) {
    console.error('Error clearing conversation:', error);
    return res.status(500).json({ code: 500, message: 'Internal error' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const openid = req.headers['x-wechat-openid'] as string;
    if (!openid) {
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }

    const history = await chatHistoryService.getHistorySummary(openid);
    return res.json({ code: 200, data: { history } });
  } catch (error) {
    console.error('Error getting history:', error);
    return res.status(500).json({ code: 500, message: 'Internal error' });
  }
});

function detectEmotion(message: string): 'positive' | 'neutral' | 'negative' {
  const lower = message.toLowerCase();
  const positiveWords = ['开心', '进步', '成功', '厉害', '棒', '不错', '好开心'];
  const negativeWords = ['考砸', '退步', '失败', '焦虑', '压力', '累', '烦', '不想学', '放弃'];

  if (negativeWords.some((w) => lower.includes(w))) {
    return 'negative';
  }
  if (positiveWords.some((w) => lower.includes(w))) {
    return 'positive';
  }
  return 'neutral';
}

function getSuggestedActions(emotion: string): string[] {
  if (emotion === 'negative') {
    return ['去跑步放松一下', '找我聊聊', '休息一会儿'];
  }
  if (emotion === 'positive') {
    return ['继续保持', '挑战更难的题', '复习一下错题'];
  }
  return ['制定今日计划', '复习薄弱点', '开始学习'];
}

export default router;