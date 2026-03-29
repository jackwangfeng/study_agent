import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '../services/user.js';

vi.mock('../prisma/index.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    vi.clearAllMocks();
  });

  describe('getOrCreateUser', () => {
    it('should return existing user if found', async () => {
      const mockUser = {
        id: '123',
        openid: 'test-openid',
        userType: 'student',
        membershipLevel: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { prisma } = await import('../prisma/index.js');
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      const result = await userService.getOrCreateUser('test-openid');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { openid: 'test-openid' },
      });
    });

    it('should create new user if not found', async () => {
      const newUser = {
        id: '123',
        openid: 'new-openid',
        userType: 'student',
        membershipLevel: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { prisma } = await import('../prisma/index.js');
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(newUser);

      const result = await userService.getOrCreateUser('new-openid');

      expect(result).toEqual(newUser);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          openid: 'new-openid',
          userType: 'student',
          membershipLevel: 'free',
        },
      });
    });
  });

  describe('updateUser', () => {
    it('should update user profile', async () => {
      const updatedUser = {
        id: '123',
        openid: 'test-openid',
        nickname: '小明',
        grade: 2,
        userType: 'student',
        membershipLevel: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { prisma } = await import('../prisma/index.js');
      vi.mocked(prisma.user.update).mockResolvedValue(updatedUser);

      const result = await userService.updateUser('test-openid', {
        nickname: '小明',
        grade: 2,
      });

      expect(result.nickname).toBe('小明');
      expect(result.grade).toBe(2);
    });
  });
});
