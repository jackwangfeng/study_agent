import { View, Text, ScrollView } from '@tarojs/components';
import { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store';
import './index.scss';

const EMOJI_MAP: Record<string, string> = {
  positive: '😊',
  neutral: '😐',
  negative: '😢',
};

const SUGGESTIONS = [
  '今天考试考砸了，心情不好',
  '学习太累了，想休息一下',
  '这道数学题不会做',
  '给我讲个学习小技巧',
  '最近学习效率很低',
];

export default function Chat() {
  const { chatHistory, sendChatMessage, fetchUser } = useStore();
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState<string | null>(null);
  const scrollRef = useRef<any>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView?.({ behavior: 'smooth' });
      }, 100);
    }
  }, [chatHistory]);

  async function handleSendDirect(message: string) {
    if (!message.trim() || sending) return;

    setInputValue('');
    setSending(true);

    try {
      await sendChatMessage(message, 'emotional');
    } finally {
      setSending(false);
    }
  }

  async function handleSend() {
    await handleSendDirect(inputValue);
  }

  function handleQuickAsk(text: string) {
    handleSendDirect(text);
  }

  return (
    <View className="page">
      <View className="header">
        <Text className="header__title">💬 聊聊</Text>
        <Text className="header__subtitle">有什么烦心事都可以跟我说哦</Text>
      </View>

      <ScrollView
        className="chat-area"
        scrollY
        scrollWithAnimation
      >
        <View className="chat-messages">
          {chatHistory.length === 0 && (
            <View className="welcome">
              <Text className="welcome__emoji">👋</Text>
              <Text className="welcome__text">
                你好！我是智学伴的AI学习伙伴
              </Text>
              <Text className="welcome__desc">
                无论是学习问题、情绪困扰，还是只是想聊聊，我都在这里陪着你~
              </Text>
            </View>
          )}

          {chatHistory.map((msg) => (
            <View
              key={msg.id}
              className={`message ${msg.role === 'user' ? 'message--user' : 'message--assistant'}`}
            >
              <Text className="message__avatar">
                {msg.role === 'user' ? '😊' : '🤖'}
              </Text>
              <View className="message__content">
                <Text className="message__text">{msg.content}</Text>
              </View>
            </View>
          ))}
        </View>
        <View ref={scrollRef} />
      </ScrollView>

      {detectedEmotion && (
        <View className="emotion-tag">
          <Text>
            {EMOJI_MAP[detectedEmotion]} 情绪状态：{detectedEmotion === 'positive' ? '积极' : detectedEmotion === 'negative' ? '低落' : '平静'}
          </Text>
        </View>
      )}

      {chatHistory.length === 0 && (
        <View className="suggestions">
          <Text className="suggestions__title">快捷问题</Text>
          <View className="suggestions__list">
            {SUGGESTIONS.map((text, index) => (
              <View
                key={index}
                className="suggestion-btn"
                onClick={() => handleQuickAsk(text)}
              >
                {text}
              </View>
            ))}
          </View>
        </View>
      )}

      <View className="input-area">
        <input
          className="input"
          type="text"
          placeholder="输入消息..."
          value={inputValue}
          onInput={(e: any) => setInputValue(e.target.value)}
          onKeyDown={(e: any) => e.key === 'Enter' && handleSend()}
        />
        <View
          className={`send-btn ${!inputValue.trim() || sending ? 'disabled' : ''}`}
          onClick={handleSend}
        >
          {sending ? '...' : '发送'}
        </View>
      </View>
    </View>
  );
}