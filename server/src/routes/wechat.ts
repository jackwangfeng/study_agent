import { Router } from 'express';
import { config } from '../config/index.js';
import { verifySignature, parseWechatMessage, formatWechatResponse, getReplyByKeyword } from '../utils/wechat.js';
import { logger } from '../utils/logger.js';

const router = Router();

router.get('/', (req, res) => {
  const { signature, timestamp, nonce, echostr } = req.query;

  if (!signature || !timestamp || !nonce) {
    return res.status(400).send('Missing parameters');
  }

  const isValid = verifySignature(
    config.wechat.token,
    timestamp as string,
    nonce as string,
    signature as string
  );

  if (isValid) {
    logger.info('Wechat signature verified successfully');
    return res.send(echostr);
  }

  logger.warn('Wechat signature verification failed');
  return res.status(403).send('Signature verification failed');
});

router.post('/', (req, res) => {
  const xml = req.body.xml || {};

  const msgType = xml.MsgType?.[0] || 'text';
  const fromUserName = xml.FromUserName?.[0] || '';
  const toUserName = xml.ToUserName?.[0] || '';
  const content = xml.Content?.[0] || '';

  logger.info('Received wechat message', { msgType, fromUserName, content });

  let reply = '';

  if (msgType === 'text') {
    const keywordReply = getReplyByKeyword(content);
    if (keywordReply) {
      reply = keywordReply;
    } else {
      reply = `收到你的消息："${content}"

作为学习伙伴，我目前可以帮你：
- 📷 拍题：发送"拍题"然后上传错题照片
- 📅 今日计划：发送"今日计划"获取学习任务
- ❓ 帮助：发送"帮助"查看所有功能

有学习问题随时问我哦～`;
    }
  } else if (msgType === 'image') {
    reply = '收到你的图片！请告诉我这道题你哪里不懂～（发送"拍题"开始）';
  } else if (msgType === 'event') {
    const event = xml.Event?.[0] || '';
    if (event === 'subscribe') {
      reply = `欢迎关注智学伴！🎉

我是你的AI学习伙伴，陪你搞定每一道错题，见证每一次进步。

发送"帮助"查看我能帮你做什么～`;
    } else if (event === 'unsubscribe') {
      reply = '';
    }
  }

  const response = formatWechatResponse(fromUserName, toUserName, reply);
  res.set('Content-Type', 'text/xml');
  res.send(response);
});

export default router;
