// src/components/store/MysteryCard.tsx (카드 뒤집기 애니메이션)
import React, { useEffect, useState } from 'react';
import { Text, Pressable, View, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  withSequence,
  Easing,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import Colors from '../../constants/Colors';

interface MysteryCardProps {
  onPress: () => void;
  width: number;
  height: number;
  drawResult?: any;
  isRevealed: boolean;
}

const MysteryCard: React.FC<MysteryCardProps> = ({ 
  onPress, 
  width, 
  height, 
  drawResult,
  isRevealed 
}) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // 애니메이션 값들
  const floatY = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const overlayOpacity = useSharedValue(0.3);

  useEffect(() => {
    if (!isRevealed && !isFlipping && !isHovered) {
      // 둥둥 떠다니는 애니메이션 (호버 중이 아닐 때만)
      floatY.value = withRepeat(
        withSequence(
          withTiming(-15, { duration: 2000, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
          withTiming(15, { duration: 2000, easing: Easing.bezier(0.4, 0, 0.6, 1) })
        ),
        -1,
        true
      );
    } else {
      // 정지 상태로 만들기
      floatY.value = withSpring(0, { damping: 15, stiffness: 300 });
    }

    if (isHovered && !isRevealed && !isFlipping) {
      // 호버 시 확대 및 오버레이 제거
      cardScale.value = withSpring(1.05, { damping: 15, stiffness: 300 });
      overlayOpacity.value = withSpring(0, { damping: 15, stiffness: 300 });
    } else if (!isRevealed) {
      // 일반 상태로 복원
      cardScale.value = withSpring(1, { damping: 15, stiffness: 300 });
      overlayOpacity.value = withSpring(0.3, { damping: 15, stiffness: 300 });
    }
  }, [isRevealed, isFlipping, isHovered]);

  // 호버 해제 시 원래 상태로 (중복 제거)
  // useEffect(() => {
  //   if (!isHovered && !isRevealed && !isFlipping) {
  //     cardScale.value = withSpring(1, { damping: 15, stiffness: 300 });
  //     overlayOpacity.value = withSpring(0.3, { damping: 15, stiffness: 300 });
  //   }
  // }, [isHovered, isRevealed, isFlipping]);

  const handlePress = () => {
    if (isRevealed || isFlipping) return;
    
    setIsFlipping(true);
    
    // 카드 뒤집기 애니메이션
    rotateY.value = withSequence(
      withTiming(90, { duration: 300 }), // 90도까지 뒤집기
      withTiming(0, { duration: 300 })   // 0도로 돌아오기
    );

    // 0.3초 후 onPress 호출 (카드가 완전히 뒤집힌 순간)
    setTimeout(() => {
      onPress();
    }, 300);
  };

  // 둥둥 떠다니는 스타일
  const floatingStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: floatY.value },
        { scale: cardScale.value },
      ],
    };
  });

  // 오버레이 투명도 스타일
  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: overlayOpacity.value,
    };
  });

  // 카드 뒤집기 스타일
  const flipStyle = useAnimatedStyle(() => {
    const rotateYDeg = `${rotateY.value}deg`;
    
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: rotateYDeg },
      ],
    };
  });

  if (isRevealed && drawResult) {
    // 뒤집힌 후 - 식물 정보 카드
    const plant = {
      name: drawResult.plantType?.name || '신비한 식물',
      currentStage: 1,
      health: 100,
      experience: 0,
      experienceToGrow: 100,
      canGrow: false,
    };

    const plantType = drawResult.plantType;
    const progressPercent = (plant.experience / plant.experienceToGrow) * 100;

    return (
      <Animated.View style={[floatingStyle, { width, height }]}>
        <View className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-200 h-full">
          {/* 식물 이름 헤더 */}
          <View className="bg-yellow-50 px-4 py-2.5 flex-row justify-between items-center border-b border-gray-200">
            <View className="flex-row items-center">
              <Text className="font-bold text-gray-800 text-base">
                {plant.name}
              </Text>
              <View className="bg-yellow-200 rounded-full px-2 py-0.5 ml-2">
                <Text className="text-xs font-medium text-yellow-800">
                  Lv.{plant.currentStage}
                </Text>
              </View>
            </View>

            {/* 희귀도 표시 */}
            <View className="flex-row items-center">
              <MaterialIcons
                name="star"
                size={16}
                color={Colors.light.secondary}
                style={{ marginRight: 4 }}
              />
              <Text className="text-sm font-bold text-yellow-600">
                {drawResult.plantType?.rarity || 'COMMON'}
              </Text>
            </View>
          </View>

          {/* 배경 영역 */}
          <View className="flex-1 w-full items-center justify-center bg-blue-50 py-8">
            {/* 식물 이미지 */}
            <View className="mb-4">
              <View className="bg-primary/10 p-8 rounded-full">
                <MaterialIcons
                  name="eco"
                  size={60}
                  color={Colors.light.primary}
                />
              </View>
            </View>

            {/* 새 획득 메시지 */}
            {!drawResult.isDuplicate && (
              <View className="bg-green-100 px-3 py-1 rounded-full mb-2">
                <Text className="text-green-800 text-xs font-bold">
                  NEW!
                </Text>
              </View>
            )}
          </View>

          {/* 식물 정보 영역 */}
          <View className="p-4 bg-white">
            {/* 식물 정보 */}
            <View className="mb-2 pb-2 border-b border-gray-100">
              <Text className="text-sm text-gray-500">
                {plantType?.category || '씨앗'} • Lv.{plant.currentStage}
              </Text>
            </View>

            {/* 설명 */}
            <Text className="text-sm text-gray-600 mb-3">
              {plantType?.description || '새로운 식물을 발견했습니다!'}
            </Text>

            {/* HP 바 */}
            <View className="mb-3">
              <View className="flex-row items-center justify-between mb-1">
                <Text
                  className="text-xs font-bold"
                  style={{ color: Colors.light.error }}
                >
                  HP
                </Text>
                <Text
                  className="text-xs font-medium"
                  style={{ color: Colors.light.error }}
                >
                  {plant.health}/100
                </Text>
              </View>

              <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${plant.health}%`,
                    backgroundColor: Colors.light.error,
                  }}
                />
              </View>
            </View>

            {/* 경험치 진행 바 */}
            <View className="mb-2">
              <View className="flex-row justify-between mb-1">
                <Text className="text-xs font-medium text-gray-600">
                  경험치
                </Text>
                <Text
                  className="text-xs font-medium"
                  style={{ color: Colors.light.primary }}
                >
                  {plant.experience}/{plant.experienceToGrow}
                </Text>
              </View>

              <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: Colors.light.primary,
                  }}
                />
              </View>
            </View>

            {/* 상태 메시지 */}
            <Text className="text-xs text-center text-gray-500">
              {drawResult.isDuplicate 
                ? `이미 보유한 식물입니다. 경험치 +${drawResult.experienceGained || 10}` 
                : '새로운 식물을 획득했습니다!'}
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  }

  // 기본 상태 - 미스테리 카드
  return (
    <Pressable 
      onPress={handlePress} 
      onPressIn={() => setIsHovered(true)}
      onPressOut={() => setIsHovered(false)}
      style={{ width, height }}
    >
      <Animated.View style={[floatingStyle, flipStyle, { width, height }]}>
        {/* 카드 뒷면 이미지 */}
        <Image
          source={require('../../assets/images/card/basic_card.png')}
          style={{ 
            width, 
            height, 
            borderRadius: 16,
          }}
          resizeMode="cover"
        />
        
        {/* 카드 위 오버레이 */}
        <Animated.View 
          style={[
            overlayStyle,
            {
              position: 'absolute',
              width,
              height,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 16,
            }
          ]}
        >
          <Text style={{ 
            color: '#ffffff', 
            fontWeight: 'bold', 
            fontSize: 18,
            textShadowColor: '#000',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 3,
          }}>
            터치하여 열기
          </Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

export default MysteryCard;