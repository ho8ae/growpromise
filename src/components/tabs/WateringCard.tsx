import React, { useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ActionCard from './ActionCard';
import Colors from '../../constants/Colors';
import api from '../../api';
import { useAuthStore } from '../../stores/authStore';

interface WateringCardProps {
  handleAuthRequired: () => boolean;
  currentPlantId?: string | null;
  lastWatered?: string | null;
  isParent?: boolean;
  childId?: string | null;
}
    
const WateringCard = ({ 
  handleAuthRequired, 
  currentPlantId,
  lastWatered,
  isParent = false,
  childId,
}: WateringCardProps) => {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [isWatering, setIsWatering] = useState(false);
  
  // 물주기 가능 여부 확인
  const canWater = () => {
    if (!isAuthenticated || !currentPlantId || isParent) return false;
    
    // 마지막 물주기 시간 확인
    if (lastWatered) {
      const lastWateredDate = new Date(lastWatered);
      const now = new Date();
      
      // 마지막 물주기로부터 24시간 지났는지 확인
      const hoursDiff = Math.floor((now.getTime() - lastWateredDate.getTime()) / (1000 * 60 * 60));
      return hoursDiff >= 24;
    }
    
    return true; // 처음 물주기
  };
  
  // 물주기 뮤테이션
  const waterPlantMutation = useMutation({
    mutationFn: async () => {
      if (!currentPlantId) throw new Error('식물 ID가 없습니다');
      return await api.plant.waterPlant(currentPlantId);
    },
    onSuccess: (result) => {
      // 식물 데이터 갱신
      queryClient.invalidateQueries({ queryKey: ['currentPlant'] });
      
      // 성공 메시지
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      if (result.wateringStreak > 1) {
        Alert.alert(
          '물주기 성공!', 
          `연속 ${result.wateringStreak}일째 물을 주고 있어요! 식물이 건강하게 자라고 있어요. 건강도가 ${result.updatedPlant.health}%가 되었어요.`
        );
      } else {
        Alert.alert(
          '물주기 성공!', 
          `식물이 건강하게 자라고 있어요. 건강도가 ${result.updatedPlant.health}%가 되었어요.`
        );
      }
    },
    onError: (error) => {
      console.error('물주기 실패:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('already watered')) {
          Alert.alert('알림', '오늘은 이미 물을 줬어요. 내일 다시 시도해보세요.');
        } else {
          Alert.alert('오류', '물주기 과정에서 문제가 발생했습니다.');
        }
      } else {
        Alert.alert('오류', '물주기 과정에서 문제가 발생했습니다.');
      }
    }
  });

  // 물주기 처리
  const handleWaterPlant = async () => {
    // 로그인 여부 확인
    if (handleAuthRequired()) return;
    
    // 부모 계정은 물줄 수 없음
    if (isParent) {
      Alert.alert('알림', '자녀만 식물에 물을 줄 수 있어요.');
      return;
    }
    
    // 식물 없음
    if (!currentPlantId) {
      Alert.alert('알림', '먼저 식물을 선택해주세요.');
      return;
    }
    
    // 물주기 가능 여부 확인
    if (!canWater()) {
      Alert.alert('알림', '아직 물을 줄 수 없어요. 24시간 후에 다시 시도해주세요.');
      return;
    }
    
    try {
      setIsWatering(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // 물주기 API 호출
      await waterPlantMutation.mutateAsync();
    } finally {
      setIsWatering(false);
    }
  };
  
  // 물주기 가능 시간 표시
  const getWateringLabel = () => {
    // 식물이 없거나 부모 계정인 경우
    if (!currentPlantId || isParent) {
      return isParent ? '자녀만 물주기 가능해요' : '먼저 식물을 선택해주세요';
    }
    
    // 물주기 가능 여부 확인
    if (lastWatered) {
      const lastWateredDate = new Date(lastWatered);
      const now = new Date();
      const hoursDiff = Math.floor((now.getTime() - lastWateredDate.getTime()) / (1000 * 60 * 60));
      
      if (hoursDiff >= 24) {
        return '물주기';
      } else {
        const remainingHours = 24 - hoursDiff;
        return `${remainingHours}시간 후 물주기 가능`;
      }
    }
    
    return '물주기';
  };

  return (
    <ActionCard
      icon={isWatering ? (
        <ActivityIndicator size="small" color={Colors.light.sky} />
      ) : (
        <MaterialIcons name="opacity" size={22} color={Colors.light.sky} />
      )}
      title="오늘의 물주기"
      description={
        !currentPlantId
          ? "식물을 선택하고 물을 주세요!"
          : "식물에게 물을 주면 더 빨리 성장해요!"
      }
      actionText={getWateringLabel()}
      color={canWater() ? Colors.light.sky : '#9ca3af'}
      onPress={handleWaterPlant}
      disabled={isWatering || !canWater()}
    />
  );
};

export default WateringCard;