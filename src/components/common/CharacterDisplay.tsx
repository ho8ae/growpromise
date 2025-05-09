// components/common/CharacterDisplay.tsx
import React, { useEffect } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { usePulseAnimation } from '../../utils/animations';
import Colors from '../../constants/Colors';

interface CharacterDisplayProps {
  characterStage: number; // 1-4 사이의 성장 단계
  completedPromises: number;
  totalPromises: number;
  userType: string;
}

export default function CharacterDisplay({
  characterStage = 1,
  completedPromises = 0,
  totalPromises = 5,
  userType = 'child',
}: CharacterDisplayProps) {
  const router = useRouter();
  const { animation, startAnimation } = usePulseAnimation();
  
  useEffect(() => {
    startAnimation();
  }, []);
  
  const getCharacterImage = () => {
    // 실제 구현 시 각 단계별 이미지로 변경 필요
    switch(characterStage) {
      case 1: return require('../../assets/images/react-logo.png');
      case 2: return require('../../assets/images/react-logo.png');
      case 3: return require('../../assets/images/react-logo.png');
      case 4: return require('../../assets/images/react-logo.png');
      default: return require('../../assets/images/react-logo.png');
    }
  };
  
  const getStageName = () => {
    switch(characterStage) {
      case 1: return '씨앗';
      case 2: return '새싹';
      case 3: return '어린 식물';
      case 4: return '꽃';
      default: return '씨앗';
    }
  };
  
  const handleCharacterPress = () => {
    if (userType === 'child') {
      router.push('/(child)');
    } else {
      router.push('/(parent)');
    }
  };
  
  const progressPercentage = totalPromises > 0 
    ? (completedPromises / totalPromises) * 100 
    : 0;
  
  return (
    <View className="items-center justify-center py-6">
      <Text className="text-lg font-medium text-center mb-3 text-amber-700">
        내 식물 ({getStageName()})
      </Text>
      
      <Pressable 
        onPress={handleCharacterPress}
        className="mb-5"
      >
        {/* 화분과 식물 효과 */}
        <View className="items-center">
          {/* 식물 */}
          <Animated.View 
            style={{
              transform: [{ scale: animation }],
            }}
          >
            <Image
              source={getCharacterImage()}
              style={{ width: 160, height: 160 }}
              contentFit="contain"
            />
          </Animated.View>
          
          {/* 화분 */}
          <View className="bg-amber-200 w-[120] h-[60] rounded-t-full absolute bottom-[-15]" />
          <View className="bg-amber-700 w-[140] h-[30] rounded-t-full absolute bottom-[-30]" />
          
          {/* 표정 효과 (캐릭터 단계에 따라 다르게 표현 가능) */}
          {characterStage >= 2 && (
            <>
              <View className="absolute top-[80] left-[60] w-[12] h-[12] rounded-full bg-zinc-800" />
              <View className="absolute top-[80] right-[60] w-[12] h-[12] rounded-full bg-zinc-800" />
              <View className="absolute top-[100] left-[70] w-[20] h-[8] rounded-full bg-zinc-800" />
            </>
          )}
        </View>
      </Pressable>
      
      {/* 진행도 표시 */}
      <View className="w-full px-8">
        <Text className="text-amber-700 mb-2 text-sm font-medium">성장 진행도</Text>
        <View className="w-full h-5 bg-emerald-100 rounded-full overflow-hidden border border-emerald-200 shadow-sm">
          <View 
            className="h-full bg-emerald-400 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
          
          {/* 약속 성취 마일스톤 표시 */}
          {[25, 50, 75].map(milestone => (
            <View 
              key={milestone}
              className="absolute top-0 bottom-0 w-[2] bg-white"
              style={{ left: `${milestone}%` }}
            />
          ))}
        </View>
        
        <View className="flex-row justify-between mt-2">
          <View className="items-center">
            <FontAwesome5 name="seedling" size={14} color={Colors.light.leafGreen} />
            <Text className="text-xs text-emerald-700 mt-1">씨앗</Text>
          </View>
          <View className="items-center">
            <FontAwesome5 name="leaf" size={14} color={Colors.light.leafGreen} />
            <Text className="text-xs text-emerald-700 mt-1">새싹</Text>
          </View>
          <View className="items-center">
            <FontAwesome5 name="tree" size={14} color={Colors.light.leafGreen} />
            <Text className="text-xs text-emerald-700 mt-1">식물</Text>
          </View>
          <View className="items-center">
            <FontAwesome5 name="tree" size={14} color={Colors.light.flowerPink} />
            <Text className="text-xs text-emerald-700 mt-1">꽃</Text>
          </View>
        </View>
        
        <Text className="text-center mt-3 text-emerald-700 font-medium">
          {completedPromises}/{totalPromises} 약속 완료
        </Text>
      </View>
    </View>
  );
}