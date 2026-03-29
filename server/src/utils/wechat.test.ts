import { describe, it, expect } from 'vitest';
import { verifySignature, getReplyByKeyword } from '../utils/wechat.js';

describe('Wechat Utils', () => {
  describe('verifySignature', () => {
    it('should return true for valid signature', () => {
      const token = 'test-token';
      const timestamp = '1234567890';
      const nonce = 'random-nonce';
      const signature = require('crypto')
        .createHash('sha1')
        .update([token, timestamp, nonce].sort().join(''))
        .digest('hex');

      expect(verifySignature(token, timestamp, nonce, signature)).toBe(true);
    });

    it('should return false for invalid signature', () => {
      expect(verifySignature('token', '123', '456', 'invalid')).toBe(false);
    });
  });

  describe('getReplyByKeyword', () => {
    it('should return correct reply for 拍题', () => {
      const reply = getReplyByKeyword('拍题');
      expect(reply).toContain('错题照片');
    });

    it('should return correct reply for 帮助', () => {
      const reply = getReplyByKeyword('帮助');
      expect(reply).toContain('智学伴');
    });

    it('should return null for unknown keywords', () => {
      const reply = getReplyByKeyword('今天吃什么');
      expect(reply).toBeNull();
    });
  });
});
