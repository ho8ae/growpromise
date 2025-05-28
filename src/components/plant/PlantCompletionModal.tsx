// src/components/plant/PlantCompletionModal.tsx
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Dimensions, Image, Modal, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { GrowthResult, Plant } from '../../api/modules/plant';
import { useNavigation } from '../../providers/NavigationProvider';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface PlantCompletionModalProps {
  visible: boolean;
  plant: Plant;
  growthResult: GrowthResult;
  onClose: () => void;
  onContinue: () => void;
}

export const PlantCompletionModal: React.FC<PlantCompletionModalProps> = ({
  visible,
  plant,
  growthResult,
  onClose,
  onContinue,
}) => {
  const { navigateToHome, navigateToCollection } = useNavigation();

  // 변경
const handleConfirm = () => {
    console.log('🎉 Plant completion modal confirm');
    
    const isCompleted = growthResult.isCompleted || growthResult.isMaxStage;
    
    // 모달 먼저 닫기
    if (isCompleted) {
      onContinue(); // 이것이 ModalManager의 hidePlantCompletion을 호출
    } else {
      onClose();
    }
    
    // 완료된 경우에만 홈으로 이동 (ModalManager에서 처리하도록)
  };

  // 애니메이션 값들
  const modalScale = useSharedValue(0);
  const plantScale = useSharedValue(0.3);
  const starsOpacity = useSharedValue(0);
  const textScale = useSharedValue(0);
  const buttonScale = useSharedValue(0);

  // 별 애니메이션을 위한 개별 값들
  const star1Scale = useSharedValue(0);
  const star2Scale = useSharedValue(0);
  const star3Scale = useSharedValue(0);
  const star4Scale = useSharedValue(0);
  const star5Scale = useSharedValue(0);

  // 모달 표시 애니메이션
  useEffect(() => {
    if (visible) {
      // 초기화
      modalScale.value = 0;
      plantScale.value = 0.3;
      starsOpacity.value = 0;
      textScale.value = 0;
      buttonScale.value = 0;
      star1Scale.value = 0;
      star2Scale.value = 0;
      star3Scale.value = 0;
      star4Scale.value = 0;
      star5Scale.value = 0;

      // 순차 애니메이션
      setTimeout(() => {
        // 1. 모달 등장
        modalScale.value = withSpring(1, { damping: 15, stiffness: 150 });

        // 2. 식물 등장 (조금 더 큰 바운스)
        setTimeout(() => {
          plantScale.value = withSpring(1, { damping: 12, stiffness: 100 });
        }, 200);

        // 3. 별들 순차 등장 (더 귀엽게)
        setTimeout(() => {
          star1Scale.value = withSpring(1, { damping: 10, stiffness: 200 });
          setTimeout(() => {
            star2Scale.value = withSpring(1, { damping: 10, stiffness: 200 });
          }, 100);
          setTimeout(() => {
            star3Scale.value = withSpring(1, { damping: 10, stiffness: 200 });
          }, 200);
          setTimeout(() => {
            star4Scale.value = withSpring(1, { damping: 10, stiffness: 200 });
          }, 300);
          setTimeout(() => {
            star5Scale.value = withSpring(1, { damping: 10, stiffness: 200 });
          }, 400);
        }, 600);

        // 4. 텍스트 등장
        setTimeout(() => {
          textScale.value = withSpring(1, { damping: 15, stiffness: 150 });
        }, 1200);

        // 5. 버튼 등장
        setTimeout(() => {
          buttonScale.value = withSpring(1, { damping: 15, stiffness: 150 });
        }, 1400);
      }, 100);
    } else {
      // 모달 닫기
      modalScale.value = withTiming(0, { duration: 200 });
      plantScale.value = 0.3;
      starsOpacity.value = 0;
      textScale.value = 0;
      buttonScale.value = 0;
      star1Scale.value = 0;
      star2Scale.value = 0;
      star3Scale.value = 0;
      star4Scale.value = 0;
      star5Scale.value = 0;
    }
  }, [visible]);

  // 애니메이션 스타일들
  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
    opacity: modalScale.value,
  }));

  const plantAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: plantScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: textScale.value }],
    opacity: textScale.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    opacity: buttonScale.value,
  }));

  const star1AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: star1Scale.value }],
  }));

  const star2AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: star2Scale.value }],
  }));

  const star3AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: star3Scale.value }],
  }));

  const star4AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: star4Scale.value }],
  }));

  const star5AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: star5Scale.value }],
  }));

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/40 justify-center items-center px-8">
        <Animated.View
          style={modalAnimatedStyle}
          className="w-full max-w-xs bg-white rounded-3xl p-8 items-center shadow-2xl"
        >
          {/* 🌟 별 장식들 - 식물 위쪽에 아치형으로 배치 */}
          <View className="relative w-full h-16 mb-4">
            {/* 중앙 별 (가장 큰) */}
            <Animated.View
              style={[
                star3AnimatedStyle,
                { position: 'absolute', top: 0, left: '50%', marginLeft: -16 },
              ]}
            >
              <MaterialIcons name="star" size={32} color="#FFD700" />
            </Animated.View>

            {/* 좌측 별들 */}
            <Animated.View
              style={[
                star2AnimatedStyle,
                { position: 'absolute', top: 8, left: '30%', marginLeft: -12 },
              ]}
            >
              <MaterialIcons name="star" size={24} color="#FFC107" />
            </Animated.View>

            <Animated.View
              style={[
                star1AnimatedStyle,
                { position: 'absolute', top: 20, left: '15%', marginLeft: -10 },
              ]}
            >
              <MaterialIcons name="star" size={20} color="#FF9800" />
            </Animated.View>

            {/* 우측 별들 */}
            <Animated.View
              style={[
                star4AnimatedStyle,
                {
                  position: 'absolute',
                  top: 8,
                  right: '30%',
                  marginRight: -12,
                },
              ]}
            >
              <MaterialIcons name="star" size={24} color="#FFC107" />
            </Animated.View>

            <Animated.View
              style={[
                star5AnimatedStyle,
                {
                  position: 'absolute',
                  top: 20,
                  right: '15%',
                  marginRight: -10,
                },
              ]}
            >
              <MaterialIcons name="star" size={20} color="#FF9800" />
            </Animated.View>
          </View>

          {/* 🌱 식물 이미지 */}
          <Animated.View style={plantAnimatedStyle} className="mb-6">
            <View className="w-32 h-32 bg-green-50 rounded-full items-center justify-center border-4 border-green-100">
              {plant.imageUrl ? (
                <Image
                  source={{ uri: plant.imageUrl }}
                  className="w-24 h-24"
                  resizeMode="contain"
                />
              ) : (
                <Text className="text-6xl">🌱</Text>
              )}
            </View>
          </Animated.View>

          {/* 🎉 완료 텍스트 */}
          <Animated.View
            style={textAnimatedStyle}
            className="items-center mb-8"
          >
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              완성! 🎉
            </Text>
            <Text className="text-gray-600 text-center text-base leading-6">
              <Text className="font-bold text-green-600">
                {plant.name || plant.plantType?.name || '식물'}
              </Text>
              이{'\n'}무럭무럭 자랐어요!
            </Text>
          </Animated.View>

          {/* 🏠 돌아가기 버튼 */}
          <Animated.View style={buttonAnimatedStyle} className="w-full">
            <Pressable
              onPress={handleConfirm}
              className="bg-green-500 rounded-2xl py-4 px-8 items-center active:scale-95 shadow-lg"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <View className="flex-row items-center">
                <MaterialIcons name="home" size={24} color="white" />
                <Text className="text-white font-bold text-lg ml-2">
                  돌아가기
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default PlantCompletionModal;
