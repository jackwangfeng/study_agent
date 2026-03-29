import crypto from 'crypto';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export function verifySignature(token: string, timestamp: string, nonce: string, signature: string): boolean {
  const arr = [token, timestamp, nonce].sort();
  const str = arr.join('');
  const hash = crypto.createHash('sha1').update(str).digest('hex');
  return hash === signature;
}

export function parseWechatMessage(xml: string): Record<string, string> {
  const result: Record<string, string> = {};
  const regex = /<(\w+)><!\[CDATA\[(.*?)\]\]><\/(\w+)>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    result[match[1]] = match[2];
  }
  return result;
}

export function formatWechatResponse(toUserName: string, fromUserName: string, content: string): string {
  const createTime = Math.floor(Date.now() / 1000).toString();
  return `<xml>
<ToUserName><![CDATA[${toUserName}]]></ToUserName>
<FromUserName><![CDATA[${fromUserName}]]></FromUserName>
<CreateTime>${createTime}</CreateTime>
<MsgType><![CDATA[text]]></MsgType>
<Content><![CDATA[${content}]]></Content>
</xml>`;
}

export function getReplyByKeyword(content: string): string | null {
  const lowerContent = content.toLowerCase();

  if (lowerContent.includes('拍题') || lowerContent.includes('上传错题')) {
    return '好的，请发送错题照片，我会帮你识别并保存～';
  }
  if (lowerContent.includes('今日计划') || lowerContent.includes('学习计划')) {
    return '我来帮你制定今日学习计划，请稍等...';
  }
  if (lowerContent.includes('帮助') || lowerContent === 'help' || lowerContent === '？') {
    return `欢迎使用智学伴！我可以帮你：

📷 拍题 - 上传错题照片，我来帮你讲解
📅 今日计划 - 获取今日学习计划
❓ 帮助 - 查看所有功能

有什么学习上的问题都可以问我哦～`;
  }

  return null;
}
