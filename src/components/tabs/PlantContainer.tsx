// components/plant/PlantContainer.tsx
import React from 'react';
import { ActivityIndicator, Animated, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import ChildPlantDisplay from '../plant/ChildPlantDisplay';
import ParentPlantDisplay from '../plant/ParentPlantDisplay';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import api from '../../api';

interface PlantContainerProps {
  fadeAnim: Animated.Value;
  translateY: Animated.Value;
  userType?: 'PARENT' | 'CHILD';
  isLoading?: boolean;
  onPress?: () => void;
  childId?: string;
  plant?: any;
  connectedChildren?: any[];
  handleChildSelect?: (childId: string) => void;
  showExperienceAnimation?: boolean;
  experienceGained?: number;
}

const PlantContainer: React.FC<PlantContainerProps> = ({
  fadeAnim,
  translateY,
  userType,
  isLoading: externalLoading,
  onPress,
  childId,
  plant: externalPlant,
  connectedChildren = [],
  handleChildSelect,
  showExperienceAnimation = false,
  experienceGained = 0,
}) => {
  const [isWatering, setIsWatering] = React.useState(false);
  const [isFertilizing, setIsFertilizing] = React.useState(false);
  const [isTalking, setIsTalking] = React.useState(false);

  // 현재 식물 정보 가져오기
  const { 
    data: currentPlant, 
    isLoading: isLoadingPlant,
    refetch: refetchPlant,
  } = useQuery({
    queryKey: ['currentPlant', userType, childId],
    queryFn: async () => {
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
    enabled: (!!childId || userType === 'CHILD'),
  });

  // 식물 타입 정보 가져오기
  const { 
    data: plantType,
    isLoading: isLoadingPlantType
  } = useQuery({
    queryKey: ['plantType', (externalPlant || currentPlant)?.plantTypeId],
    queryFn: async () => {
      const plantTypeId = (externalPlant || currentPlant)?.plantTypeId;
      if (!plantTypeId) return null;
      
      try {
        return await api.plant.getPlantTypeById(plantTypeId);
      } catch (error) {
        console.error('식물 타입 데이터 로딩 실패:', error);
        return null;
      }
    },
    enabled: !!(externalPlant || currentPlant)?.plantTypeId,
  });

  // 물주기 처리
  const handleWaterPlant = async () => {
    if (!currentPlant || userType !== 'CHILD' || isWatering) {
      return;
    }

    try {
      setIsWatering(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // 물주기 API 호출
      await api.plant.waterPlant(currentPlant.id);
      
      // 식물 상태 갱신
      await refetchPlant();
      
      // 성공 메시지
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      return true;
    } catch (error) {
      console.error('물주기 실패:', error);
      return null;
    } finally {
      setIsWatering(false);
    }
  };

  // 영양제 주기 처리
  const handleFertilizePlant = async () => {
    if (!currentPlant || userType !== 'CHILD' || isFertilizing) {
      return;
    }

    try {
      setIsFertilizing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // 영양제 주기 API 호출 (구현 필요)
      // await api.plant.fertilizePlant(currentPlant.id);
      
      // 테스트용 지연 (실제 API가 없으므로)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 식물 상태 갱신
      await refetchPlant();
      
      // 성공 메시지
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      return true;
    } catch (error) {
      console.error('영양제 주기 실패:', error);
      return null;
    } finally {
      setIsFertilizing(false);
    }
  };

  // 대화하기 처리
  const handleTalkToPlant = async () => {
    if (!currentPlant || userType !== 'CHILD' || isTalking) {
      return;
    }

    try {
      setIsTalking(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // 대화하기 API 호출 (구현 필요)
      // await api.plant.talkToPlant(currentPlant.id);
      
      // 테스트용 지연 (실제 API가 없으므로)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 식물 상태 갱신
      await refetchPlant();
      
      // 성공 메시지
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      return true;
    } catch (error) {
      console.error('대화하기 실패:', error);
      return null;
    } finally {
      setIsTalking(false);
    }
  };

  // 식물 정보 버튼 처리
  const handlePlantInfo = () => {
    // 식물 정보 화면으로 이동 또는 모달 표시
    onPress?.();
  };

  const isLoading = externalLoading || isLoadingPlant || isLoadingPlantType;
  const displayPlant = externalPlant || currentPlant;

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <Animated.View 
        style={{ 
          opacity: fadeAnim,
          transform: [{ translateY }],
          marginBottom: 20
        }}
      >
        <View className="bg-white rounded-xl p-5 items-center justify-center border border-primary/20 min-h-[250px] shadow-md">
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text className="mt-4 text-primary font-medium">
            식물 정보를 불러오는 중...
          </Text>

          <View className="mt-4">
            <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center">
              <MaterialIcons
                name="eco"
                size={30}
                color={Colors.light.primary}
                style={{ opacity: 0.6 }}
              />
            </View>
          </View>
        </View>
      </Animated.View>
    );
  }

  // 사용자 유형에 따라 다른 컴포넌트 표시
  return (
    <Animated.View 
      style={{ 
        opacity: fadeAnim,
        transform: [{ translateY }],
        marginBottom: 20
      }}
    >
      {userType === 'PARENT' ? (
        // 부모용 식물 컴포넌트
        <ParentPlantDisplay
          plant={displayPlant}
          plantType={plantType || null}
          onPress={onPress}
          onInfoPress={handlePlantInfo}
          connectedChildren={connectedChildren}
          selectedChildId={childId || null}
          handleChildSelect={handleChildSelect || (() => {})}
          childId={childId}
        />
      ) : (
        // 자녀용 식물 컴포넌트
        <ChildPlantDisplay
          plant={displayPlant}
          plantType={plantType || null}
          onPress={onPress}
          onWaterPress={handleWaterPlant}
          onFertilizePress={handleFertilizePlant}
          onTalkPress={handleTalkToPlant}
          onInfoPress={handlePlantInfo}
          showExperienceAnimation={showExperienceAnimation}
          experienceGained={experienceGained}
        />
      )}
    </Animated.View>
  );
};

export default PlantContainer;