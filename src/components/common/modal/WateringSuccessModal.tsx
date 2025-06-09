// components/common/WateringSuccessModal.tsx
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface WateringSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  wateringStreak: number;
  healthGain: number;
  newHealth: number;
}

const WateringSuccessModal: React.FC<WateringSuccessModalProps> = ({
  visible,
  onClose,
  wateringStreak,
  healthGain,
  newHealth,
}) => {
  // 애니메이션 값들
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const waterDropAnim = useRef(new Animated.Value(0)).current;
  const plantGrowAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const healthBarAnim = useRef(new Animated.Value(0)).current;

  // 물방울 애니메이션 값들 (여러 개)
  const waterDrops = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

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

      // 물방울 떨어지는 애니메이션 (순차적으로)
      setTimeout(() => {
        waterDrops.forEach((drop, index) => {
          setTimeout(() => {
            Animated.timing(drop, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }).start();
          }, index * 100);
        });
      }, 300);

      // 식물 성장 애니메이션
      setTimeout(() => {
        Animated.timing(plantGrowAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }, 800);

      // 반짝이 효과
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(sparkleAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(sparkleAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, 1000);

      // 체력바 애니메이션
      setTimeout(() => {
        Animated.timing(healthBarAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }).start();
      }, 1200);

    } else {
      // 리셋
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.3);
      waterDropAnim.setValue(0);
      plantGrowAnim.setValue(0);
      sparkleAnim.setValue(0);
      healthBarAnim.setValue(0);
      waterDrops.forEach(drop => drop.setValue(0));
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
        {/* 메인 모달 */}
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
          }}
          className="bg-white rounded-3xl p-6 mx-6 items-center shadow-2xl relative overflow-hidden"
        >
      

          {/* 메인 아이콘 */}
          <Animated.View
            style={{
              transform: [
                {
                  scale: plantGrowAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.8, 1.2, 1],
                  }),
                },
              ],
            }}
            className="bg-blue-100 p-6 rounded-full mb-4"
          >
            <Text style={{ fontSize: 48 }}>💧</Text>
          </Animated.View>

          {/* 메인 텍스트 */}
          <Text className="text-2xl font-bold text-center text-gray-800 mb-2">
            물주기 성공!
          </Text>
          
          <Text className="text-lg text-center text-blue-600 mb-4">
            식물이 무럭무럭 자라고 있어요!
          </Text>

          {/* 통계 정보 */}
          <View className=" rounded-2xl p-4 mb-4 w-full">
            {/* 연속 물주기 */}
            {wateringStreak > 1 && (
              <View className="flex-row items-center justify-center mb-3">
                <Text className="text-lg font-bold text-blue-800 ml-2">
                  연속 {wateringStreak}일째!
                </Text>
              </View>
            )}

            {/* 체력 증가 */}
            <View className="mb-3">
              <Text className="text-center text-blue-700 font-medium mb-2">
                건강도 +{healthGain}% 증가!
              </Text>
              
              {/* 체력바 애니메이션 */}
              <View className="bg-gray-200 h-3 rounded-full overflow-hidden">
                <Animated.View
                  style={{
                    width: healthBarAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', `${newHealth}%`],
                    }),
                    height: '100%',
                    backgroundColor: newHealth >= 80 ? '#10B981' : newHealth >= 50 ? '#F59E0B' : '#EF4444',
                    borderRadius: 999,
                  }}
                />
              </View>
              
              <Text className="text-center text-sm text-blue-600 mt-1">
                현재 건강도: {newHealth}%
              </Text>
            </View>
          </View>

          {/* 격려 메시지 */}
          <View className="bg-green-50 rounded-2xl p-4 mb-6 w-full">
            <Text className="text-green-700 text-center font-medium">
              {wateringStreak > 5 
                ? "대단해요! 꾸준히 식물을 돌보고 있네요! "
                : wateringStreak > 1 
                ? "연속으로 물을 주고 있어요! 계속 해보세요! "
                : "식물이 물을 마시고 기뻐해요! 내일도 잊지 말아요! "
              }
            </Text>
          </View>

          {/* 확인 버튼 */}
          <Pressable
            className="bg-blue-500 px-8 py-4 rounded-2xl w-full"
            onPress={handleClose}
          >
            <Text className="text-white text-lg font-bold text-center">
              돌아가기
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default WateringSuccessModal;