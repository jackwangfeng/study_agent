import { Router } from 'express';
import { emotionalService } from '../../services/emotional.js';

const router = Router();

router.post('/chat', async (req, res) => {
  try {
    const openid = req.headers['x-wechat-openid'] as string;
    if (!openid) {
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }

    const { message } = req.body;
    const result = await emotionalService.provideSupport(message, openid);

    return res.json(result);
  } catch (error) {
    console.error('Error in emotional chat:', error);
    return res.status(500).json({ code: 500, message: 'Internal error' });
  }
});

router.post('/motivate', async (req, res) => {
  try {
    const openid = req.headers['x-wechat-openid'] as string;
    if (!openid) {
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }

    const motivation = await emotionalService.motivate(openid);
    return res.json({ reply: motivation });
  } catch (error) {
    console.error('Error in motivate:', error);
    return res.status(500).json({ code: 500, message: 'Internal error' });
  }
});

router.post('/exam-postmortem', async (req, res) => {
  try {
    const openid = req.headers['x-wechat-openid'] as string;
    if (!openid) {
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }

    const { examResult } = req.body;
    const reply = await emotionalService.examPostmortem(openid, examResult);

    return res.json({ reply });
  } catch (error) {
    console.error('Error in exam postmortem:', error);
    return res.status(500).json({ code: 500, message: 'Internal error' });
  }
});

router.post('/emotion', async (req, res) => {
  try {
    const openid = req.headers['x-wechat-openid'] as string;
    if (!openid) {
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }

    const { status, note } = req.body;
    await emotionalService.recordEmotion(openid, status);

    return res.json({ success: true });
  } catch (error) {
    console.error('Error recording emotion:', error);
    return res.status(500).json({ code: 500, message: 'Internal error' });
  }
});

export default router;
