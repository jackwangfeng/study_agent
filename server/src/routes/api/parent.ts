import { Router } from 'express';
import { parentService } from '../../services/parent.js';

const router = Router();

router.post('/bind', async (req, res) => {
  try {
    const openid = req.headers['x-wechat-openid'] as string;
    if (!openid) {
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }

    const { bindCode, relation } = req.body;
    await parentService.bindChild(openid, bindCode, relation);

    return res.json({ success: true });
  } catch (error) {
    console.error('Error binding child:', error);
    return res.status(400).json({ code: 400, message: error instanceof Error ? error.message : 'Bind failed' });
  }
});

router.get('/bind-code', async (req, res) => {
  try {
    const openid = req.headers['x-wechat-openid'] as string;
    if (!openid) {
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }

    const result = await parentService.generateBindCode(openid);

    return res.json({
      bindCode: result.bindCode,
      expireAt: result.expireAt.toISOString(),
    });
  } catch (error) {
    console.error('Error generating bind code:', error);
    return res.status(500).json({ code: 500, message: 'Internal error' });
  }
});

router.get('/children', async (req, res) => {
  try {
    const openid = req.headers['x-wechat-openid'] as string;
    if (!openid) {
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }

    const children = await parentService.getChildren(openid);

    return res.json(children);
  } catch (error) {
    console.error('Error getting children:', error);
    return res.status(500).json({ code: 500, message: 'Internal error' });
  }
});

router.get('/children/:childOpenid/report', async (req, res) => {
  try {
    const { childOpenid } = req.params;
    const report = await parentService.generateWeeklyReport(childOpenid);

    return res.json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    return res.status(500).json({ code: 500, message: 'Internal error' });
  }
});

router.put('/notify-settings', async (req, res) => {
  try {
    const openid = req.headers['x-wechat-openid'] as string;
    if (!openid) {
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }

    const { notifyEnabled, weeklyReportDay, abnormalAlert } = req.body;
    await parentService.updateNotifySettings(openid, {
      notifyEnabled,
      weeklyReportDay,
      abnormalAlert,
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Error updating notify settings:', error);
    return res.status(500).json({ code: 500, message: 'Internal error' });
  }
});

export default router;
