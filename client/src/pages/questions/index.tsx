import { View, Text } from '@tarojs/components';
import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import './index.scss';

interface Question {
  id: string;
  questionImage?: string;
  questionText: string;
  subject: string;
  knowledgePoint?: string;
  status: 'unmastered' | 'learning' | 'mastered';
  wrongCount: number;
  createdAt: string;
}

const SUBJECT_MAP: Record<string, string> = {
  math: '数学',
  chinese: '语文',
  english: '英语',
  physics: '物理',
  chemistry: '化学',
  biology: '生物',
  history: '历史',
  geography: '地理',
  politics: '政治',
};

const STATUS_MAP: Record<string, { text: string; color: string }> = {
  unmastered: { text: '未掌握', color: '#ff4d4f' },
  learning: { text: '学习中', color: '#faad14' },
  mastered: { text: '已掌握', color: '#52c41a' },
};

export default function Questions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadQuestions();
  }, [filter]);

  async function loadQuestions() {
    setLoading(true);
    try {
      const params: any = {};
      if (filter !== 'all') {
        params.status = filter;
      }

      const res = await api.question.list(params);
      if (res.data) {
        setQuestions(res.data.items || []);
      }
    } catch (error) {
      console.error('Load questions failed:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkMastered(id: string) {
    try {
      await api.question.markMaster(id);
      loadQuestions();
    } catch (error) {
      console.error('Mark mastered failed:', error);
    }
  }

  return (
    <View className="page">
      <View className="filter-bar">
        <View className="filter-group">
          <Text className="filter-label">状态：</Text>
          {['all', 'unmastered', 'learning', 'mastered'].map((status) => (
            <View
              key={status}
              className={`filter-btn ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status === 'all' ? '全部' : STATUS_MAP[status]?.text}
            </View>
          ))}
        </View>
      </View>

      <View className="question-list">
        {loading ? (
          <View className="loading">加载中...</View>
        ) : questions.length === 0 ? (
          <View className="empty">
            <Text>暂无错题</Text>
            <Text className="empty__tip">拍照上传错题即可开始学习</Text>
          </View>
        ) : (
          questions.map((q) => (
            <View key={q.id} className="question-card">
              <View className="question-card__header">
                <Text className="question-card__subject">
                  {SUBJECT_MAP[q.subject] || q.subject}
                </Text>
                <Text
                  className="question-card__status"
                  style={{ color: STATUS_MAP[q.status]?.color }}
                >
                  {STATUS_MAP[q.status]?.text}
                </Text>
              </View>

              <Text className="question-card__text">
                {q.questionText || '图片题目'}
              </Text>

              {q.knowledgePoint && (
                <View className="question-card__tag">
                  <Text>📚 {q.knowledgePoint}</Text>
                </View>
              )}

              <View className="question-card__footer">
                <Text className="question-card__count">
                  错误次数：{q.wrongCount}
                </Text>
                {q.status !== 'mastered' && (
                  <View
                    className="btn btn--small btn--primary"
                    onClick={() => handleMarkMastered(q.id)}
                  >
                    标记掌握
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      <View className="fab">
        <View className="fab__btn">📷 拍照</View>
      </View>
    </View>
  );
}