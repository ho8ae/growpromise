// components/plant/FooterActionSkeleton.tsx
import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

const FooterActionSkeleton: React.FC = () => {
  // 애니메이션 효과를 위한 값
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  
  // 펄스 애니메이션 실행
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    return () => {
      // 컴포넌트 언마운트 시 애니메이션 중지
      pulseAnim.stopAnimation();
    };
  }, []);
  
  // 애니메이션 스타일
  const animatedStyle = {
    opacity: pulseAnim
  };
  
  return (
    <View className="flex-row justify-center mt-4 pt-2">
      {[0, 1, 2, 3].map((index) => (
        <Animated.View 
          key={index}
          className="mx-2 h-10 w-10 bg-gray-200 rounded-full"
          style={animatedStyle}
        />
      ))}
    </View>
  );
};

export default FooterActionSkeleton;