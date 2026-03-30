import { Router } from 'express';
import { userService } from '../../services/user.js';

const router = Router();

const MOCK_USER = {
  openid: 'mock_openid_12345',
  userType: 'student',
  nickname: '测试同学',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student',
  grade: 2,
  subjects: ['数学', '物理', '英语'],
  membershipLevel: 'monthly',
  membershipExpireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  examDate: '2027-06-07',
};

router.post('/mock-login', async (req, res) => {
  try {
    const user = await userService.getOrCreateUser(MOCK_USER.openid);

    if (!user.nickname) {
      await userService.updateUser(MOCK_USER.openid, {
        nickname: MOCK_USER.nickname,
        avatar: MOCK_USER.avatar,
        grade: MOCK_USER.grade,
        subjects: MOCK_USER.subjects,
        membershipLevel: MOCK_USER.membershipLevel,
        membershipExpireAt: new Date(MOCK_USER.membershipExpireAt),
      });
    }

    const updatedUser = await userService.getOrCreateUser(MOCK_USER.openid);

    return res.json({
      code: 200,
      data: {
        ...updatedUser,
        mockOpenid: MOCK_USER.openid,
      },
    });
  } catch (error) {
    console.error('Mock login error:', error);
    return res.status(500).json({ code: 500, message: 'Mock login failed' });
  }
});

export default router;