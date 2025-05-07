// utils/animations.ts
import { useRef } from 'react';
import { Animated, Easing } from 'react-native';

export const useBouncyAnimation = (initialValue = 0) => {
  const animation = useRef(new Animated.Value(initialValue)).current;

  const startAnimation = () => {
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 1,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.spring(animation, {
        toValue: 0,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return { animation, startAnimation };
};

export const usePulseAnimation = (initialValue = 1, duration = 1500) => {
  const animation = useRef(new Animated.Value(initialValue)).current;

  const startAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1.05,
          duration: duration / 2,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0.95,
          duration: duration / 2,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  return { animation, startAnimation };
};

export const useSlideInAnimation = (initialValue = 300, duration = 500) => {
  const animation = useRef(new Animated.Value(initialValue)).current;

  const startAnimation = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  return { animation, startAnimation };
};