import { View, Text } from '@tarojs/components';
import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useStore } from '../../store';
import './index.scss';

interface PlanItem {
  id: string;
  type: 'review' | 'practice' | 'plan';
  title: string;
  subject: string;
  knowledgePoint?: string;
  targetCount: number;
  completedCount: number;
  status: 'pending' | 'in_progress' | 'completed';
}

const TYPE_MAP: Record<string, { text: string; emoji: string }> = {
  review: { text: '复习', emoji: '📖' },
  practice: { text: '练习', emoji: '✏️' },
  plan: { text: '计划', emoji: '📋' },
};

export default function Plan() {
  const { todayPlan, fetchTodayPlan, generatePlan, completePlanItem } = useStore();
  const [tomatoActive, setTomatoActive] = useState(false);
  const [tomatoId, setTomatoId] = useState<string | null>(null);
  const [tomatoTime, setTomatoTime] = useState(0);
  const [showInput, setShowInput] = useState(false);
  const [customGoal, setCustomGoal] = useState('');

  useEffect(() => {
    fetchTodayPlan();
  }, []);

  useEffect(() => {
    let interval: number;
    if (tomatoActive) {
      interval = setInterval(() => {
        setTomatoTime((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [tomatoActive]);

  async function handleGeneratePlan() {
    if (showInput && customGoal.trim()) {
      await generatePlan({
        availableMinutes: 120,
        customGoal: customGoal.trim(),
      });
    } else {
      await generatePlan({ availableMinutes: 120 });
    }
    setShowInput(false);
    setCustomGoal('');
  }

  async function handleCompleteItem(item: PlanItem) {
    await completePlanItem(item.id, {
      completedCount: item.targetCount,
      actualMinutes: 25,
    });
  }

  async function handleStartTomato() {
    try {
      const res = await api.plan.startTomato({ subject: 'math' });
      if (res.data) {
        setTomatoId(res.data.tomatoId);
        setTomatoActive(true);
        setTomatoTime(0);
      }
    } catch (error) {
      console.error('Start tomato failed:', error);
    }
  }

  async function handleCompleteTomato() {
    if (!tomatoId) return;
    try {
      await api.plan.completeTomato(tomatoId, { result: 'completed' });
      setTomatoActive(false);
      setTomatoId(null);
      setTomatoTime(0);
      fetchTodayPlan();
    } catch (error) {
      console.error('Complete tomato failed:', error);
    }
  }

  const completedItems = todayPlan?.items?.filter((i) => i.status === 'completed').length || 0;
  const totalItems = todayPlan?.items?.length || 0;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className="page">
      <View className="header">
        <Text className="header__title">今日学习计划</Text>
        <Text className="header__date">
          {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
        </Text>
      </View>

      <View className="card">
        <Text className="card__title">学习进度</Text>
        <View className="progress-bar">
          <View className="progress-bar__fill" style={{ width: `${progress}%` }} />
        </View>
        <View className="progress-text">
          <Text>
            已完成 {completedItems}/{totalItems} 项
          </Text>
          <Text className="progress-percent">{progress}%</Text>
        </View>
      </View>

      <View className="card">
        <Text className="card__title">番茄钟</Text>
        <View className="tomato">
          {tomatoActive ? (
            <>
              <Text className="tomato__time">{formatTime(tomatoTime)}</Text>
              <Text className="tomato__tip">专注中...</Text>
              <View className="btn btn--primary" onClick={handleCompleteTomato}>
                完成番茄钟
              </View>
            </>
          ) : (
            <>
              <Text className="tomato__icon">🍅</Text>
              <Text className="tomato__count">今日完成 {todayPlan?.tomatoCount || 0} 个</Text>
              <View className="btn btn--primary btn--block" onClick={handleStartTomato}>
                开始专注 (25分钟)
              </View>
            </>
          )}
        </View>
      </View>

      <View className="card">
        <Text className="card__title">计划项目</Text>
        {!todayPlan ? (
          <View className="empty">
            <Text>还没有今日计划</Text>
            <View className="btn btn--primary btn--block" onClick={() => setShowInput(true)}>
              生成学习计划
            </View>
          </View>
        ) : todayPlan.items.length === 0 ? (
          <View className="empty">
            <Text>计划已全部完成！🎉</Text>
          </View>
        ) : (
          <View className="plan-list">
            {todayPlan.items.map((item) => (
              <View
                key={item.id}
                className={`plan-item ${item.status === 'completed' ? 'completed' : ''}`}
              >
                <View className="plan-item__left">
                  <Text className="plan-item__emoji">
                    {TYPE_MAP[item.type]?.emoji || '📋'}
                  </Text>
                  <View className="plan-item__info">
                    <Text className="plan-item__title">{item.title}</Text>
                    <Text className="plan-item__meta">
                      {item.subject} · {item.completedCount}/{item.targetCount}
                    </Text>
                  </View>
                </View>
                {item.status !== 'completed' && (
                  <View
                    className="btn btn--small btn--primary"
                    onClick={() => handleCompleteItem(item)}
                  >
                    完成
                  </View>
                )}
                {item.status === 'completed' && (
                  <Text className="plan-item__check">✓</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {showInput && (
        <View className="card goal-input-card">
          <Text className="card__title">🎯 设定学习目标</Text>
          <Text className="goal-hint">告诉我想学习什么？（可选）</Text>
          <input
            className="goal-input"
            type="text"
            placeholder="例如：复习三角函数、做一套英语听力练习"
            value={customGoal}
            onInput={(e: any) => setCustomGoal(e.target.value)}
          />
          <View className="goal-presets">
            {['复习三角函数', '做数学题', '背诵英语单词', '整理物理笔记'].map((preset) => (
              <View
                key={preset}
                className="preset-btn"
                onClick={() => setCustomGoal(preset)}
              >
                {preset}
              </View>
            ))}
          </View>
          <View className="btn-row">
            <View className="btn btn--secondary" onClick={() => setShowInput(false)}>
              取消
            </View>
            <View className="btn btn--primary" onClick={handleGeneratePlan}>
              {customGoal.trim() ? '按目标生成' : '智能生成'}
            </View>
          </View>
        </View>
      )}

      {todayPlan && !showInput && (
        <View className="btn btn--secondary btn--block" onClick={() => setShowInput(true)}>
          重新生成计划
        </View>
      )}
    </View>
  );
}