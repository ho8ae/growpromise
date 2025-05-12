// src/components/notification/ExperienceNotification.tsx (새 파일)
import React, { useEffect, useState } from 'react';
import { View, Text, Animated, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import Colors from '../../constants/Colors';


// 경험치 알림 타입 정의
type ExperienceNotification = {
  id: string;
  title: string;
  message: string;
  experienceAmount: number;
  timestamp: Date;
  read: boolean;
};

type ExperienceNotificationProps = {
  notification: ExperienceNotification;
  onDismiss: (id: string) => void;
};

const ExperienceNotificationToast: React.FC<ExperienceNotificationProps> = ({
  notification,
  onDismiss,
}) => {
  const [animation] = useState(new Animated.Value(0));
  
  useEffect(() => {
    // 알림이 올라오는 애니메이션
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // 5초 동안 표시
      Animated.delay(5000),
      // 알림이 내려가는 애니메이션
      Animated.timing(animation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 애니메이션 완료 후 알림 제거
      onDismiss(notification.id);
    });
    
    // 진동 피드백
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);
  
  const handlePress = () => {
    // 알림 누를 때 진동 피드백
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss(notification.id);
  };
  
  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        transform: [
          {
            translateY: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [-100, 0],
            }),
          },
        ],
        opacity: animation,
        zIndex: 1000,
      }}
    >
      <BlurView intensity={30} tint="light" className="rounded-xl overflow-hidden">
        <Pressable
          className="bg-white/90 p-4 rounded-xl border border-emerald-200 shadow-lg"
          onPress={handlePress}
        >
          <View className="flex-row items-center mb-2">
            <MaterialIcons name="check-circle" size={20} color={Colors.light.leafGreen} />
            <Text className="ml-2 font-bold text-emerald-700">{notification.title}</Text>
            <View className="flex-1" />
            <MaterialIcons name="close" size={18} color="#9ca3af" />
          </View>
          
          <Text className="text-gray-700 mb-2">{notification.message}</Text>
          
          <View className="flex-row items-center bg-emerald-50 p-2 rounded-lg">
            <MaterialIcons name="auto-fix-high" size={16} color={Colors.light.leafGreen} />
            <Text className="ml-1 font-bold text-emerald-700">+{notification.experienceAmount} 경험치 획득!</Text>
          </View>
        </Pressable>
      </BlurView>
    </Animated.View>
  );
};

export default ExperienceNotificationToast;