import { Router } from 'express';
import userRouter from './user.js';
import questionRouter from './question.js';
import aiRouter from './ai.js';
import planRouter from './plan.js';

const router = Router();

router.use('/users', userRouter);
router.use('/questions', questionRouter);
router.use('/ai', aiRouter);
router.use('/plans', planRouter);

export default router;
