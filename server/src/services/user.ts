import { prisma } from '../prisma/index.js';
import type { User } from '@prisma/client';

export interface CreateUserParams {
  openid: string;
  userType?: 'student' | 'parent';
}

export interface UpdateUserParams {
  nickname?: string;
  avatar?: string;
  grade?: number;
  subjects?: string[];
  examDate?: Date;
  membershipLevel?: string;
  membershipExpireAt?: Date;
  parentOpenid?: string;
}

export class UserService {
  async getOrCreateUser(openid: string): Promise<User> {
    let user = await prisma.user.findUnique({
      where: { openid },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          openid,
          userType: 'student',
          membershipLevel: 'free',
        },
      });
    }

    return user;
  }

  async getUserByOpenid(openid: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { openid },
    });
  }

  async updateUser(openid: string, params: UpdateUserParams): Promise<User> {
    return prisma.user.update({
      where: { openid },
      data: params,
    });
  }

  async bindParent(studentOpenid: string, parentOpenid: string): Promise<User> {
    return prisma.user.update({
      where: { openid: studentOpenid },
      data: { parentOpenid },
    });
  }

  async getChildren(parentOpenid: string): Promise<User[]> {
    return prisma.user.findMany({
      where: { parentOpenid },
    });
  }
}

export const userService = new UserService();
