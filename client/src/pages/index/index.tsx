import { View, Text } from '@tarojs/components';
import { useEffect } from 'react';
import Taro from '@tarojs/taro';
import { useStore } from '../../store';
import './index.scss';

const GRADE_TEXT: Record<number, string> = {
  1: '高一',
  2: '高二',
  3: '高三',
};

export default function Index() {
  const { user, todayPlan, fetchUser, fetchTodayPlan, generatePlan } = useStore();

  useEffect(() => {
    fetchUser();
    fetchTodayPlan();
  }, []);

  async function handleGeneratePlan() {
    await generatePlan({ availableMinutes: 120 });
  }

  function handleNavigate(path: string) {
    if (path.startsWith('/')) {
      Taro.navigateTo({ url: path });
    } else {
      Taro.switchTab({ url: `/${path}` });
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
          {user?.grade ? `${GRADE_TEXT[user.grade] || ''} · ` : ''}
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
          <View className="btn btn--primary btn--block" onClick={handleGeneratePlan}>
            生成今日计划
          </View>
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
          <View className="btn btn--secondary" onClick={() => handleNavigate('pages/questions/index')}>📷 拍题</View>
          <View className="btn btn--secondary" onClick={() => handleNavigate('pages/plan/index')}>📅 计划</View>
          <View className="btn btn--secondary" onClick={() => handleNavigate('pages/questions/index')}>📚 错题本</View>
          <View className="btn btn--secondary" onClick={() => handleNavigate('pages/chat/index')}>💬 聊聊</View>
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