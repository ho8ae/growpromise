import React, { useState } from 'react';
import { Alert, Animated } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import PlantDisplay from '../common/PlantDisplay';
import api from '../../api';
import { useAuthStore } from '../../stores/authStore';
import { Plant } from '@/src/api/modules/plant';

interface PlantContainerProps {
  fadeAnim: Animated.Value;
  translateY: Animated.Value;
  userType?: 'PARENT' | 'CHILD';
  isLoading?: boolean;
  onPress?: () => void;
  childId?: string;
  plant? : Plant | undefined;
}

const PlantContainer = ({
  fadeAnim,
  translateY,
  userType,
  isLoading: externalLoading,
  onPress,
  childId,
  plant,
}: PlantContainerProps) => {
  const { isAuthenticated } = useAuthStore();
  const [isWatering, setIsWatering] = useState(false);

  // 현재 식물 정보 가져오기
  const { 
    data: currentPlant, 
    isLoading: isLoadingPlant,
    refetch: refetchPlant,
    error: plantError
  } = useQuery({
    queryKey: ['currentPlant', userType, childId],
    queryFn: async () => {
      if (!isAuthenticated) return null;

      try {
        if (userType === 'PARENT' && childId) {
          // 부모가 자녀의 식물 조회
          return await api.plant.getChildCurrentPlant(childId);
        } else if (userType === 'CHILD') {
          // 자녀가 자신의 식물 조회
          return await api.plant.getCurrentPlant();
        }
        return null;
      } catch (error) {
        console.error('식물 데이터 로딩 실패:', error);
        return null;
      }
    },
    enabled: isAuthenticated && !!userType,
  });

  // 식물 타입 정보 가져오기
  const { 
    data: plantType,
    isLoading: isLoadingPlantType
  } = useQuery({
    queryKey: ['plantType', currentPlant?.plantTypeId],
    queryFn: async () => {
      if (!currentPlant?.plantTypeId) return null;
      
      try {
        return await api.plant.getPlantTypeById(currentPlant.plantTypeId);
      } catch (error) {
        console.error('식물 타입 데이터 로딩 실패:', error);
        return null;
      }
    },
    enabled: !!currentPlant?.plantTypeId,
  });

  // 물주기 처리
  const handleWaterPlant = async () => {
    if (!currentPlant || !isAuthenticated || userType !== 'CHILD' || isWatering) {
      return;
    }

    try {
      setIsWatering(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // 물주기 API 호출
      const result = await api.plant.waterPlant(currentPlant.id);
      
      // 식물 상태 갱신
      await refetchPlant();
      
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
      
      return result;
    } catch (error) {
      console.error('물주기 실패:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('already watered')) {
          Alert.alert('알림', '오늘은 이미 물을 줬어요. 내일 다시 시도해보세요.');
        } else {
          Alert.alert('오류', '물주기 과정에서 문제가 발생했습니다.');
        }
      }
      
      return null;
    } finally {
      setIsWatering(false);
    }
  };

  const isLoading = externalLoading || isLoadingPlant || isLoadingPlantType;

  return (
    <Animated.View 
      style={{ 
        opacity: fadeAnim,
        transform: [{ translateY }],
        marginBottom: 20
      }}
    >
      <PlantDisplay
        plant={currentPlant || null}
        plantType={plantType}
        isLoading={isLoading}
        onPress={onPress}
        onWaterPress={handleWaterPlant}
        userType={userType === 'PARENT' ? 'parent' : 'child'}
      />
    </Animated.View>
  );
};

export default PlantContainer;