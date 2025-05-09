// app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { useAuthStore } from '../../stores/authStore';

export default function TabLayout() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.gray,
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.light.gray,
          paddingTop: 5,
          paddingBottom: 5,
        },
        // 미리보기 모드일 때는 탭을 계속 보여줌
        // (useAuth 훅에서 필요한 경로로 리디렉션하므로 여기서는 UI만 처리)
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color }) => <FontAwesome5 name="home" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: '캘린더',
          tabBarIcon: ({ color }) => <FontAwesome5 name="calendar-alt" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="character"
        options={{
          title: '캐릭터',
          tabBarIcon: ({ color }) => <FontAwesome5 name="seedling" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: '목표',
          tabBarIcon: ({ color }) => <FontAwesome5 name="star" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '설정',
          tabBarIcon: ({ color }) => <FontAwesome5 name="cog" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}