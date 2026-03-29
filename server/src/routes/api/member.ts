import { Router } from 'express';
import { memberService } from '../../services/member.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const openid = req.headers['x-wechat-openid'] as string;
    if (!openid) {
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }

    const membership = await memberService.getMembership(openid);
    return res.json(membership);
  } catch (error) {
    console.error('Error getting membership:', error);
    return res.status(500).json({ code: 500, message: 'Internal error' });
  }
});

router.get('/products', async (req, res) => {
  try {
    const products = await memberService.getProducts();
    return res.json(products);
  } catch (error) {
    console.error('Error getting products:', error);
    return res.status(500).json({ code: 500, message: 'Internal error' });
  }
});

router.post('/purchase', async (req, res) => {
  try {
    const openid = req.headers['x-wechat-openid'] as string;
    if (!openid) {
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }

    const { productId } = req.body;
    if (!['monthly', 'quarterly', 'yearly'].includes(productId)) {
      return res.status(400).json({ code: 400, message: 'Invalid product' });
    }

    const result = await memberService.purchaseMembership(openid, productId as 'monthly' | 'quarterly' | 'yearly');
    return res.json(result);
  } catch (error) {
    console.error('Error purchasing membership:', error);
    return res.status(500).json({ code: 500, message: 'Internal error' });
  }
});

export default router;
