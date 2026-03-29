import { Router } from 'express';
import { studyService } from '../../services/study.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const openid = req.headers['x-wechat-openid'] as string;
    if (!openid) {
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }

    const { subject, status, page, pageSize } = req.query;
    const result = await studyService.getQuestions(openid, {
      subject: subject as string,
      status: status as string,
      page: page ? parseInt(page as string) : undefined,
      pageSize: pageSize ? parseInt(pageSize as string) : undefined,
    });

    return res.json(result);
  } catch (error) {
    console.error('Error getting questions:', error);
    return res.status(500).json({ code: 500, message: 'Internal error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const openid = req.headers['x-wechat-openid'] as string;
    if (!openid) {
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }

    const question = await studyService.createQuestion({
      openid,
      ...req.body,
    });

    return res.json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    return res.status(500).json({ code: 500, message: 'Internal error' });
  }
});

router.get('/weak-points', async (req, res) => {
  try {
    const openid = req.headers['x-wechat-openid'] as string;
    if (!openid) {
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }

    const { subject } = req.query;
    const weakPoints = await studyService.getWeakPoints(openid, subject as string);

    return res.json({ weakPoints });
  } catch (error) {
    console.error('Error getting weak points:', error);
    return res.status(500).json({ code: 500, message: 'Internal error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const question = await studyService.getQuestionById(req.params.id);
    if (!question) {
      return res.status(404).json({ code: 404, message: 'Question not found' });
    }
    return res.json(question);
  } catch (error) {
    console.error('Error getting question:', error);
    return res.status(500).json({ code: 500, message: 'Internal error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await studyService.deleteQuestion(req.params.id);
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting question:', error);
    return res.status(500).json({ code: 500, message: 'Internal error' });
  }
});

router.post('/:id/master', async (req, res) => {
  try {
    const question = await studyService.markAsMastered(req.params.id);
    return res.json(question);
  } catch (error) {
    console.error('Error marking question as mastered:', error);
    return res.status(500).json({ code: 500, message: 'Internal error' });
  }
});

export default router;
