import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Image } from 'expo-image';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

interface CharacterDisplayProps {
  characterStage: number;
  completedPromises: number;
  totalPromises: number;
  userType: 'parent' | 'child';
}

const CharacterDisplay: React.FC<CharacterDisplayProps> = ({
  characterStage,
  completedPromises,
  totalPromises,
  userType,
}) => {
  // 애니메이션 값 설정
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // 캐릭터 단계에 따른 크기
  const getPlantSize = () => {
    switch (characterStage) {
      case 1: return { width: 60, height: 60 };
      case 2: return { width: 70, height: 70 };
      case 3: return { width: 80, height: 80 };
      case 4: return { width: 90, height: 90 };
      default: return { width: 100, height: 100 };
    }
  };
  
  // 캐릭터 단계에 따른 아이콘
  const getPlantIcon = () => {
    switch (characterStage) {
      case 1: return 'seedling';
      case 2: return 'spa';
      case 3: return 'leaf';
      case 4: return 'tree';
      default: return 'apple-alt';
    }
  };
  
  // 애니메이션 효과
  useEffect(() => {
    // 부드러운 바운스 효과
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -8,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // 미묘한 회전 효과
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // 주기적인 팝 효과
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
      ]).start();
    }, 10000); // 10초마다 실행
    
    return () => clearInterval(interval);
  }, []);
  
  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-5deg', '5deg'],
  });
  
  // 완료율에 따른 색상 그라데이션
  const getProgressColor = () => {
    const percentage = (completedPromises / totalPromises) * 100;
    
    if (percentage <= 20) return ['#fef3c7', '#fbbf24']; // amber-100 to amber-400
    if (percentage <= 40) return ['#e9d5ff', '#c084fc']; // purple-200 to purple-400
    if (percentage <= 60) return ['#bae6fd', '#38bdf8']; // light-blue-200 to light-blue-400
    if (percentage <= 80) return ['#bbf7d0', '#4ade80']; // green-200 to green-400
    return ['#a7f3d0', '#10b981']; // emerald-200 to emerald-500
  };
  
  const progressColors = getProgressColor();
  const plantSize = getPlantSize();
  const plantIcon = getPlantIcon();
  
  return (
    <View className="bg-gradient-to-b from-slate-50 to-white border border-gray-200 rounded-3xl p-6 shadow-md mb-2">
      <View className="items-center justify-center">
        {/* 식물 캐릭터 */}
        <View>
          <Animated.View 
            style={{
              transform: [
                { translateY: bounceAnim },
                { rotate },
                { scale: scaleAnim }
              ]
            }}
            className="items-center justify-center"
          >
            <View 
              className="bg-gradient-to-br from-emerald-400/40 to-emerald-500/30 rounded-full mb-2 items-center justify-center"
              style={{
                width: plantSize.width + 16,
                height: plantSize.height + 16,
              }}
            >
              <FontAwesome5 
                name={plantIcon} 
                size={plantSize.width * 0.7} 
                color={Colors.light.leafGreen} 
              />
            </View>
          </Animated.View>
          
          {/* 식물 화분 */}
          <View className="items-center">
            <View className="w-24 h-5 bg-gradient-to-r from-amber-700 to-amber-600 rounded-t-lg" />
            <View className="w-20 h-12 bg-gradient-to-b from-amber-600 to-amber-500 rounded-b-xl" />
          </View>
        </View>
        
        {/* 진행 정보 */}
        <View className="w-full mt-5">
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600 font-medium">진행률</Text>
            <Text className="text-emerald-600 font-bold">
              {completedPromises}/{totalPromises}
            </Text>
          </View>
          
          {/* 프로그레스 바 */}
          <View className="h-5 bg-gray-100 rounded-full overflow-hidden">
            <View 
              className="h-full rounded-full"
              style={{
                width: `${(completedPromises / totalPromises) * 100}%`,
                backgroundColor: Colors.light.leafGreen,
              }}
            />
          </View>
          
          {/* 레벨 및 타입 정보 */}
          <View className="flex-row justify-between mt-4 items-center">
            <View className="flex-row items-center">
              <View className="bg-amber-100 p-2 rounded-full mr-2">
                <FontAwesome5 name="seedling" size={12} color="#92400e" />
              </View>
              <Text className="text-amber-700 font-bold">
                레벨 {characterStage}
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <Text className="text-emerald-700 font-medium mr-2">
                {userType === 'parent' ? '부모님 모드' : '어린이 모드'}
              </Text>
              <View className="bg-emerald-100 p-2 rounded-full">
                <FontAwesome5 
                  name={userType === 'parent' ? 'user-tie' : 'child'} 
                  size={12} 
                  color={Colors.light.leafGreen} 
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CharacterDisplay;