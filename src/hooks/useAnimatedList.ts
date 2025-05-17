import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

/**
 * 애니메이션 리스트를 관리하는 커스텀 훅
 * 
 * 리스트의 아이템 추가, 제거 시 애니메이션 효과를 제공합니다.
 */
export const useAnimatedList = () => {
  // 각 아이템별 애니메이션 값을 저장하는 ref
  const animatedValues = useRef<{
    [index: number]: {
      opacity: Animated.Value;
      translateX: Animated.Value;
      translateY: Animated.Value;
    }
  }>({}).current;

  // 아이템 제거 애니메이션
  const animateRemove = (index: number, callback?: () => void) => {
    if (!animatedValues[index]) {
      // 애니메이션 값이 없으면 초기화
      animatedValues[index] = {
        opacity: new Animated.Value(1),
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0)
      };
    }

    // 슬라이드 아웃 및 페이드 아웃 애니메이션 실행
    Animated.parallel([
      Animated.timing(animatedValues[index].opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(animatedValues[index].translateX, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true
      })
    ]).start(() => {
      // 애니메이션 완료 후 콜백 실행
      if (callback) callback();
    });
  };

  // 아이템 추가 애니메이션
  const animateAdd = (count: number) => {
    // 새로운 아이템들에 대한 애니메이션 값 초기화
    for (let i = 0; i < count; i++) {
      if (!animatedValues[i]) {
        animatedValues[i] = {
          opacity: new Animated.Value(0),
          translateX: new Animated.Value(100),
          translateY: new Animated.Value(0)
        };

        // 슬라이드 인 및 페이드 인 애니메이션 실행
        Animated.parallel([
          Animated.timing(animatedValues[i].opacity, {
            toValue: 1,
            duration: 300,
            delay: i * 100, // 순차적으로 나타나도록 딜레이 적용
            useNativeDriver: true
          }),
          Animated.timing(animatedValues[i].translateX, {
            toValue: 0,
            duration: 300,
            delay: i * 100,
            useNativeDriver: true
          })
        ]).start();
      }
    }
  };

  // 모든 아이템의 애니메이션 초기화
  const resetAnimations = (count: number) => {
    for (let i = 0; i < count; i++) {
      animatedValues[i] = {
        opacity: new Animated.Value(1),
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0)
      };
    }
  };

  return {
    animatedValues,
    animateRemove,
    animateAdd,
    resetAnimations
  };
};