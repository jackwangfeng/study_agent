import { View, Text, Image } from '@tarojs/components';
import { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { api } from '../../services/api';
import './index.scss';

interface Child {
  openid: string;
  nickname: string;
  avatar: string;
  grade: number;
  relation: string;
  latestReport?: {
    totalMinutes: number;
    tomatoCount: number;
    completedItems: number;
    totalItems: number;
  };
}

const GRADE_TEXT: Record<number, string> = {
  1: '高一',
  2: '高二',
  3: '高三',
};

export default function Index() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loginAndFetchChildren();
  }, []);

  async function loginAndFetchChildren() {
    try {
      if (!api.auth.isLoggedIn()) {
        await api.auth.mockLogin();
      }
      await fetchChildren();
    } catch (error) {
      console.error('Login or fetch failed:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchChildren() {
    try {
      const res = await api.parent.getChildren();
      if (res.data) {
        setChildren(res.data.children || []);
      }
    } catch (error) {
      console.error('Fetch children failed:', error);
    }
  }

  function handleChildClick(childOpenid: string) {
    Taro.navigateTo({
      url: `/pages/report/index?openid=${childOpenid}`,
    });
  }

  return (
    <View className="page">
      <View className="header">
        <Text className="header__title">👨‍👩‍👧 孩子学习</Text>
        <Text className="header__subtitle">关注孩子学习，陪伴成长</Text>
      </View>

      <View className="content">
        {loading ? (
          <View className="loading">加载中...</View>
        ) : children.length === 0 ? (
          <View className="card">
            <View className="empty">
              <Text className="empty__icon">👶</Text>
              <Text>暂无绑定孩子</Text>
              <Text className="empty__desc">请让孩子生成绑定码后扫码绑定</Text>
            </View>
          </View>
        ) : (
          children.map((child) => (
            <View
              key={child.openid}
              className="child-card"
              onClick={() => handleChildClick(child.openid)}
            >
              <Image
                className="child-card__avatar"
                src={child.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + child.openid}
                mode="aspectFill"
              />
              <View className="child-card__info">
                <Text className="child-card__name">{child.nickname || '孩子'}</Text>
                <Text className="child-card__meta">
                  {GRADE_TEXT[child.grade] || '未知年级'} · {child.relation || '子女'}
                </Text>
              </View>
              <Text className="child-card__arrow">›</Text>
            </View>
          ))
        )}
      </View>

      <View className="tips card">
        <Text className="tips__title">💡 家长小贴士</Text>
        <Text className="tips__text">
          1. 孩子的学习报告每周自动生成{'\n'}
          2. 点击孩子卡片可查看详细学习报告{'\n'}
          3. 可在设置中开启学习提醒通知
        </Text>
      </View>
    </View>
  );
}