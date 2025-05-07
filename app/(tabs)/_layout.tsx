// app/(tabs)/_layout.tsx
import React from 'react';
import { Slot } from 'expo-router';
import { View } from 'react-native';
import RevolvingMenu from '../../components/ui/RevolvingMenu';

// 부모용 메뉴 아이템
const parentMenuItems = [
  {
    id: 'home',
    label: '홈',
    icon: 'home',
    route: '/(tabs)',
    color: '#70CAF8', // 하늘색
  },
  {
    id: 'promises',
    label: '약속',
    icon: 'calendar',
    route: '/(tabs)/promises',
    color: '#FFAEC0', // 분홍
  },
  {
    id: 'add',
    label: '추가',
    icon: 'add-circle',
    route: '/modals/add-promise',
    color: '#A8E6CF', // 민트
  },
  {
    id: 'rewards',
    label: '보상',
    icon: 'gift',
    route: '/(tabs)/rewards',
    color: '#FFEDA3', // 노랑
  },
  {
    id: 'profile',
    label: '프로필',
    icon: 'person',
    route: '/(tabs)/profile',
    color: '#D4A5FF', // 보라
  },
  {
    id: 'settings',
    label: '설정',
    icon: 'settings',
    route: '/(tabs)/settings',
    color: '#FF7A6D', // 빨강
  },
  {
    id: 'stats',
    label: '통계',
    icon: 'stats-chart',
    route: '/(tabs)/stats',
    color: '#62C6FF', // 진한 하늘
  },
];

// 아이용 메뉴 아이템
const childMenuItems = [
  {
    id: 'home',
    label: '홈',
    icon: 'home',
    route: '/(tabs)',
    color: '#70CAF8',
  },
  {
    id: 'verify',
    label: '인증',
    icon: 'camera',
    route: '/(child)/verify-promise',
    color: '#FFAEC0',
  },
  {
    id: 'rewards',
    label: '보상',
    icon: 'star',
    route: '/(child)/my-rewards',
    color: '#A8E6CF',
  },
  {
    id: 'stickers',
    label: '스티커',
    icon: 'ribbon',
    route: '/(child)/my-stickers',
    color: '#FFEDA3',
  },
  {
    id: 'games',
    label: '게임',
    icon: 'game-controller',
    route: '/(child)/games',
    color: '#D4A5FF',
  },
];

export default function TabsLayout() {
  // 실제 앱에서는 로그인한 사용자의 역할을 가져와야 함
  // 여기서는 테스트용으로 임의로 설정
  const userRole = 'parent'; // 또는 'child'
  
  const menuItems = userRole === 'parent' ? parentMenuItems : childMenuItems;

  return (
    <View className="flex-1 bg-white">
      <Slot />
      <RevolvingMenu items={menuItems} role={userRole} />
    </View>
  );
}