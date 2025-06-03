// src/hooks/useToast.ts
import { useRef, useState } from 'react';
import { Animated } from 'react-native';
import * as Haptics from 'expo-haptics';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  duration?: number; // 자동 숨김 시간 (ms)
  haptic?: boolean; // 햅틱 피드백 사용 여부
}

export const useToast = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('success');
  
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<number | null>(null);

  const showToast = (
    text: string, 
    toastType: ToastType = 'success', 
    options: ToastOptions = {}
  ) => {
    const { duration = 3000, haptic = true } = options;

    // 이전 타이머 클리어
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 햅틱 피드백
    if (haptic) {
      switch (toastType) {
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'warning':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        default:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }

    // 상태 업데이트
    setMessage(text);
    setType(toastType);
    setVisible(true);

    // 애니메이션 시작
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // 자동 숨김
    timeoutRef.current = setTimeout(() => {
      hideToast();
    }, duration);
  };

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    });
  };

  // 편의 메서드들
  const success = (text: string, options?: ToastOptions) => {
    showToast(text, 'success', options);
  };

  const error = (text: string, options?: ToastOptions) => {
    showToast(text, 'error', options);
  };

  const warning = (text: string, options?: ToastOptions) => {
    showToast(text, 'warning', options);
  };

  const info = (text: string, options?: ToastOptions) => {
    showToast(text, 'info', options);
  };

  return {
    // 상태
    visible,
    message,
    type,
    translateY,
    opacity,
    
    // 메서드들
    showToast,
    hideToast,
    success,
    error,
    warning,
    info,
  };
};