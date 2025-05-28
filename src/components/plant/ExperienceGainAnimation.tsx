// src/components/plant/ExperienceGainAnimation.tsx

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

type ExperienceGainAnimationProps = {
  amount: number;
  onAnimationComplete?: () => void;
  position?: 'top' | 'center' | 'bottom';
};

const ExperienceGainAnimation: React.FC<ExperienceGainAnimationProps> = ({
  amount,
  onAnimationComplete,
  position = 'center',
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.sequence([
      // 페이드 인
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // 확대
      Animated.timing(scale, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      // 정상 크기로
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      // 잠시 대기
      Animated.delay(1000),
      // 위로 올라가며 사라짐
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    });
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        // 🔧 position 스타일을 별도로 처리
        position === 'top' && styles.topPosition,
        position === 'bottom' && styles.bottomPosition,
        position === 'center' && styles.centerPosition,
        {
          transform: [
            { translateY },
            { scale },
          ],
          opacity,
        },
      ]}
    >
      <FontAwesome5 
        name="star" 
        size={20} 
        color={Colors.light.success} // 🔧 leafGreen → success로 변경
      />
      <Text style={styles.text}>+{amount} 경험치!</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(236, 253, 245, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.success, // 🔧 leafGreen → success로 변경
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  text: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.success, // 🔧 leafGreen → success로 변경
  },
  // 🔧 position 스타일들을 별도로 정의
  topPosition: {
    top: '15%',
  },
  bottomPosition: {
    bottom: '15%',
  },
  centerPosition: {
    top: '45%',
  },
});

export default ExperienceGainAnimation;