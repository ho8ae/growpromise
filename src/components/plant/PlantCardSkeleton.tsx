// components/plant/PlantCardSkeleton.tsx
import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';

interface PlantCardSkeletonProps {
  width?: number;
  height?: number;
}

const { width: screenWidth } = Dimensions.get('window');

const PlantCardSkeleton: React.FC<PlantCardSkeletonProps> = ({ 
  width = screenWidth - 50, 
  height 
}) => {
  // 애니메이션 효과를 위한 값
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  
  // 실제 높이 계산 (width 기준으로 비율 유지)
  const cardHeight = height || width * 1.4;
  
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
    <View 
      style={{ width, aspectRatio: 0.7 }}
      className="mx-auto bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-100"
    >
      {/* 헤더 스켈레톤 */}
      <View className="bg-yellow-50 px-4 py-2 flex-row justify-between items-center border-b border-gray-200">
        <View className="flex-row items-center">
          <Animated.View 
            className="bg-gray-200 h-6 w-24 rounded-md"
            style={animatedStyle}
          />
          <Animated.View 
            className="bg-gray-200 h-4 w-10 rounded-full ml-2"
            style={animatedStyle}
          />
        </View>
        
        <Animated.View 
          className="bg-gray-200 h-5 w-12 rounded-md"
          style={animatedStyle}
        />
      </View>
      
      {/* 식물 이미지 영역 스켈레톤 */}
      <View className="w-full h-[50%] items-center justify-center bg-blue-50">
        <Animated.View 
          className="bg-gray-200 h-32 w-32 rounded-full"
          style={animatedStyle}
        />
      </View>
      
      {/* 식물 정보 영역 스켈레톤 */}
      <View className="p-3 bg-white border-t border-gray-200">
        {/* 카테고리 & 레벨 */}
        <Animated.View 
          className="bg-gray-200 h-4 w-32 rounded-md mb-3"
          style={animatedStyle}
        />
        
        {/* 식물 이름 */}
        <Animated.View 
          className="bg-gray-200 h-6 w-40 rounded-md mb-4"
          style={animatedStyle}
        />
        
        {/* HP 바 */}
        <View className="mt-4 mb-3">
          <View className="flex-row items-center justify-between mb-1">
            <Animated.View 
              className="bg-gray-200 h-3 w-8 rounded-md"
              style={animatedStyle}
            />
            <Animated.View 
              className="bg-gray-200 h-3 w-10 rounded-md"
              style={animatedStyle}
            />
          </View>
          
          <Animated.View 
            className="h-2 bg-gray-200 rounded-full"
            style={animatedStyle}
          />
        </View>
        
        {/* 경험치 바 */}
        <View className="mt-2 mb-1">
          <View className="flex-row justify-between mb-1">
            <Animated.View 
              className="bg-gray-200 h-3 w-10 rounded-md"
              style={animatedStyle}
            />
            <Animated.View 
              className="bg-gray-200 h-3 w-14 rounded-md"
              style={animatedStyle}
            />
          </View>
          
          <Animated.View 
            className="h-2 bg-gray-200 rounded-full"
            style={animatedStyle}
          />
        </View>
      </View>
    </View>
  );
};

export default PlantCardSkeleton;