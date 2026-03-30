import { View, Text, Image } from '@tarojs/components';
import { useEffect, useState } from 'react';
import { useStore } from '../../store';
import { api } from '../../services/api';
import './index.scss';

interface MembershipInfo {
  level: string;
  expireAt?: string;
  dailyQuestionUsed: number;
  dailyQuestionLimit: number;
  aiChatUsed: number;
  aiChatLimit: number;
}

const MEMBERSHIP_TEXT: Record<string, string> = {
  free: '免费版',
  monthly: '月度会员',
  quarterly: '季度会员',
  yearly: '年度会员',
};

const GRADE_TEXT: Record<number, string> = {
  1: '高一',
  2: '高二',
  3: '高三',
};

export default function Mine() {
  const { user, fetchUser } = useStore();
  const [membership, setMembership] = useState<MembershipInfo | null>(null);

  useEffect(() => {
    fetchUser();
    loadMembership();
  }, []);

  async function loadMembership() {
    try {
      const res = await api.member.getInfo();
      if (res.data) {
        setMembership(res.data);
      }
    } catch (error) {
      console.error('Load membership failed:', error);
    }
  }

  async function handleGenerateBindCode() {
    try {
      const res = await api.user.generateBindCode();
      if (res.data) {
        alert(`邀请家长绑定\n绑定码：${res.data.bindCode}\n有效期至：${new Date(res.data.expireAt).toLocaleString()}`);
      }
    } catch (error) {
      console.error('Generate bind code failed:', error);
    }
  }

  async function handleLogout() {
    try {
      localStorage.clear();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  return (
    <View className="page">
      <View className="profile-card">
        <Image
          className="profile-card__avatar"
          src={user?.avatar || 'https://via.placeholder.com/80'}
          mode="aspectFill"
        />
        <View className="profile-card__info">
          <Text className="profile-card__name">
            {user?.nickname || '同学'}
          </Text>
          <Text className="profile-card__meta">
            {user?.grade ? GRADE_TEXT[user.grade] : '未设置年级'}
            {user?.subjects?.length ? ` · ${user.subjects.length}个科目` : ''}
          </Text>
        </View>
        <View className="btn btn--small btn--outline">
          编辑
        </View>
      </View>

      <View className="card">
        <Text className="card__title">会员状态</Text>
        <View className="membership">
          <View className="membership__info">
            <Text className="membership__level">
              {membership ? MEMBERSHIP_TEXT[membership.level] || membership.level : '加载中...'}
            </Text>
            {membership?.expireAt && (
              <Text className="membership__expire">
                到期：{new Date(membership.expireAt).toLocaleDateString()}
              </Text>
            )}
          </View>
          {membership?.level === 'free' && (
            <View className="btn btn--primary btn--small">
              开通会员
            </View>
          )}
        </View>

        {membership && membership.level !== 'free' && (
          <View className="quota-list">
            <View className="quota-item">
              <Text className="quota-item__label">今日错题次数</Text>
              <Text className="quota-item__value">
                {membership.dailyQuestionUsed}/{membership.dailyQuestionLimit}
              </Text>
            </View>
            <View className="quota-item">
              <Text className="quota-item__label">今日AI对话</Text>
              <Text className="quota-item__value">
                {membership.aiChatUsed}/{membership.aiChatLimit}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View className="card">
        <Text className="card__title">我的数据</Text>
        <View className="data-list">
          <View className="data-item">
            <Text className="data-item__value">0</Text>
            <Text className="data-item__label">累计学习(天)</Text>
          </View>
          <View className="data-item">
            <Text className="data-item__value">0</Text>
            <Text className="data-item__label">错题总数</Text>
          </View>
          <View className="data-item">
            <Text className="data-item__value">0</Text>
            <Text className="data-item__label">已掌握</Text>
          </View>
        </View>
      </View>

      <View className="card">
        <Text className="card__title">家长守护</Text>
        {user?.parentOpenid ? (
          <View className="parent-bound">
            <Text>已绑定家长</Text>
          </View>
        ) : (
          <View className="btn btn--secondary btn--block" onClick={handleGenerateBindCode}>
            生成邀请码
          </View>
        )}
      </View>

      <View className="card">
        <Text className="card__title">其他</Text>
        <View className="menu-list">
          <View className="menu-item">
            <Text>⚙️ 设置</Text>
          </View>
          <View className="menu-item">
            <Text>💬 客服支持</Text>
          </View>
          <View className="menu-item" onClick={() => alert('智学伴 v1.0.0')}>
            <Text>ℹ️ 关于智学伴</Text>
          </View>
        </View>
      </View>

      <View className="btn btn--logout" onClick={handleLogout}>
        退出登录
      </View>
    </View>
  );
}