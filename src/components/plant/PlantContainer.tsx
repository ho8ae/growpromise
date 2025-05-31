// components/plant/PlantContainer.tsx - 매우 단순한 버전
import React from 'react';
import { ActivityIndicator, Animated, Text, View } from 'react-native';
import Colors from '../../constants/Colors';
import ChildPlantDisplay from './ChildPlantDisplay';
import ParentPlantDisplay from './ParentPlantDisplay';

interface PlantContainerProps {
  fadeAnim: Animated.Value;
  translateY: Animated.Value;
  userType?: 'PARENT' | 'CHILD'; // optional로 변경
  isLoading: boolean;
  onPress: () => void;
  childId?: string;
  plant: any; // 식물이 항상 있다고 가정
  connectedChildren?: any[];
  handleChildSelect?: (childId: string) => void;
  showExperienceAnimation?: boolean;
  experienceGained?: number;
}

const PlantContainer: React.FC<PlantContainerProps> = ({
  fadeAnim,
  translateY,
  userType,
  isLoading,
  onPress,
  childId,
  plant,
  connectedChildren,
  handleChildSelect,
  showExperienceAnimation = false,
  experienceGained = 0,
}) => {

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY }],
        }}
        className="bg-white rounded-xl p-6 shadow-sm items-center justify-center mb-4"
      >
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text className="mt-4 text-gray-500">식물 정보를 불러오는 중...</Text>
      </Animated.View>
    );
  }

  // 사용자 유형에 따라 다른 컴포넌트 렌더링 - 식물이 있다고 가정
  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY }],
      }}
      className="mb-4"
    >
      {userType === 'PARENT' ? (
        <ParentPlantDisplay
          plant={plant}
          childId={childId!} // childId가 항상 있다고 가정
          onPress={onPress}
          connectedChildren={connectedChildren}
          handleChildSelect={handleChildSelect}
        />
      ) : userType === 'CHILD' ? (
        <ChildPlantDisplay
          onPress={onPress}
          showExperienceAnimation={showExperienceAnimation}
          experienceGained={experienceGained}
        />
      ) : (
        // userType이 undefined인 경우 기본 처리
        <View className="bg-white rounded-xl p-6 shadow-sm items-center justify-center">
          <Text className="text-gray-500">사용자 타입을 확인할 수 없습니다</Text>
        </View>
      )}
    </Animated.View>
  );
};

export default PlantContainer;