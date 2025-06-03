// src/components/common/Toast.tsx
import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { Animated, Text, View } from 'react-native';
import { ToastType } from '../../hooks/useToast';

interface ToastProps {
  visible: boolean;
  message: string;
  type: ToastType;
  translateY: Animated.Value;
  opacity: Animated.Value;
  onHide: () => void;
}

const getToastConfig = (type: ToastType) => {
  switch (type) {
    case 'success':
      return {
        bgColor: 'bg-green-500',
        icon: 'check-circle',
        iconColor: 'white',
      };
    case 'error':
      return {
        bgColor: 'bg-red-500',
        icon: 'exclamation-circle',
        iconColor: 'white',
      };
    case 'warning':
      return {
        bgColor: 'bg-yellow-500',
        icon: 'exclamation-triangle',
        iconColor: 'white',
      };
    case 'info':
      return {
        bgColor: 'bg-blue-500',
        icon: 'info-circle',
        iconColor: 'white',
      };
    default:
      return {
        bgColor: 'bg-gray-500',
        icon: 'info-circle',
        iconColor: 'white',
      };
  }
};

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type,
  translateY,
  opacity,
}) => {
  if (!visible) return null;

  const config = getToastConfig(type);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: -30,
        left: 20,
        right: 20,
        zIndex: 1000,
        transform: [{ translateY }],
        opacity,
      }}
      className={`p-4 rounded-xl shadow-lg ${config.bgColor}`}
    >
      <View className="flex-row items-center">
        <FontAwesome5
          name={config.icon}
          size={20}
          color={config.iconColor}
        />
        <Text className="text-white font-medium ml-3 flex-1">{message}</Text>
      </View>
    </Animated.View>
  );
};