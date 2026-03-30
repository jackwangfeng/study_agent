import { Router } from 'express';
import userRouter from './user.js';
import questionRouter from './question.js';
import aiRouter from './ai.js';
import planRouter from './plan.js';
import emotionalRouter from './emotional.js';
import parentRouter from './parent.js';
import memberRouter from './member.js';
import authRouter from './auth.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/questions', questionRouter);
router.use('/ai', aiRouter);
router.use('/plans', planRouter);
router.use('/emotional', emotionalRouter);
router.use('/parent', parentRouter);
router.use('/membership', memberRouter);

export default router;