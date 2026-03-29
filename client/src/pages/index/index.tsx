import { View, Text, Button } from '@tarojs/components';
import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import './index.scss';

interface UserInfo {
  openid: string;
  nickname?: string;
  grade?: number;
  membershipLevel: string;
}

interface TodayPlan {
  id: string;
  items: Array<{
    id: string;
    title: string;
    subject: string;
    status: string;
    completedCount: number;
    targetCount: number;
  }>;
  tomatoCount: number;
  totalMinutes: number;
}

export default function Index() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [todayPlan, setTodayPlan] = useState<TodayPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [userRes, planRes] = await Promise.all([
        api.user.getMe(),
        api.plan.getToday(),
      ]);

      if (userRes.data) {
        setUser(userRes.data);
      }
      if (planRes.data) {
        setTodayPlan(planRes.data);
      }
    } catch (error) {
      console.error('Load data failed:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGeneratePlan() {
    try {
      const res = await api.plan.generate();
      if (res.data) {
        setTodayPlan(res.data);
      }
    } catch (error) {
      console.error('Generate plan failed:', error);
    }
  }

  const completedItems = todayPlan?.items?.filter((i) => i.status === 'completed').length || 0;
  const totalItems = todayPlan?.items?.length || 0;

  return (
    <View className="page">
      <View className="header">
        <View className="header__title">
          你好，{user?.nickname || '同学'} 👋
        </View>
        <View className="header__subtitle">
          {user?.grade ? `高一${user.grade === 1 ? '一' : user.grade === 2 ? '二' : '三'} · ` : ''}
          {user?.membershipLevel === 'free' ? '免费版' : '会员'}
        </View>
      </View>

      <View className="card">
        <View className="card__title">今日学习</View>
        <View className="grid grid--3">
          <View className="stat">
            <View className="stat__value">{todayPlan?.totalMinutes || 0}</View>
            <View className="stat__label">学习分钟</View>
          </View>
          <View className="stat">
            <View className="stat__value">{todayPlan?.tomatoCount || 0}</View>
            <View className="stat__label">番茄钟</View>
          </View>
          <View className="stat">
            <View className="stat__value">{completedItems}/{totalItems}</View>
            <View className="stat__label">完成任务</View>
          </View>
        </View>

        {!todayPlan ? (
          <Button className="btn btn--primary btn--block" onClick={handleGeneratePlan}>
            生成今日计划
          </Button>
        ) : (
          <View className="plan-list">
            {todayPlan.items?.slice(0, 3).map((item) => (
              <View key={item.id} className="plan-item">
                <Text>{item.title}</Text>
                <Text className={`status status--${item.status}`}>
                  {item.status === 'completed' ? '✓' : '○'}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View className="card">
        <View className="card__title">快捷功能</View>
        <View className="grid grid--2">
          <Button className="btn btn--secondary">📷 拍题</Button>
          <Button className="btn btn--secondary">📅 计划</Button>
          <Button className="btn btn--secondary">📚 错题本</Button>
          <Button className="btn btn--secondary">💬 聊聊</Button>
        </View>
      </View>

      <View className="card">
        <View className="card__title">学习激励</View>
        <Text className="motivation">
          每解决一道难题，你就比昨天的自己更强一点。💪
        </Text>
      </View>
    </View>
  );
}
