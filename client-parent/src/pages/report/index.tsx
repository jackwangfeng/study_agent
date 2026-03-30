import { View, Text } from '@tarojs/components';
import { useEffect, useState } from 'react';
import { useRouter } from '@tarojs/router';
import { api } from '../../services/api';
import './index.scss';

interface Report {
  date: string;
  totalMinutes: number;
  tomatoCount: number;
  completedItems: number;
  totalItems: number;
  summary: string;
  weakPoints: Array<{
    knowledgePoint: string;
    subject: string;
    wrongCount: number;
  }>;
  emotionTrend: 'positive' | 'neutral' | 'negative';
  emotionSummary: string;
}

export default function Report() {
  const router = useRouter();
  const { openid } = router.params;
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (openid) {
      fetchReport();
    }
  }, [openid]);

  async function fetchReport() {
    try {
      const res = await api.parent.getChildReport(openid);
      if (res.data) {
        setReport(res.data);
      }
    } catch (error) {
      console.error('Fetch report failed:', error);
    } finally {
      setLoading(false);
    }
  }

  const getEmotionEmoji = (emotion: string) => {
    switch (emotion) {
      case 'positive': return '😊';
      case 'negative': return '😢';
      default: return '😐';
    }
  };

  const getEmotionText = (emotion: string) => {
    switch (emotion) {
      case 'positive': return '积极';
      case 'negative': return '低落';
      default: return '平稳';
    }
  };

  const progress = report
    ? Math.round((report.completedItems / (report.totalItems || 1)) * 100)
    : 0;

  return (
    <View className="page">
      <View className="header">
        <Text className="header__title">📊 学习报告</Text>
        <Text className="header__subtitle">
          {report?.date || ''} 周报
        </Text>
      </View>

      {loading ? (
        <View className="loading">加载中...</View>
      ) : !report ? (
        <View className="card">
          <View className="empty">
            <Text className="empty__icon">📝</Text>
            <Text>暂无学习报告</Text>
            <Text className="empty__desc">本周学习数据正在生成中</Text>
          </View>
        </View>
      ) : (
        <>
          <View className="card">
            <Text className="card__title">📈 学习概览</Text>
            <View className="stats">
              <View className="stat-item">
                <Text className="stat-item__value">{report.totalMinutes}</Text>
                <Text className="stat-item__label">学习分钟</Text>
              </View>
              <View className="stat-item">
                <Text className="stat-item__value">{report.tomatoCount}</Text>
                <Text className="stat-item__label">番茄钟</Text>
              </View>
              <View className="stat-item">
                <Text className="stat-item__value">{report.completedItems}/{report.totalItems}</Text>
                <Text className="stat-item__label">完成任务</Text>
              </View>
            </View>

            <View className="progress-section">
              <View className="progress-label">
                <Text>任务完成率</Text>
                <Text className="progress-value">{progress}%</Text>
              </View>
              <View className="progress-bar">
                <View className="progress-bar__fill" style={{ width: `${progress}%` }} />
              </View>
            </View>
          </View>

          <View className="card">
            <Text className="card__title">😊 情绪状态</Text>
            <View className="emotion-card">
              <Text className="emotion-card__emoji">{getEmotionEmoji(report.emotionTrend)}</Text>
              <View className="emotion-card__info">
                <Text className="emotion-card__status">本周情绪：{getEmotionText(report.emotionTrend)}</Text>
                <Text className="emotion-card__desc">{report.emotionSummary}</Text>
              </View>
            </View>
          </View>

          <View className="card">
            <Text className="card__title">📚 薄弱知识点</Text>
            {report.weakPoints && report.weakPoints.length > 0 ? (
              <View className="weak-list">
                {report.weakPoints.slice(0, 5).map((wp, index) => (
                  <View key={index} className="weak-item">
                    <Text className="weak-item__tag">{wp.subject}</Text>
                    <Text className="weak-item__name">{wp.knowledgePoint}</Text>
                    <Text className="weak-item__count">错{wp.wrongCount}次</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View className="empty-small">
                <Text>暂无薄弱知识点</Text>
              </View>
            )}
          </View>

          <View className="card">
            <Text className="card__title">💡 AI 学习建议</Text>
            <Text className="summary-text">{report.summary || '继续加油！'}</Text>
          </View>
        </>
      )}
    </View>
  );
}