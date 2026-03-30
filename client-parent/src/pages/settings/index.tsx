import { View, Text, Switch } from '@tarojs/components';
import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import './index.scss';

interface NotifySettings {
  notifyEnabled: boolean;
  weeklyReportDay: number;
  abnormalAlert: boolean;
}

export default function Settings() {
  const [settings, setSettings] = useState<NotifySettings>({
    notifyEnabled: true,
    weeklyReportDay: 6,
    abnormalAlert: true,
  });
  const [loading, setLoading] = useState(false);

  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  function handleSwitchChange(key: keyof NotifySettings, value: boolean) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    saveSettings({ ...settings, [key]: value });
  }

  async function saveSettings(newSettings: NotifySettings) {
    try {
      setLoading(true);
      await api.parent.updateSettings(newSettings);
    } catch (error) {
      console.error('Save settings failed:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      api.auth.logout();
      Taro.redirectTo({ url: '/pages/index/index' });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  return (
    <View className="page">
      <View className="header">
        <Text className="header__title">⚙️ 设置</Text>
      </View>

      <View className="card">
        <Text className="card__title">通知设置</Text>

        <View className="setting-item">
          <View className="setting-item__info">
            <Text className="setting-item__label">学习提醒通知</Text>
            <Text className="setting-item__desc">接收孩子的学习完成提醒</Text>
          </View>
          <Switch
            checked={settings.notifyEnabled}
            onChange={(e) => handleSwitchChange('notifyEnabled', e.detail.value)}
            color="#4CAF50"
          />
        </View>

        <View className="setting-item">
          <View className="setting-item__info">
            <Text className="setting-item__label">异常情况提醒</Text>
            <Text className="setting-item__desc">孩子情绪异常时通知</Text>
          </View>
          <Switch
            checked={settings.abnormalAlert}
            onChange={(e) => handleSwitchChange('abnormalAlert', e.detail.value)}
            color="#4CAF50"
          />
        </View>
      </View>

      <View className="card">
        <Text className="card__title">周报设置</Text>

        <View className="setting-item">
          <View className="setting-item__info">
            <Text className="setting-item__label">周报发送日</Text>
            <Text className="setting-item__desc">每周生成并发送学习报告</Text>
          </View>
          <View className="day-selector">
            {weekDays.map((day, index) => (
              <View
                key={index}
                className={`day-btn ${settings.weeklyReportDay === index ? 'active' : ''}`}
                onClick={() => {
                  const newSettings = { ...settings, weeklyReportDay: index };
                  setSettings(newSettings);
                  saveSettings(newSettings);
                }}
              >
                {day}
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className="card">
        <Text className="card__title">账号</Text>
        <View className="menu-item" onClick={handleLogout}>
          <Text>退出登录</Text>
        </View>
      </View>

      <View className="version">
        <Text>智学伴家长端 v1.0.0</Text>
      </View>
    </View>
  );
}