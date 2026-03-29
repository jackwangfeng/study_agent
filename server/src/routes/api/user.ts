import { Router } from 'express';
import { userService } from '../../services/user.js';

const router = Router();

router.get('/me', async (req, res) => {
  try {
    const openid = req.headers['x-wechat-openid'] as string;
    if (!openid) {
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }

    const user = await userService.getOrCreateUser(openid);
    return res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    return res.status(500).json({ code: 500, message: 'Internal error' });
  }
});

router.put('/me', async (req, res) => {
  try {
    const openid = req.headers['x-wechat-openid'] as string;
    if (!openid) {
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }

    const user = await userService.updateUser(openid, req.body);
    return res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ code: 500, message: 'Internal error' });
  }
});

router.post('/bind-parent', async (req, res) => {
  try {
    const openid = req.headers['x-wechat-openid'] as string;
    if (!openid) {
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }

    const { bindCode } = req.body;
    if (!bindCode) {
      return res.status(400).json({ code: 400, message: 'Missing bindCode' });
    }

    const user = await userService.getOrCreateUser(openid);
    await userService.updateUser(openid, { parentOpenid: bindCode });

    return res.json({ success: true });
  } catch (error) {
    console.error('Error binding parent:', error);
    return res.status(500).json({ code: 500, message: 'Internal error' });
  }
});

export default router;
