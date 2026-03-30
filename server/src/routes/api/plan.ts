import { Router } from 'express';
import { plannerService } from '../../services/planner.js';

const router = Router();

router.get('/today', async (req, res) => {
  try {
    const openid = req.headers['x-wechat-openid'] as string;
    if (!openid) {
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }

    const plan = await plannerService.getTodayPlan(openid);
    return res.json({ code: 200, data: plan });
  } catch (error) {
    console.error('Error getting today plan:', error);
    return res.status(500).json({ code: 500, message: 'Internal error' });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const openid = req.headers['x-wechat-openid'] as string;
    if (!openid) {
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }

    const { focusSubjects, availableMinutes, customGoal } = req.body;
    const plan = await plannerService.generateTodayPlan(openid, focusSubjects, availableMinutes, customGoal);
    return res.json({ code: 200, data: plan });
  } catch (error) {
    console.error('Error generating plan:', error);
    return res.status(500).json({ code: 500, message: 'Internal error' });
  }
});

router.put('/items/:itemId/complete', async (req, res) => {
  try {
    const openid = req.headers['x-wechat-openid'] as string;
    if (!openid) {
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }

    const { itemId } = req.params;
    const { completedCount, actualMinutes } = req.body;
    const plan = await plannerService.completePlanItem(openid, itemId, completedCount, actualMinutes);
    return res.json({ code: 200, data: plan });
  } catch (error) {
    console.error('Error completing plan item:', error);
    return res.status(500).json({ code: 500, message: 'Internal error' });
  }
});

router.post('/tomato/start', async (req, res) => {
  try {
    const openid = req.headers['x-wechat-openid'] as string;
    if (!openid) {
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }

    const { planItemId, subject } = req.body;
    const result = await plannerService.startTomatoClock(openid, planItemId, subject);
    return res.json({
      code: 200,
      data: {
        tomatoId: result.tomatoId,
        startTime: new Date().toISOString(),
        endTime: result.endTime.toISOString(),
        duration: 25,
      },
    });
  } catch (error) {
    console.error('Error starting tomato clock:', error);
    return res.status(500).json({ code: 500, message: 'Internal error' });
  }
});

router.post('/tomato/:tomatoId/complete', async (req, res) => {
  try {
    const openid = req.headers['x-wechat-openid'] as string;
    if (!openid) {
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }

    const { tomatoId } = req.params;
    const { result } = req.body;
    const stats = await plannerService.completeTomatoClock(openid, tomatoId, result);
    return res.json({ code: 200, data: stats });
  } catch (error) {
    console.error('Error completing tomato clock:', error);
    return res.status(500).json({ code: 500, message: 'Internal error' });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const openid = req.headers['x-wechat-openid'] as string;
    if (!openid) {
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }

    const summary = await plannerService.generateDailySummary(openid);
    const plan = await plannerService.getTodayPlan(openid);

    return res.json({
      code: 200,
      data: {
        date: new Date().toISOString().split('T')[0],
        totalMinutes: plan?.totalMinutes || 0,
        tomatoCount: plan?.tomatoCount || 0,
        completedItems: plan?.items.filter((i) => i.status === 'completed').length || 0,
        totalItems: plan?.items.length || 0,
        summary,
      },
    });
  } catch (error) {
    console.error('Error getting summary:', error);
    return res.status(500).json({ code: 500, message: 'Internal error' });
  }
});

export default router;