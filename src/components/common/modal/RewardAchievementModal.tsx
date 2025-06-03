// components/common/RewardAchievementModal.tsx
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  Text,
  View,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface RewardAchievementModalProps {
  visible: boolean;
  onClose: () => void;
  rewardTitle: string;
  stickerCount: number;
}

const RewardAchievementModal: React.FC<RewardAchievementModalProps> = ({
  visible,
  onClose,
  rewardTitle,
  stickerCount,
}) => {
  // 애니메이션 값들
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const starAnim1 = useRef(new Animated.Value(0)).current;
  const starAnim2 = useRef(new Animated.Value(0)).current;
  const starAnim3 = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // 햅틱 피드백
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // 메인 모달 애니메이션
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();

      // 별 애니메이션 (순차적으로)
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(starAnim1, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(starAnim2, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(starAnim3, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }, 300);

      // 바운스 애니메이션 (반복)
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, 800);

      // 컨페티 애니메이션
      setTimeout(() => {
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }).start();
      }, 500);
    } else {
      // 리셋
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.3);
      bounceAnim.setValue(0);
      starAnim1.setValue(0);
      starAnim2.setValue(0);
      starAnim3.setValue(0);
      confettiAnim.setValue(0);
    }
  }, [visible]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: fadeAnim,
        }}
      >
        {/* 컨페티 효과 */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            transform: [
              {
                translateY: confettiAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 600],
                }),
              },
            ],
          }}
        >
          {[...Array(20)].map((_, index) => (
            <Animated.View
              key={index}
              style={{
                position: 'absolute',
                left: Math.random() * width,
                top: Math.random() * 100,
                width: 8,
                height: 8,
                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][
                  Math.floor(Math.random() * 5)
                ],
                borderRadius: 4,
                transform: [
                  {
                    rotate: confettiAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '720deg'],
                    }),
                  },
                ],
              }}
            />
          ))}
        </Animated.View>

        {/* 메인 모달 */}
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
          }}
          className="bg-white rounded-3xl p-6 mx-6 items-center shadow-2xl"
        >
          {/* 별 장식 */}
          <View className="flex-row justify-center mb-4">
            <Animated.View
              style={{
                opacity: starAnim1,
                transform: [
                  {
                    scale: starAnim1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1.2],
                    }),
                  },
                ],
              }}
            >
              <MaterialIcons name="star" size={32} color="#FFD700" />
            </Animated.View>
            <Animated.View
              style={{
                opacity: starAnim2,
                transform: [
                  {
                    scale: starAnim2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1.5],
                    }),
                  },
                ],
              }}
              className="mx-2"
            >
              <MaterialIcons name="star" size={40} color="#FFD700" />
            </Animated.View>
            <Animated.View
              style={{
                opacity: starAnim3,
                transform: [
                  {
                    scale: starAnim3.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1.2],
                    }),
                  },
                ],
              }}
            >
              <MaterialIcons name="star" size={32} color="#FFD700" />
            </Animated.View>
          </View>

          {/* 트로피 아이콘 */}
          <Animated.View
            style={{
              transform: [
                {
                  translateY: bounceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -3],
                  }),
                },
                {
                  scale: bounceAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.1, 1],
                  }),
                },
              ],
            }}
            className="bg-yellow-100 p-6 rounded-full mb-6"
          >
            <MaterialIcons name="emoji-events" size={60} color="#FFD700" />
          </Animated.View>

          {/* 메인 텍스트 */}
          <Text className="text-3xl font-bold text-center text-gray-800 mb-2">
             축하해요!
          </Text>
          
          <Text className="text-xl font-bold text-center text-emerald-600 mb-4">
            보상 달성 완료!
          </Text>

          {/* 보상 정보 */}
          <View className="bg-emerald-50 rounded-2xl p-4 mb-6 w-full">
            <Text className="text-lg font-bold text-center text-emerald-800 mb-2">
              {rewardTitle}
            </Text>
            <View className="flex-row justify-center items-center">
              <Text className="text-emerald-700 font-medium ml-2">
                {stickerCount}개 사용
              </Text>
            </View>
          </View>

          {/* 안내 메시지 */}
          <View className="rounded-2xl p-4 mb-6 w-full">
            <View className="flex-row items-center justify-center mb-2">
              <MaterialIcons name="family-restroom" size={24} color="#2B70C9" />
              <Text className="text-lg font-bold text-blue-800 ml-2">
                부모님에게 보여주세요!
              </Text>
            </View>
            <Text className="text-blue-700 text-center">
              멋진 약속 지키기를 통해 보상을 받았어요.{'\n'}
              부모님께 자랑해보세요! 👨‍👩‍👧‍👦
            </Text>
          </View>

          {/* 확인 버튼 */}
          <Pressable
            className="bg-emerald-500 px-8 py-4 rounded-2xl w-full"
            onPress={handleClose}
          >
            <Text className="text-white text-lg font-bold text-center">
              네, 알겠어요! 
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default RewardAchievementModal;