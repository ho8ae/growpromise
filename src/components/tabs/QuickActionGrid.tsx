import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface QuickActionGridProps {
  userType?: string;
  handleAuthRequired: () => boolean;
  childId?: string;
}

const QuickActionGrid: React.FC<QuickActionGridProps> = ({
  userType,
  handleAuthRequired,
  childId,
}) => {
  const router = useRouter();

  // 액션 처리 함수
  const handleAction = (route: string, params?: Record<string, string>) => {
    // 비인증 사용자인 경우 인증 요청
    if (handleAuthRequired()) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // 경로에 따라 다른 액션 처리
    if (params) {
      router.push({ pathname: route, params });
    } else {
      router.push(route);
    }
  };

  // 부모용 액션 아이템
  const parentActions = [
    {
      id: 'create-promise',
      icon: 'clipboard-list',
      title: '약속 만들기',
      route: '/(parent)/create-promise',
      color: '#10b981',
    },
    {
      id: 'index',
      icon: 'check-circle',
      title: '인증 확인',
      route: '/(parent)/',
      color: '#f97316',
    },
    {
      id: 'manage-rewards',
      icon: 'gift',
      title: '보상 관리',
      route: '/(parent)/set-rewards',
      color: '#8b5cf6',
    },
    {
      id: 'child-rewards',
      icon: 'star',
      title: '자녀 스티커',
      route: '/(parent)/child-rewards',
      params: { childId },
      color: '#f59e0b',
      showWhenChildSelected: true,
    },
    {
      id: 'sticker-templates',
      icon: 'palette',
      title: '스티커 관리',
      route: '/(parent)/sticker-templates',
      color: '#ec4899',
    },
  ];

  // 자녀용 액션 아이템
  const childActions = [
    {
      id: 'verify-promise',
      icon: 'camera',
      title: '약속 인증',
      route: '/(child)/verify',
      color: '#10b981',
    },
    {
      id: 'my-promises',
      icon: 'clipboard-list',
      title: '내 약속 보기',
      route: '/(child)/promises',
      color: '#f97316',
    },
    {
      id: 'my-rewards',
      icon: 'gift',
      title: '보상 확인',
      route: '/(child)/rewards',
      color: '#8b5cf6',
    },
    {
      id: 'plant-collection',
      icon: 'seedling',
      title: '식물 도감',
      route: '/(child)/plant-collection',
      color: '#0ea5e9',
    },
  ];

  // 사용자 타입에 따라 적절한 액션 배열 선택
  const actions = userType === 'PARENT' ? parentActions : childActions;

  // 부모용이고 자녀 ID가 있는 경우만 자녀 스티커 버튼 표시
  const filteredActions = userType === 'PARENT' && !childId
    ? actions.filter(action => !action.showWhenChildSelected)
    : actions;

  return (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
      <Text className="text-lg font-bold text-gray-800 mb-3">빠른 액션</Text>
      <View className="flex-row flex-wrap">
        {filteredActions.map((action) => (
          <Pressable
            key={action.id}
            className="w-1/2 p-2"
            onPress={() => handleAction(action.route, action.params)}
          >
            <View className="flex-row items-center bg-gray-50 p-3 rounded-xl">
              <View
                className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                style={{ backgroundColor: `${action.color}20` }} // 10% opacity
              >
                <FontAwesome5 name={action.icon} size={18} color={action.color} />
              </View>
              <Text className="text-gray-800 font-medium">{action.title}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default QuickActionGrid;